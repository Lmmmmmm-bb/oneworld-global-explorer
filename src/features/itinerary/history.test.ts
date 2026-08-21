import { describe, expect, it } from "vitest"

import { createEmptyItinerary, createFlightSegment } from "./factories"
import { areItinerariesEqual, cloneItinerary } from "./history"

describe("itinerary history helpers", () => {
  it("clones the itinerary and every flight", () => {
    const itinerary = createEmptyItinerary()
    itinerary.flights.push(
      createFlightSegment({ id: "flight", from: "LHR", to: "JFK" })
    )

    const cloned = cloneItinerary(itinerary)
    cloned.flights[0].from = "MAD"

    expect(cloned).not.toBe(itinerary)
    expect(cloned.flights[0]).not.toBe(itinerary.flights[0])
    expect(itinerary.flights[0].from).toBe("LHR")
  })

  it("compares every persisted itinerary field", () => {
    const itinerary = createEmptyItinerary()
    itinerary.flights.push(
      createFlightSegment({ id: "flight", from: "LHR", to: "JFK" })
    )

    expect(areItinerariesEqual(itinerary, cloneItinerary(itinerary))).toBe(true)

    const changed = cloneItinerary(itinerary)
    changed.flights[0].operatingCarrier = "AA"
    expect(areItinerariesEqual(itinerary, changed)).toBe(false)
  })
})
