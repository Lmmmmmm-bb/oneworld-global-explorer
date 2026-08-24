export { createEmptyItinerary, createFlightSegment } from "./factories"
export { isItinerary } from "./guard"
export { areItinerariesEqual, cloneItinerary } from "./history"
export { flightSegmentSchema, itinerarySchema } from "./schema"
export type { ItineraryChange } from "./history"
export type {
  ArrivalType,
  CabinClass,
  FlightSegment,
  Itinerary,
  ItineraryValidation,
  JourneyMetrics,
  MileageBand,
  MileageBandPreference,
  OpenJawSegment,
  RuleMessage,
  RuleMessageKind,
} from "./types"
