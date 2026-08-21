import { describe, expect, it } from "vitest"

import type { ItineraryChange } from "@/features/itinerary"

import { formatHistoryChange } from "./labels"

describe("history labels", () => {
  it.each<[ItineraryChange, string]>([
    [{ type: "flight.add", from: "LHR", to: "JFK" }, "Add flight LHR → JFK"],
    [
      { type: "flight.update", from: "LHR", to: "MAD" },
      "Edit flight LHR → MAD",
    ],
    [
      { type: "flight.delete", from: "MAD", to: "DOH" },
      "Delete flight MAD → DOH",
    ],
    [
      { type: "cabin.change", cabinClass: "business" },
      "Change cabin to Business",
    ],
    [
      { type: "mileageBand.change", mileageBand: 34_000 },
      "Change mileage band to 34K",
    ],
    [
      { type: "mileageBand.change", mileageBand: "auto" },
      "Change mileage band to Auto",
    ],
    [{ type: "openJaw.change", enabled: true }, "Enable ending open jaw"],
    [{ type: "itinerary.import" }, "Import itinerary"],
    [{ type: "itinerary.reset" }, "Start new itinerary"],
  ])("formats %o", (change, expected) => {
    expect(formatHistoryChange(change)).toBe(expected)
  })
})
