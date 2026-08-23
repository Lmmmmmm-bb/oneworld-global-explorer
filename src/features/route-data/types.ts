export interface Airport {
  iata: string
  name: string
  city: string
  country: string
  countryCode: string
  continentCode: string
  latitude: number
  longitude: number
}

export interface EligibleRoute {
  from: string
  to: string
  distanceMiles: number
  estimatedMinutes: number | null
  carrierCodes: string[]
}

export interface RouteDataSnapshot {
  metadata: {
    sourceRepository: string
    sourceCommit: string
    eligibleCarrierCodes: string[]
  }
  airports: Airport[]
  routes: EligibleRoute[]
}

export type CompactAirport = [
  iata: string,
  name: string,
  city: string,
  country: string,
  countryCode: string,
  continentCode: string,
  latitude: number,
  longitude: number,
]

export type CompactRoutePair = [
  fromAirportIndex: number,
  toAirportIndex: number,
  distanceMiles: number,
  forwardEstimatedMinutes: number | null,
  reverseEstimatedMinutes: number | null,
  forwardCarrierCodes: string | null,
  reverseCarrierCodes?: string | null,
]

export interface CompactRouteDataSnapshot {
  schemaVersion: 2
  metadata: RouteDataSnapshot["metadata"]
  airports: CompactAirport[]
  pairs: CompactRoutePair[]
}
