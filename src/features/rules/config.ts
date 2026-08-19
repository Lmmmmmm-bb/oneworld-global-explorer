import type { CabinClass, MileageBand } from "@/features/itinerary"

export interface CarrierOption {
  code: string
  name: string
  kind: "member" | "partner"
}

export interface OperatingCarrierOption {
  id: string
  name: string
  marketingCarriers: string[] | "all"
}

export const CARRIERS: CarrierOption[] = [
  { code: "AA", name: "American Airlines", kind: "member" },
  { code: "AS", name: "Alaska Airlines", kind: "member" },
  { code: "AT", name: "Royal Air Maroc", kind: "member" },
  { code: "AY", name: "Finnair", kind: "member" },
  { code: "BA", name: "British Airways", kind: "member" },
  { code: "CX", name: "Cathay Pacific", kind: "member" },
  { code: "FJ", name: "Fiji Airways", kind: "member" },
  { code: "IB", name: "Iberia", kind: "member" },
  { code: "JL", name: "Japan Airlines", kind: "member" },
  { code: "MH", name: "Malaysia Airlines", kind: "member" },
  { code: "QF", name: "Qantas", kind: "member" },
  { code: "QR", name: "Qatar Airways", kind: "member" },
  { code: "RJ", name: "Royal Jordanian", kind: "member" },
  { code: "UL", name: "SriLankan Airlines", kind: "member" },
  { code: "WY", name: "Oman Air", kind: "member" },
  { code: "EI", name: "Aer Lingus", kind: "partner" },
  { code: "GK", name: "Jetstar Japan", kind: "partner" },
  { code: "JQ", name: "Jetstar Airways", kind: "partner" },
  { code: "NU", name: "Japan Transocean Air", kind: "partner" },
  { code: "PG", name: "Bangkok Airways", kind: "partner" },
  { code: "WS", name: "WestJet", kind: "partner" },
]

export const ELIGIBLE_CARRIER_CODES = CARRIERS.map(({ code }) => code)

const affiliated = (
  id: string,
  name: string,
  marketingCarriers: string[]
): OperatingCarrierOption => ({ id, name, marketingCarriers })

export const AFFILIATED_OPERATORS: OperatingCarrierOption[] = [
  affiliated("affiliate:as:horizon", "Horizon Air", ["AS"]),
  affiliated("affiliate:as-aa:skywest", "SkyWest Airlines", ["AS", "AA"]),
  affiliated("affiliate:aa:envoy", "Envoy Air", ["AA"]),
  affiliated("affiliate:aa:piedmont", "Piedmont Airlines", ["AA"]),
  affiliated("affiliate:aa:psa", "PSA Airlines", ["AA"]),
  affiliated("affiliate:aa:republic", "Republic Airways", ["AA"]),
  affiliated("affiliate:ba:cityflyer", "BA CityFlyer", ["BA"]),
  affiliated("affiliate:ba:euroflyer", "BA Euroflyer", ["BA"]),
  affiliated("affiliate:fj:fiji-link", "Fiji Link", ["FJ"]),
  affiliated("affiliate:ay:norra", "Nordic Regional Airlines", ["AY"]),
  affiliated("affiliate:ib:air-nostrum", "Air Nostrum", ["IB"]),
  affiliated("affiliate:ib:express", "Iberia Express", ["IB"]),
  affiliated("affiliate:jl:j-air", "J-Air", ["JL"]),
  affiliated("affiliate:jl:has", "Hokkaido Air System", ["JL"]),
  affiliated("affiliate:jl:jacom", "Japan Air Commuter", ["JL"]),
  affiliated("affiliate:qf:airlink", "QantasLink - Airlink", ["QF"]),
  affiliated("affiliate:qf:eastern", "QantasLink - Eastern Australia", ["QF"]),
  affiliated("affiliate:qf:national-jet", "QantasLink - National Jet Systems", [
    "QF",
  ]),
  affiliated("affiliate:qf:network", "QantasLink - Network Aviation", ["QF"]),
  affiliated("affiliate:qf:sunstate", "QantasLink - Sunstate Airlines", ["QF"]),
  affiliated("affiliate:at:express", "Royal Air Maroc Express", ["AT"]),
  affiliated("affiliate:ws:encore", "WestJet Encore", ["WS"]),
]

export const CODESHARE_EXCEPTIONS: OperatingCarrierOption[] = [
  { id: "TN", name: "Air Tahiti Nui", marketingCarriers: ["QF"] },
  { id: "QQ", name: "Alliance Airlines", marketingCarriers: ["QF"] },
]

export const OPERATING_CARRIERS: OperatingCarrierOption[] = [
  ...CARRIERS.map(({ code, name }) => ({
    id: code,
    name,
    marketingCarriers: "all" as const,
  })),
  ...CODESHARE_EXCEPTIONS,
  ...AFFILIATED_OPERATORS,
]

export const BAND_RULES: Record<
  MileageBand,
  {
    compatibleCabins: CabinClass[]
    maxStopovers: number | null
    maxStopoversPerRegion: number
  }
> = {
  26_000: {
    compatibleCabins: ["economy", "business"],
    maxStopovers: 5,
    maxStopoversPerRegion: 2,
  },
  29_000: {
    compatibleCabins: ["economy"],
    maxStopovers: null,
    maxStopoversPerRegion: 4,
  },
  34_000: {
    compatibleCabins: ["economy", "business", "first"],
    maxStopovers: null,
    maxStopoversPerRegion: 4,
  },
  39_000: {
    compatibleCabins: ["economy"],
    maxStopovers: null,
    maxStopoversPerRegion: 4,
  },
}
