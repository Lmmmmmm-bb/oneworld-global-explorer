import { describe, expect, it } from "vitest"

import { createEmptyItinerary, createFlightSegment } from "./factories"
import { parseItineraryJson, serializeItinerary } from "./json"

describe("portable itinerary JSON", () => {
  it("round-trips the versioned itinerary without derived validation data", () => {
    const itinerary = {
      ...createEmptyItinerary(),
      flights: [
        createFlightSegment({
          id: "flight-1",
          from: "LHR",
          to: "JFK",
          marketingCarrier: "BA",
          operatingCarrier: "BA",
        }),
      ],
    }
    const serialized = serializeItinerary(itinerary)
    const parsed = parseItineraryJson(serialized)

    expect(parsed).toEqual({ success: true, itinerary })
    expect(serialized).toContain('"schemaVersion": 1')
    expect(serialized).not.toContain("validation")
    expect(serialized).not.toContain("ruleVersion")
  })

  it("reports invalid JSON and unsupported schemas without replacing data", () => {
    expect(parseItineraryJson("not json")).toEqual({
      success: false,
      issues: ["The selected file is not valid JSON."],
    })

    const unsupported = parseItineraryJson(
      JSON.stringify({ ...createEmptyItinerary(), schemaVersion: 2 })
    )
    expect(unsupported.success).toBe(false)
  })

  it("requires an operating carrier for imported codeshares", () => {
    const source = {
      ...createEmptyItinerary(),
      flights: [
        createFlightSegment({
          from: "LHR",
          to: "JFK",
          marketingCarrier: "BA",
          isCodeshare: true,
          operatingCarrier: "",
        }),
      ],
    }
    const result = parseItineraryJson(JSON.stringify(source))

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.issues[0]).toContain("operatingCarrier")
    }
  })
})
