import type { FlightSegment, OpenJawSegment } from "@/features/itinerary"
import type { Airport, EligibleRoute } from "@/features/route-data"

export interface RuleDataContext {
  airportByIata: Map<string, Airport>
  getRoute: (from: string, to: string) => EligibleRoute | undefined
}

export interface JourneyLeg {
  id: string
  kind: "flight" | "open-jaw"
  from: Airport
  to: Airport
  distanceMiles: number
  flight?: FlightSegment
  openJaw?: OpenJawSegment
}

export interface DerivedJourney {
  legs: JourneyLeg[]
  openJaws: OpenJawSegment[]
  flightMiles: number
  openJawMiles: number
  totalMiles: number
}
