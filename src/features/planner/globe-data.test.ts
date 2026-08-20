import { describe, expect, it } from "vitest"

import type { FlightSegment } from "@/features/itinerary"
import type { Airport } from "@/features/route-data"

import { buildGlobeRouteData } from "./globe-data"

const airport = (
  iata: string,
  latitude: number,
  longitude: number
): Airport => ({
  iata,
  name: `${iata} Airport`,
  city: iata,
  country: iata,
  countryCode: iata.slice(0, 2),
  continentCode: "OC",
  latitude,
  longitude,
})

const airports = [
  airport("SFO", 37.62, -122.38),
  airport("LHR", 51.47, -0.45),
  airport("NRT", 35.77, 140.39),
  airport("SYD", -33.94, 151.18),
]
const airportByIata = new Map(airports.map((item) => [item.iata, item]))

const flight = (id: string, from: string, to: string): FlightSegment => ({
  id,
  from,
  to,
  marketingCarrier: "QF",
  isCodeshare: false,
  operatingCarrier: "QF",
  arrivalType: "stopover",
})

describe("globe route data", () => {
  it("creates one marker per airport and one arc per flight", () => {
    const data = buildGlobeRouteData(
      [flight("1", "SFO", "LHR"), flight("2", "LHR", "NRT")],
      airportByIata
    )

    expect(data.markers.map(({ airport }) => airport.iata)).toEqual([
      "SFO",
      "LHR",
      "NRT",
    ])
    expect(data.arcs).toEqual([
      expect.objectContaining({
        from: [37.62, -122.38],
        to: [51.47, -0.45],
      }),
      expect.objectContaining({
        from: [51.47, -0.45],
        to: [35.77, 140.39],
      }),
    ])
  })

  it("does not create an arc for an open jaw between flights", () => {
    const data = buildGlobeRouteData(
      [flight("1", "SFO", "LHR"), flight("2", "NRT", "SYD")],
      airportByIata
    )

    expect(data.arcs).toEqual([
      expect.objectContaining({
        from: [37.62, -122.38],
        to: [51.47, -0.45],
      }),
      expect.objectContaining({
        from: [35.77, 140.39],
        to: [-33.94, 151.18],
      }),
    ])
    expect(data.arcs).not.toContainEqual(
      expect.objectContaining({
        from: [51.47, -0.45],
        to: [35.77, 140.39],
      })
    )
    expect(data.markers.map(({ airport }) => airport.iata)).toEqual([
      "SFO",
      "LHR",
      "NRT",
      "SYD",
    ])
  })

  it("keeps repeated visits on one marker", () => {
    const data = buildGlobeRouteData(
      [flight("1", "SFO", "LHR"), flight("2", "LHR", "SFO")],
      airportByIata
    )

    expect(data.markers).toHaveLength(2)
    expect(
      data.markers.find(({ airport }) => airport.iata === "SFO")?.sequence
    ).toBe("1,3")
  })

  it("ignores incomplete data that cannot be plotted", () => {
    const data = buildGlobeRouteData([flight("1", "SFO", "XXX")], airportByIata)

    expect(data.arcs).toEqual([])
    expect(data.markers.map(({ airport }) => airport.iata)).toEqual(["SFO"])
  })
})
