import { APP_CONFIG } from "@/config"
import { createFlightSegment, type Itinerary } from "@/features/itinerary"

import type { ItineraryDraft } from "./input"

export const toItinerary = (
  draft: ItineraryDraft,
  preview = false
): Itinerary => ({
  schemaVersion: APP_CONFIG.schemaVersion,
  cabinClass: draft.cabinClass,
  mileageBand: draft.mileageBand,
  endWithOpenJaw: draft.endWithOpenJaw,
  flights: draft.flights.map((flight, index) =>
    createFlightSegment({
      ...(preview ? { id: `preview-flight-${index + 1}` } : {}),
      from: flight.from,
      to: flight.to,
      marketingCarrier: flight.marketingCarrier,
      isCodeshare: flight.isCodeshare,
      operatingCarrier: flight.isCodeshare
        ? flight.operatingCarrier!
        : flight.marketingCarrier,
      arrivalType: flight.arrivalType,
    })
  ),
})

export const revisionOf = async (itinerary: Itinerary) => {
  const bytes = new TextEncoder().encode(JSON.stringify(itinerary))
  const digest = await crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")
}
