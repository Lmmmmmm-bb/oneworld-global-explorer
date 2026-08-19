import { APP_CONFIG } from "@/config"
import { createId } from "@/utils"

import type { FlightSegment, Itinerary } from "./types"

export const createEmptyItinerary = (): Itinerary => ({
  schemaVersion: APP_CONFIG.schemaVersion,
  cabinClass: "economy",
  mileageBand: "auto",
  endWithOpenJaw: false,
  flights: [],
})

export const createFlightSegment = (
  partial: Partial<FlightSegment> = {}
): FlightSegment => ({
  id: createId(),
  from: "",
  to: "",
  marketingCarrier: "",
  isCodeshare: false,
  operatingCarrier: "",
  arrivalType: "stopover",
  ...partial,
})
