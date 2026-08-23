import type { Itinerary } from "./types"

export const serializeItinerary = (itinerary: Itinerary) =>
  `${JSON.stringify(itinerary, null, 2)}\n`

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
