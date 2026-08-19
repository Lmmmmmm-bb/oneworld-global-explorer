import { itinerarySchema } from "./schema"
import type { Itinerary } from "./types"

export type ItineraryImportResult =
  { success: true; itinerary: Itinerary } | { success: false; issues: string[] }

export const serializeItinerary = (itinerary: Itinerary) =>
  `${JSON.stringify(itinerarySchema.parse(itinerary), null, 2)}\n`

export const parseItineraryJson = (source: string): ItineraryImportResult => {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    return { success: false, issues: ["The selected file is not valid JSON."] }
  }

  const result = itinerarySchema.safeParse(value)
  if (result.success) return { success: true, itinerary: result.data }

  return {
    success: false,
    issues: result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : ""
      return `${path}${issue.message}`
    }),
  }
}

export const downloadItineraryJson = (itinerary: Itinerary) => {
  const blob = new Blob([serializeItinerary(itinerary)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = "global-explorer-itinerary.json"
  anchor.click()
  URL.revokeObjectURL(url)
}
