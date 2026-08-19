import type { AppStatus } from "@/types"

export type CabinClass = "economy" | "business" | "first"
export type MileageBand = 26_000 | 29_000 | 34_000 | 39_000
export type MileageBandPreference = "auto" | MileageBand
export type ArrivalType = "stopover" | "transfer"

export interface FlightSegment {
  id: string
  from: string
  to: string
  marketingCarrier: string
  isCodeshare: boolean
  operatingCarrier: string
  arrivalType: ArrivalType
}

export interface Itinerary {
  schemaVersion: 1
  cabinClass: CabinClass
  mileageBand: MileageBandPreference
  endWithOpenJaw: boolean
  flights: FlightSegment[]
}

export interface OpenJawSegment {
  id: string
  from: string
  to: string
  afterFlightId: string
  beforeFlightId: string | null
  isOriginDestination: boolean
  distanceMiles: number
}

export type RuleMessageKind = "violation" | "incomplete" | "warning"

export interface RuleMessage {
  id: string
  rule: string
  kind: RuleMessageKind
  title: string
  description: string
  segmentIds?: string[]
}

export interface JourneyMetrics {
  flightCount: number
  openJawCount: number
  segmentCount: number
  flightMiles: number
  openJawMiles: number
  totalMiles: number
  selectedBand: MileageBand | null
  remainingMiles: number | null
  stopoverCount: number
  atlanticCrossings: number
  pacificCrossings: number
  regionPath: string[]
}

export interface ItineraryValidation {
  status: AppStatus
  violations: RuleMessage[]
  incomplete: RuleMessage[]
  warnings: RuleMessage[]
  openJaws: OpenJawSegment[]
  metrics: JourneyMetrics
}
