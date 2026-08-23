import { APP_CONFIG } from "@/config"

import type { FlightSegment, Itinerary } from "./types"

const airportCodePattern = /^[A-Z]{3}$/
const cabinClasses = new Set(["economy", "business", "first"])
const mileageBands = new Set(["auto", 26_000, 29_000, 34_000, 39_000])
const arrivalTypes = new Set(["stopover", "transfer"])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const isFlightSegment = (value: unknown): value is FlightSegment => {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.from === "string" &&
    airportCodePattern.test(value.from) &&
    typeof value.to === "string" &&
    airportCodePattern.test(value.to) &&
    typeof value.marketingCarrier === "string" &&
    value.marketingCarrier.length > 0 &&
    typeof value.isCodeshare === "boolean" &&
    typeof value.operatingCarrier === "string" &&
    (!value.isCodeshare || value.operatingCarrier.length > 0) &&
    typeof value.arrivalType === "string" &&
    arrivalTypes.has(value.arrivalType)
  )
}

export const isItinerary = (value: unknown): value is Itinerary => {
  if (!isRecord(value)) return false

  return (
    value.schemaVersion === APP_CONFIG.schemaVersion &&
    typeof value.cabinClass === "string" &&
    cabinClasses.has(value.cabinClass) &&
    (typeof value.mileageBand === "string" ||
      typeof value.mileageBand === "number") &&
    mileageBands.has(value.mileageBand) &&
    typeof value.endWithOpenJaw === "boolean" &&
    Array.isArray(value.flights) &&
    value.flights.every(isFlightSegment)
  )
}
