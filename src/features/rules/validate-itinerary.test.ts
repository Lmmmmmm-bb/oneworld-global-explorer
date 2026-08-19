import { describe, expect, it } from "vitest"

import type {
  FlightSegment,
  Itinerary,
} from "@/features/itinerary"
import type { Airport } from "@/features/route-data"

import { ELIGIBLE_CARRIER_CODES } from "./config"
import { resolveMileageBand } from "./mileage"
import type { RuleDataContext } from "./types"
import { validateItinerary } from "./validate-itinerary"

const AIRPORTS: Airport[] = [
  ["SFO", "San Francisco", "US", "NA", 37.62, -122.38],
  ["OAK", "San Francisco", "US", "NA", 37.72, -122.22],
  ["LAX", "Los Angeles", "US", "NA", 33.94, -118.41],
  ["DFW", "Dallas", "US", "NA", 32.9, -97.04],
  ["JFK", "New York", "US", "NA", 40.64, -73.78],
  ["YVR", "Vancouver", "CA", "NA", 49.2, -123.18],
  ["LHR", "London", "GB", "EU", 51.47, -0.45],
  ["LGW", "London", "GB", "EU", 51.15, -0.18],
  ["CDG", "Paris", "FR", "EU", 49.0, 2.55],
  ["DOH", "Doha", "QA", "AS", 25.27, 51.61],
  ["NRT", "Tokyo", "JP", "AS", 35.77, 140.39],
  ["SIN", "Singapore", "SG", "AS", 1.36, 103.99],
  ["SYD", "Sydney", "AU", "OC", -33.94, 151.18],
  ["AKL", "Auckland", "NZ", "OC", -37.01, 174.79],
  ["EZE", "Buenos Aires", "AR", "SA", -34.82, -58.54],
  ["NBO", "Nairobi", "KE", "AF", -1.32, 36.93],
].map(([iata, city, countryCode, continentCode, latitude, longitude]) => ({
  iata: String(iata),
  name: `${city} Airport`,
  city: String(city),
  country: String(countryCode),
  countryCode: String(countryCode),
  continentCode: String(continentCode),
  latitude: Number(latitude),
  longitude: Number(longitude),
}))

const makeContext = (missingRoutes: string[] = []): RuleDataContext => ({
  airportByIata: new Map(AIRPORTS.map((airport) => [airport.iata, airport])),
  getRoute: (from, to) =>
    from !== to && !missingRoutes.includes(`${from}-${to}`)
      ? {
          from,
          to,
          distanceMiles: 1,
          estimatedMinutes: null,
          carrierCodes: [...ELIGIBLE_CARRIER_CODES],
        }
      : undefined,
})

const flight = (
  id: string,
  from: string,
  to: string,
  partial: Partial<FlightSegment> = {}
): FlightSegment => ({
  id,
  from,
  to,
  marketingCarrier: "AA",
  isCodeshare: false,
  operatingCarrier: "AA",
  arrivalType: "stopover",
  ...partial,
})

const itinerary = (
  flights: FlightSegment[],
  partial: Partial<Itinerary> = {}
): Itinerary => ({
  schemaVersion: 1,
  cabinClass: "economy",
  mileageBand: "auto",
  endWithOpenJaw: false,
  flights,
  ...partial,
})

const validRoundTheWorld = () =>
  itinerary([
    flight("1", "SFO", "LHR"),
    flight("2", "LHR", "NRT"),
    flight("3", "NRT", "SYD"),
    flight("4", "SYD", "SFO"),
  ])

