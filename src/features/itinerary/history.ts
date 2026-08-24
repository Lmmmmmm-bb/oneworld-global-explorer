import type { CabinClass, Itinerary, MileageBandPreference } from "./types"

interface FlightReference {
  from: string
  to: string
}

export type ItineraryChange =
  | ({ type: "flight.add" } & FlightReference)
  | ({ type: "flight.update" } & FlightReference)
  | ({ type: "flight.delete" } & FlightReference)
  | { type: "cabin.change"; cabinClass: CabinClass }
  | {
      type: "mileageBand.change"
      mileageBand: MileageBandPreference
    }
  | { type: "openJaw.change"; enabled: boolean }
  | { type: "itinerary.copyFromShare" }
  | { type: "itinerary.reset" }

export const cloneItinerary = (itinerary: Itinerary): Itinerary => ({
  ...itinerary,
  flights: itinerary.flights.map((flight) => ({ ...flight })),
})

export const areItinerariesEqual = (
  left: Itinerary,
  right: Itinerary
): boolean => {
  if (
    left.schemaVersion !== right.schemaVersion ||
    left.cabinClass !== right.cabinClass ||
    left.mileageBand !== right.mileageBand ||
    left.endWithOpenJaw !== right.endWithOpenJaw ||
    left.flights.length !== right.flights.length
  ) {
    return false
  }

  return left.flights.every((flight, index) => {
    const other = right.flights[index]
    return (
      other !== undefined &&
      flight.id === other.id &&
      flight.from === other.from &&
      flight.to === other.to &&
      flight.marketingCarrier === other.marketingCarrier &&
      flight.isCodeshare === other.isCodeshare &&
      flight.operatingCarrier === other.operatingCarrier &&
      flight.arrivalType === other.arrivalType
    )
  })
}
