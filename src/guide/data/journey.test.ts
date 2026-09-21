import { describe, expect, it } from "vitest"

import snapshot from "../../data/generated/route-data.compact.json"
import {
  decodeRouteData,
  type CompactRouteDataSnapshot,
} from "../../features/route-data"
import { validateItinerary } from "../../features/rules/validate-itinerary"
import { decodeSharePayload } from "../../features/sharing/codec"
import {
  EXAMPLE_ROUTE_URL,
  JOURNEY_AIRPORTS,
  JOURNEY_BAND,
  JOURNEY_LEGS,
  JOURNEY_MILES,
  JOURNEY_REMAINING,
} from "./journey"

describe("guide example itinerary", () => {
  it("opens the same flights and carriers shown in the guide", () => {
    const result = decodeSharePayload(EXAMPLE_ROUTE_URL.split("/v1/")[1])
    expect(result.success).toBe(true)
    if (!result.success) throw new Error("Invalid guide example link")

    expect(result.itinerary.cabinClass).toBe("economy")
    expect(result.itinerary.mileageBand).toBe("auto")
    expect(result.itinerary.endWithOpenJaw).toBe(false)
    expect(
      result.itinerary.flights.map(
        ({ from, to, marketingCarrier, operatingCarrier, isCodeshare }) => ({
          from,
          to,
          marketingCarrier,
          operatingCarrier,
          isCodeshare,
        })
      )
    ).toEqual(
      JOURNEY_LEGS.map(({ from, to, carrier }) => ({
        from: from.iata,
        to: to.iata,
        marketingCarrier: carrier.code,
        operatingCarrier: carrier.code,
        isCodeshare: false,
      }))
    )
  })

  it("keeps the displayed geography, mileage and checks aligned with the planner snapshot", () => {
    const data = decodeRouteData(snapshot as CompactRouteDataSnapshot)
    const airportByIata = new Map(
      data.airports.map((airport) => [airport.iata, airport])
    )
    for (const airport of JOURNEY_AIRPORTS) {
      expect(airportByIata.get(airport.iata)).toMatchObject({
        latitude: airport.latitude,
        longitude: airport.longitude,
      })
    }

    const shared = decodeSharePayload(EXAMPLE_ROUTE_URL.split("/v1/")[1])
    if (!shared.success) throw new Error("Invalid guide example link")
    const result = validateItinerary(shared.itinerary, {
      airportByIata,
      getRoute: (from, to) =>
        data.routes.find((route) => route.from === from && route.to === to),
    })
    expect(result.status).toBe("valid")
    expect(result.metrics).toMatchObject({
      totalMiles: JOURNEY_MILES,
      selectedBand: JOURNEY_BAND,
      remainingMiles: JOURNEY_REMAINING,
      segmentCount: 4,
      atlanticCrossings: 1,
      pacificCrossings: 1,
    })
  })
})