describe("Global Explorer rule validation", () => {
  it("accepts a complete forward round-the-world route", () => {
    const result = validateItinerary(validRoundTheWorld(), makeContext())

    expect(result.status).toBe("valid")
    expect(result.metrics.atlanticCrossings).toBe(1)
    expect(result.metrics.pacificCrossings).toBe(1)
    expect(result.metrics.selectedBand).toBe(26_000)
    expect(result.metrics.regionPath).toEqual([
      "North America",
      "Europe / Middle East",
      "Asia",
      "South West Pacific",
      "North America",
    ])
  })

  it("derives an intermediate open jaw and counts its miles and stopover", () => {
    const result = validateItinerary(
      itinerary([
        flight("1", "SFO", "LHR"),
        flight("2", "NRT", "SYD"),
        flight("3", "SYD", "SFO"),
      ]),
      makeContext()
    )

    expect(result.status).toBe("valid")
    expect(result.openJaws).toMatchObject([{ from: "LHR", to: "NRT" }])
    expect(result.metrics.openJawMiles).toBeGreaterThan(0)
    expect(result.metrics.stopoverCount).toBe(2)
  })

  it("permits an origin-destination open jaw within the origin country", () => {
    const result = validateItinerary(
      itinerary(
        [
          flight("1", "SFO", "LHR"),
          flight("2", "LHR", "NRT"),
          flight("3", "NRT", "JFK"),
        ],
        { endWithOpenJaw: true }
      ),
      makeContext()
    )

    expect(result.status).toBe("valid")
    expect(result.openJaws.at(-1)).toMatchObject({
      from: "JFK",
      to: "SFO",
      isOriginDestination: true,
    })
  })

  it("rejects an origin-destination open jaw outside the exceptions", () => {
    const result = validateItinerary(
      itinerary(
        [
          flight("1", "SFO", "LHR"),
          flight("2", "LHR", "NRT"),
          flight("3", "NRT", "EZE"),
        ],
        { endWithOpenJaw: true }
      ),
      makeContext()
    )

    expect(result.violations.map(({ id }) => id)).toContain(
      "routing.origin-surface"
    )
  })

  it("rejects a transoceanic intermediate open jaw", () => {
    const result = validateItinerary(
      itinerary([
        flight("1", "SFO", "LHR"),
        flight("2", "JFK", "NRT"),
        flight("3", "NRT", "SYD"),
        flight("4", "SYD", "SFO"),
      ]),
      makeContext()
    )

    expect(result.violations.map(({ id }) => id)).toContain(
      "routing.transoceanic-surface"
    )
  })

  it("marks an unavailable saved route invalid while preserving it", () => {
    const result = validateItinerary(
      validRoundTheWorld(),
      makeContext(["LHR-NRT"])
    )

    expect(result.status).toBe("invalid")
    expect(result.violations.map(({ id }) => id)).toContain(
      "flight.2.route-unavailable"
    )
  })

  it("validates codeshare combinations and the JL/GK exclusion", () => {
    const rejected = validateItinerary(
      itinerary([
        flight("1", "NRT", "SYD", {
          marketingCarrier: "JL",
          isCodeshare: true,
          operatingCarrier: "GK",
        }),
      ]),
      makeContext()
    )
    const accepted = validateItinerary(
      itinerary([
        flight("1", "SYD", "AKL", {
          marketingCarrier: "QF",
          isCodeshare: true,
          operatingCarrier: "TN",
        }),
      ]),
      makeContext()
    )

    expect(rejected.violations.map(({ id }) => id)).toContain(
      "flight.1.codeshare"
    )
    expect(accepted.violations.map(({ id }) => id)).not.toContain(
      "flight.1.codeshare"
    )
  })

  it("rejects repeated city pairs even when different airports are used", () => {
    const result = validateItinerary(
      itinerary([
        flight("1", "SFO", "LHR"),
        flight("2", "OAK", "LGW"),
        flight("3", "NRT", "SYD"),
      ]),
      makeContext()
    )

    expect(
      result.violations.some(({ id }) => id.startsWith("routing.duplicate"))
    ).toBe(true)
  })

  it("enforces cabin and mileage-band compatibility", () => {
    const result = validateItinerary(
      { ...validRoundTheWorld(), cabinClass: "first", mileageBand: 29_000 },
      makeContext()
    )

    expect(result.violations.map(({ id }) => id)).toContain(
      "mileage.cabin-band"
    )
    expect(resolveMileageBand("auto", "first", 20_000)).toBe(34_000)
    expect(resolveMileageBand("auto", "business", 30_000)).toBe(34_000)
    expect(resolveMileageBand("auto", "business", 35_000)).toBeNull()
  })

  it("enforces the total and per-origin-region stopover limits", () => {
    const result = validateItinerary(
      itinerary(
        [
          flight("1", "SFO", "LAX"),
          flight("2", "LAX", "DFW"),
          flight("3", "DFW", "JFK"),
          flight("4", "JFK", "LHR"),
          flight("5", "LHR", "CDG"),
          flight("6", "CDG", "NRT"),
          flight("7", "NRT", "SYD"),
          flight("8", "SYD", "SFO"),
        ],
        { mileageBand: 26_000 }
      ),
      makeContext()
    )

    expect(result.violations.map(({ id }) => id)).toContain("stopovers.maximum")
    expect(result.violations.map(({ id }) => id)).toContain(
      "stopovers.region.North America"
    )
  })

  it("keeps incomplete requirements below violations in status precedence", () => {
    const result = validateItinerary(
      itinerary([flight("1", "SFO", "LHR")]),
      makeContext(["SFO-LHR"])
    )

    expect(result.incomplete.length).toBeGreaterThan(0)
    expect(result.violations.length).toBeGreaterThan(0)
    expect(result.status).toBe("invalid")
  })

  it("enforces the maximum of sixteen total segments", () => {
    const codes = [
      "SFO",
      "LAX",
      "DFW",
      "JFK",
      "YVR",
      "LHR",
      "LGW",
      "CDG",
      "DOH",
      "NRT",
      "SIN",
      "SYD",
      "AKL",
      "EZE",
      "NBO",
      "SFO",
      "LAX",
      "DFW",
    ]
    const flights = codes
      .slice(0, -1)
      .map((from, index) => flight(String(index), from, codes[index + 1]))
    const result = validateItinerary(itinerary(flights), makeContext())

    expect(result.metrics.segmentCount).toBe(17)
    expect(result.violations.map(({ id }) => id)).toContain(
      "routing.maximum-segments"
    )
  })
})
