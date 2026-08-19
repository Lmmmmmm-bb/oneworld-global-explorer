import { describe, expect, it } from "vitest"

import type { Airport } from "@/features/route-data"

import {
  getTrafficConference,
  getTravelRegion,
  isInternational,
  isPermittedOriginDestinationSurface,
} from "./geography"

const airport = (
  iata: string,
  countryCode: string,
  continentCode: string,
  longitude = 0
): Airport => ({
  iata,
  name: iata,
  city: iata,
  country: countryCode,
  countryCode,
  continentCode,
  latitude: 0,
  longitude,
})

describe("Global Explorer geography", () => {
  it("applies the special region definitions", () => {
    expect(getTravelRegion(airport("CMN", "MA", "AF"))).toBe(
      "Europe / Middle East"
    )
    expect(getTravelRegion(airport("ALA", "KZ", "AS"))).toBe("Asia")
    expect(getTravelRegion(airport("MOW", "RU", "EU", 37))).toBe(
      "Europe / Middle East"
    )
    expect(getTravelRegion(airport("VVO", "RU", "AS", 132))).toBe("Asia")
    expect(getTrafficConference("South West Pacific")).toBe("TC3")
  })

  it("does not count USA-Canada travel as international", () => {
    expect(
      isInternational(airport("JFK", "US", "NA"), airport("YVR", "CA", "NA"))
    ).toBe(false)
  })

  it("recognizes the listed origin-destination surface exceptions", () => {
    expect(
      isPermittedOriginDestinationSurface(
        airport("JFK", "US", "NA"),
        airport("YVR", "CA", "NA")
      )
    ).toBe(true)
    expect(
      isPermittedOriginDestinationSurface(
        airport("HKG", "HK", "AS"),
        airport("PEK", "CN", "AS")
      )
    ).toBe(true)
    expect(
      isPermittedOriginDestinationSurface(
        airport("EZE", "AR", "SA"),
        airport("SFO", "US", "NA")
      )
    ).toBe(false)
  })
})
