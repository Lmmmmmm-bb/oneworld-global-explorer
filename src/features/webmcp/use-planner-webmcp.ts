import { useEffect } from "react"

import type { Itinerary } from "@/features/itinerary"

import type { ToolMode, WebMcpContext } from "./types"

export const usePlannerWebMcp = (
  kind: ToolMode["kind"] | null,
  sharedItinerary?: Itinerary
) => {
  useEffect(() => {
    let mode: ToolMode
    if (kind === "shared") {
      if (!sharedItinerary) return
      mode = { kind, itinerary: sharedItinerary }
    } else if (kind === "local") {
      mode = { kind }
    } else {
      return
    }

    const context =
      (document as Document & { modelContext?: WebMcpContext }).modelContext ??
      (navigator as Navigator & { modelContext?: WebMcpContext }).modelContext
    if (!context?.registerTool) return

    let active = true
    let unregister: (() => void) | undefined

    void import("./register")
      .then(({ registerPlannerTools }) => {
        if (active) unregister = registerPlannerTools(context, mode)
      })
      .catch((error: unknown) => {
        if (active) console.warn("WebMCP tools could not be loaded:", error)
      })

    return () => {
      active = false
      unregister?.()
    }
  }, [kind, sharedItinerary])
}
