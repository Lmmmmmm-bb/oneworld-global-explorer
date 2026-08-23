import { itinerarySchema } from "./schema"
export { serializeItinerary } from "./serialization"
import type { Itinerary } from "./types"

export type ItineraryImportResult =
  { success: true; itinerary: Itinerary } | { success: false; issues: string[] }

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
