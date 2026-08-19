import { describe, expect, it } from "vitest"

import type { FlightSegment } from "@/features/itinerary"
import type { Airport } from "@/features/route-data"

import {
  buildRouteGeoJson,
  buildRoutePoints,
  createGreatCircle,
  splitAtAntimeridian,
} from "./map-geometry"

const airport = (
  iata: string,
  latitude: number,
  longitude: number
): Airport => ({
  iata,
  name: iata,
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

describe("route map geometry", () => {
  it("keeps great-circle endpoints exact", () => {
    const positions = createGreatCircle(airports[0], airports[1], 8)
    expect(positions[0]).toEqual([airports[0].longitude, airports[0].latitude])
    expect(positions.at(-1)?.[0]).toBeCloseTo(airports[1].longitude)
    expect(positions.at(-1)?.[1]).toBeCloseTo(airports[1].latitude)
  })

  it("splits a path crossing the antimeridian", () => {
    expect(
      splitAtAntimeridian([
        [179, 10],
        [-179, 11],
      ])
    ).toEqual([
      [
        [179, 10],
        [180, 10.5],
      ],
      [
        [-180, 10.5],
        [-179, 11],
      ],
    ])
  })

  it("draws flight features only while numbering both sides of an open jaw", () => {
    const flights = [flight("1", "SFO", "LHR"), flight("2", "NRT", "SYD")]
    const geoJson = buildRouteGeoJson(flights, airportByIata)
    const points = buildRoutePoints(flights, airportByIata)

    expect(geoJson.features).toHaveLength(2)
    expect(points.map(({ airport }) => airport.iata)).toEqual([
      "SFO",
      "LHR",
      "NRT",
      "SYD",
    ])
  })
})
