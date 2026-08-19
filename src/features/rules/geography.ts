import type { Airport } from "@/features/route-data"

export type TravelRegion =
  | "Europe / Middle East"
  | "Africa"
  | "Asia"
  | "South West Pacific"
  | "North America"
  | "South America"

export type TrafficConference = "TC1" | "TC2" | "TC3"
export type OceanCrossing = "Atlantic" | "Pacific"

const EUROPE_MIDDLE_EAST_AFRICA = new Set(["DZ", "EG", "LY", "MA", "SD", "TN"])

const MIDDLE_EAST_COUNTRIES = new Set([
  "AE",
  "BH",
  "CY",
  "EG",
  "IL",
  "IQ",
  "IR",
  "JO",
  "KW",
  "LB",
  "OM",
  "PS",
  "QA",
  "SA",
  "SY",
  "TR",
  "YE",
])

const CENTRAL_ASIA_COUNTRIES = new Set(["KZ", "KG", "TJ", "TM", "UZ"])

export const getTravelRegion = (airport: Airport): TravelRegion => {
  if (airport.countryCode === "RU") {
    return airport.longitude < 60 ? "Europe / Middle East" : "Asia"
  }

  if (
    EUROPE_MIDDLE_EAST_AFRICA.has(airport.countryCode) ||
    MIDDLE_EAST_COUNTRIES.has(airport.countryCode) ||
    airport.continentCode === "EU"
  ) {
    return "Europe / Middle East"
  }

  if (CENTRAL_ASIA_COUNTRIES.has(airport.countryCode)) return "Asia"

  switch (airport.continentCode) {
    case "AF":
      return "Africa"
    case "AS":
      return "Asia"
    case "OC":
      return "South West Pacific"
    case "NA":
      return "North America"
    case "SA":
      return "South America"
    default:
      return "Asia"
  }
}

export const getTrafficConference = (
  region: TravelRegion
): TrafficConference => {
  if (region === "North America" || region === "South America") return "TC1"
  if (region === "Europe / Middle East" || region === "Africa") return "TC2"
  return "TC3"
}

export const getOceanCrossing = (
  from: TrafficConference,
  to: TrafficConference
): OceanCrossing | null => {
  const pair = new Set([from, to])
  if (pair.has("TC1") && pair.has("TC2")) return "Atlantic"
  if (pair.has("TC1") && pair.has("TC3")) return "Pacific"
  return null
}

export const isInternational = (from: Airport, to: Airport) => {
  if (from.countryCode === to.countryCode) return false
  const countries = new Set([from.countryCode, to.countryCode])
  return !(countries.has("US") && countries.has("CA"))
}

export const isMiddleEast = (airport: Airport) =>
  MIDDLE_EAST_COUNTRIES.has(airport.countryCode)

export const isPermittedOriginDestinationSurface = (
  origin: Airport,
  destination: Airport
) => {
  if (origin.countryCode === destination.countryCode) return true
  if (isMiddleEast(origin) && isMiddleEast(destination)) return true

  const countries = new Set([origin.countryCode, destination.countryCode])
  if (countries.has("US") && countries.has("CA")) return true
  if (countries.has("HK") && countries.has("CN")) return true
  if (countries.has("MY") && countries.has("SG")) return true
  if (
    getTravelRegion(origin) === "Africa" &&
    getTravelRegion(destination) === "Africa"
  ) {
    return true
  }
  if (countries.has("MV") && (countries.has("LK") || countries.has("IN"))) {
    return true
  }

  return false
}
