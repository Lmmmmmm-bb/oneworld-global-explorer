import { describe, expect, it } from "vitest"

import {
  airports,
  getDestinationAirports,
  getRoute,
  routeData,
  searchAirports,
} from "."

describe("checked-in route data", () => {
  it("records its source revision and contains a useful network", () => {
    expect(routeData.metadata.sourceCommit).toMatch(/^[a-f0-9]{40}$/)
    expect(airports.length).toBeGreaterThan(900)
    expect(routeData.routes.length).toBeGreaterThan(7_000)
  })

  it("only returns destinations directly connected to the selected origin", () => {
    const londonDestinations = getDestinationAirports("LHR")
    const newYorkRoute = getRoute("LHR", "JFK")

    expect(londonDestinations.some((airport) => airport.iata === "JFK")).toBe(
      true
    )
    expect(newYorkRoute?.carrierCodes).toEqual(
      expect.arrayContaining(["AA", "BA"])
    )
  })

  it("ranks an IATA prefix ahead of textual matches", () => {
    expect(searchAirports(airports, "lhr", 1)[0]?.iata).toBe("LHR")
  })
})
