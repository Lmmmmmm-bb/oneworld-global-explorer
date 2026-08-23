import { describe, expect, it } from "vitest"

import { createEmptyItinerary, createFlightSegment } from "./factories"
import { isItinerary } from "./guard"

describe("lightweight stored-itinerary guard", () => {
  it("accepts a complete current-schema itinerary", () => {
    expect(
      isItinerary({
        ...createEmptyItinerary(),
        flights: [
          createFlightSegment({
            from: "LHR",
            to: "JFK",
            marketingCarrier: "BA",
            operatingCarrier: "BA",
          }),
        ],
      })
    ).toBe(true)
  })

  it("rejects unsupported versions and malformed nested flights", () => {
    expect(isItinerary({ ...createEmptyItinerary(), schemaVersion: 2 })).toBe(
      false
    )
    expect(
      isItinerary({
        ...createEmptyItinerary(),
        flights: [
          createFlightSegment({
            from: "lhr",
            to: "JFK",
            isCodeshare: true,
            operatingCarrier: "",
          }),
        ],
      })
    ).toBe(false)
  })
})
