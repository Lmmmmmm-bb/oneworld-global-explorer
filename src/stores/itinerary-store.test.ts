import { beforeEach, describe, expect, it } from "vitest"

import { createFlightSegment } from "@/features/itinerary"

import { useItineraryStore } from "./itinerary-store"

describe("itinerary store", () => {
  beforeEach(() => useItineraryStore.getState().resetItinerary())

  it("adds, edits, and immediately deletes flights", () => {
    const savedFlight = createFlightSegment({
      id: "saved-flight",
      from: "LHR",
      to: "JFK",
      marketingCarrier: "BA",
      operatingCarrier: "BA",
    })

    useItineraryStore.getState().addFlight(savedFlight)
    useItineraryStore
      .getState()
      .updateFlight(savedFlight.id, { arrivalType: "transfer", id: "changed" })

    expect(useItineraryStore.getState().itinerary.flights[0]).toMatchObject({
      id: "saved-flight",
      arrivalType: "transfer",
    })

    useItineraryStore.getState().deleteFlight(savedFlight.id)
    expect(useItineraryStore.getState().itinerary.flights).toEqual([])
  })

  it("resets an incompatible locked band when cabin changes", () => {
    useItineraryStore.getState().setMileageBand(29_000)
    useItineraryStore.getState().setCabinClass("business")

    expect(useItineraryStore.getState().itinerary).toMatchObject({
      cabinClass: "business",
      mileageBand: "auto",
    })
  })
})
