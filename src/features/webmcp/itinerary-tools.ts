import { cloneItinerary } from "@/features/itinerary"
import { validateItinerary } from "@/features/rules"
import { createBrowserShareUrl } from "@/features/sharing/url"
import { useItineraryStore } from "@/stores"

import {
  emptyInputSchema,
  emptyJsonSchema,
  inputError,
  previewInputSchema,
  previewJsonSchema,
  saveInputSchema,
  saveJsonSchema,
} from "./input"
import { revisionOf, toItinerary } from "./itinerary"
import type { ToolMode, WebMcpTool } from "./types"

export const createItineraryTools = (
  mode: ToolMode,
  lifecycleSignal?: AbortSignal
): WebMcpTool[] => {
  const currentItinerary = () =>
    mode.kind === "shared"
      ? cloneItinerary(mode.itinerary)
      : cloneItinerary(useItineraryStore.getState().itinerary)

  const tools: WebMcpTool[] = [
    {
      name: "get_itinerary",
      title: "Read displayed itinerary",
      description:
        mode.kind === "shared"
          ? "Read and validate the shared itinerary displayed on this page. This page is read-only."
          : "Read the current browser-local itinerary, validation, and revision needed to save an edited plan without overwriting a newer change.",
      inputSchema: emptyJsonSchema,
      annotations: { readOnlyHint: true },
      execute: async (input) => {
        const parsed = emptyInputSchema.safeParse(input ?? {})
        if (!parsed.success) return inputError(parsed.error)
        const itinerary = currentItinerary()
        return {
          success: true,
          mode: mode.kind,
          itinerary,
          validation: validateItinerary(itinerary),
          ...(mode.kind === "local"
            ? { revision: await revisionOf(itinerary) }
            : {}),
        }
      },
    },
    {
      name: "preview_itinerary",
      title: "Preview itinerary rules",
      description:
        "Validate a proposed itinerary against this planner's route snapshot and implemented Global Explorer rules without saving it. Valid does not confirm availability, pricing, or ticketing.",
      inputSchema: previewJsonSchema,
      annotations: { readOnlyHint: true },
      execute: (input) => {
        const parsed = previewInputSchema.safeParse(input)
        if (!parsed.success) return inputError(parsed.error)
        return {
          success: true,
          validation: validateItinerary(toItinerary(parsed.data.draft, true)),
          previewFlightIds: parsed.data.draft.flights.map(
            (_, index) => `preview-flight-${index + 1}`
          ),
        }
      },
    },
  ]

  if (mode.kind === "local") {
    tools.push(
      {
        name: "save_itinerary",
        title: "Save itinerary in this browser",
        description:
          "Replace the browser-local itinerary with the supplied draft as one undoable edit. Requires the revision from get_itinerary; returns a conflict if the user changed the plan since then. May save an incomplete or rule-invalid draft. Does not book or send data anywhere.",
        inputSchema: saveJsonSchema,
        annotations: { readOnlyHint: false },
        execute: async (input, options) => {
          const parsed = saveInputSchema.safeParse(input)
          if (!parsed.success) return inputError(parsed.error)

          const before = useItineraryStore.getState().itinerary
          const snapshot = JSON.stringify(before)
          const revision = await revisionOf(before)
          if (
            revision !== parsed.data.expectedRevision ||
            JSON.stringify(useItineraryStore.getState().itinerary) !== snapshot
          ) {
            return {
              success: false,
              code: "revision_conflict",
              message:
                "The local itinerary changed. Read it again before saving.",
            }
          }

          if (options?.signal?.aborted || lifecycleSignal?.aborted) {
            return { success: false, code: "cancelled" }
          }

          const itinerary = toItinerary(parsed.data.draft)
          useItineraryStore.getState().replaceFromAgent(itinerary)
          const saved = cloneItinerary(useItineraryStore.getState().itinerary)
          return {
            success: true,
            itinerary: saved,
            revision: await revisionOf(saved),
            validation: validateItinerary(saved),
            undoable: true,
          }
        },
      },
      {
        name: "create_share_link",
        title: "Create read-only share link",
        description:
          "Create a URL containing the current local itinerary for read-only viewing. Anyone with the link can read the embedded plan. This only returns the URL; it does not copy, send, or upload it.",
        inputSchema: emptyJsonSchema,
        annotations: { readOnlyHint: true },
        execute: (input) => {
          const parsed = emptyInputSchema.safeParse(input ?? {})
          if (!parsed.success) return inputError(parsed.error)
          return createBrowserShareUrl(currentItinerary())
        },
      }
    )
  }

  return tools
}
