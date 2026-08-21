import type { ItineraryChange } from "@/features/itinerary"

const CABIN_LABELS = {
  economy: "Economy",
  business: "Business",
  first: "First",
} as const

export const formatHistoryChange = (change: ItineraryChange): string => {
  switch (change.type) {
    case "flight.add":
      return `Add flight ${change.from} → ${change.to}`
    case "flight.update":
      return `Edit flight ${change.from} → ${change.to}`
    case "flight.delete":
      return `Delete flight ${change.from} → ${change.to}`
    case "cabin.change":
      return `Change cabin to ${CABIN_LABELS[change.cabinClass]}`
    case "mileageBand.change":
      return change.mileageBand === "auto"
        ? "Change mileage band to Auto"
        : `Change mileage band to ${change.mileageBand / 1_000}K`
    case "openJaw.change":
      return `${change.enabled ? "Enable" : "Disable"} ending open jaw`
    case "itinerary.import":
      return "Import itinerary"
    case "itinerary.reset":
      return "Start new itinerary"
  }
}
