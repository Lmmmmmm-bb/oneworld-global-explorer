import { beforeEach, describe, expect, it } from "vitest"

import {
  createEmptyItinerary,
  createFlightSegment,
  itinerarySchema,
} from "@/features/itinerary"

import { useItineraryStore } from "./itinerary"

const resetStore = () =>
  useItineraryStore.setState({
    itinerary: createEmptyItinerary(),
    past: [],
    future: [],
    lastHistoryEvent: null,
  })

const savedFlight = () =>
  createFlightSegment({
    id: "saved-flight",
    from: "LHR",
    to: "JFK",
    marketingCarrier: "BA",
    operatingCarrier: "BA",
  })

describe("itinerary store", () => {
  beforeEach(resetStore)

  it("undoes and redoes add, edit, and delete operations", () => {
    const flight = savedFlight()

    useItineraryStore.getState().addFlight(flight)
    useItineraryStore
      .getState()
      .updateFlight(flight.id, { arrivalType: "transfer", id: "changed" })
    useItineraryStore.getState().deleteFlight(flight.id)

    expect(useItineraryStore.getState().itinerary.flights).toEqual([])
    expect(useItineraryStore.getState().past).toHaveLength(3)

    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary.flights[0]).toMatchObject({
      id: "saved-flight",
      arrivalType: "transfer",
    })

    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary.flights[0]).toMatchObject({
      id: "saved-flight",
      arrivalType: "stopover",
    })

    useItineraryStore.getState().redo()
    useItineraryStore.getState().redo()
    expect(useItineraryStore.getState().itinerary.flights).toEqual([])
  })

  it("restores cabin and its automatic mileage change atomically", () => {
    useItineraryStore.getState().setMileageBand(29_000)
    useItineraryStore.getState().setCabinClass("business")

    expect(useItineraryStore.getState().itinerary).toMatchObject({
      cabinClass: "business",
      mileageBand: "auto",
    })

    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary).toMatchObject({
      cabinClass: "economy",
      mileageBand: 29_000,
    })
  })

  it("clears redo after a new real change but preserves it for no-ops", () => {
    useItineraryStore.getState().addFlight(savedFlight())
    useItineraryStore.getState().undo()

    useItineraryStore.getState().deleteFlight("missing")
    useItineraryStore.getState().setCabinClass("economy")
    expect(useItineraryStore.getState().future).toHaveLength(1)

    useItineraryStore.getState().setCabinClass("business")
    expect(useItineraryStore.getState().future).toEqual([])
  })

  it("treats import and new itinerary as reversible single changes", () => {
    useItineraryStore.getState().addFlight(savedFlight())
    const beforeImport = useItineraryStore.getState().itinerary
    const imported = {
      ...createEmptyItinerary(),
      cabinClass: "first" as const,
    }

    useItineraryStore.getState().replaceItinerary(imported)
    expect(useItineraryStore.getState().itinerary.cabinClass).toBe("first")
    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary).toEqual(beforeImport)

    useItineraryStore.getState().resetItinerary()
    expect(useItineraryStore.getState().itinerary.flights).toEqual([])
    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary).toEqual(beforeImport)
  })

  it("protects stored snapshots from caller mutations", () => {
    const flight = savedFlight()
    useItineraryStore.getState().addFlight(flight)
    flight.from = "MAD"

    expect(useItineraryStore.getState().itinerary.flights[0].from).toBe("LHR")

    const imported = {
      ...createEmptyItinerary(),
      flights: [savedFlight()],
    }
    useItineraryStore.getState().replaceItinerary(imported)
    imported.flights[0].to = "MAD"
    expect(useItineraryStore.getState().itinerary.flights[0].to).toBe("JFK")
  })

  it("keeps at most 100 undo entries", () => {
    for (let index = 0; index < 101; index += 1) {
      useItineraryStore
        .getState()
        .setCabinClass(index % 2 === 0 ? "business" : "economy")
    }

    expect(useItineraryStore.getState().past).toHaveLength(100)
  })

  it("keeps restored itineraries schema-valid and reports history events", () => {
    useItineraryStore.getState().addFlight(savedFlight())
    useItineraryStore.getState().undo()

    expect(
      itinerarySchema.safeParse(useItineraryStore.getState().itinerary).success
    ).toBe(true)
    expect(useItineraryStore.getState().lastHistoryEvent).toMatchObject({
      direction: "undo",
      change: { type: "flight.add", from: "LHR", to: "JFK" },
    })

    useItineraryStore.getState().redo()
    expect(useItineraryStore.getState().lastHistoryEvent).toMatchObject({
      direction: "redo",
      change: { type: "flight.add" },
    })
  })
})
