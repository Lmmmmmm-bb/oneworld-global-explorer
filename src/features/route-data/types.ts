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
