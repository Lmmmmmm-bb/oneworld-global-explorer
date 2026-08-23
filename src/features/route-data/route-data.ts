import routeDataUrl from "@/data/generated/route-data.compact.json?url"

import type {
  Airport,
  CompactRouteDataSnapshot,
  EligibleRoute,
  RouteDataSnapshot,
} from "./types"

export const routeData: RouteDataSnapshot = {
  metadata: {
    sourceRepository: "",
    sourceCommit: "",
    eligibleCarrierCodes: [],
  },
  airports: [],
  routes: [],
}

export const airports = routeData.airports
export const routes = routeData.routes
export const airportByIata = new Map<string, Airport>()
export const routesByOrigin = new Map<string, EligibleRoute[]>()
export const routeByCityPair = new Map<string, EligibleRoute>()

let ready = false
let loadPromise: Promise<void> | null = null

const parseCarrierCodes = (source: string) => source.split(",")

export const decodeRouteData = (
  compact: CompactRouteDataSnapshot
): RouteDataSnapshot => {
  if (
    compact.schemaVersion !== 2 ||
    !Array.isArray(compact.airports) ||
    !Array.isArray(compact.pairs)
  ) {
    throw new Error("Unsupported route data snapshot format.")
  }

  const decodedAirports = compact.airports.map<Airport>(
    ([
      iata,
      name,
      city,
      country,
      countryCode,
      continentCode,
      latitude,
      longitude,
    ]) => ({
      iata,
      name,
      city,
      country,
      countryCode,
      continentCode,
      latitude,
      longitude,
    })
  )
  const decodedRoutes: EligibleRoute[] = []

  compact.pairs.forEach(
    ([
      fromAirportIndex,
      toAirportIndex,
      distanceMiles,
      forwardEstimatedMinutes,
      reverseEstimatedMinutes,
      forwardCarrierCodes,
      reverseCarrierCodes,
    ]) => {
      const from = decodedAirports[fromAirportIndex]?.iata
      const to = decodedAirports[toAirportIndex]?.iata
      if (!from || !to) {
        throw new Error("Route data references an unknown airport.")
      }

      if (forwardCarrierCodes !== null) {
        decodedRoutes.push({
          from,
          to,
          distanceMiles,
          estimatedMinutes: forwardEstimatedMinutes,
          carrierCodes: parseCarrierCodes(forwardCarrierCodes),
        })
      }

      const resolvedReverseCarriers =
        reverseCarrierCodes === undefined
          ? forwardCarrierCodes
          : reverseCarrierCodes
      if (resolvedReverseCarriers !== null) {
        decodedRoutes.push({
          from: to,
          to: from,
          distanceMiles,
          estimatedMinutes: reverseEstimatedMinutes,
          carrierCodes: parseCarrierCodes(resolvedReverseCarriers),
        })
      }
    }
  )

  decodedRoutes.sort(
    (left, right) =>
      left.from.localeCompare(right.from) || left.to.localeCompare(right.to)
  )

  return {
    metadata: compact.metadata,
    airports: decodedAirports,
    routes: decodedRoutes,
  }
}

export const initializeRouteData = (compact: CompactRouteDataSnapshot) => {
  const decoded = decodeRouteData(compact)

  routeData.metadata = decoded.metadata
  airports.splice(0, airports.length, ...decoded.airports)
  routes.splice(0, routes.length, ...decoded.routes)
  airportByIata.clear()
  routesByOrigin.clear()
  routeByCityPair.clear()

  for (const airport of airports) airportByIata.set(airport.iata, airport)
  for (const route of routes) {
    const originRoutes = routesByOrigin.get(route.from)
    if (originRoutes) originRoutes.push(route)
    else routesByOrigin.set(route.from, [route])
    routeByCityPair.set(`${route.from}-${route.to}`, route)
  }

  ready = true
}

export const loadRouteData = () => {
  if (ready) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = fetch(routeDataUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Route data request failed (${response.status}).`)
      }
      return response.json() as Promise<CompactRouteDataSnapshot>
    })
    .then(initializeRouteData)
    .catch((error: unknown) => {
      loadPromise = null
      throw error
    })

  return loadPromise
}

export const getRoute = (from: string, to: string) =>
  routeByCityPair.get(`${from}-${to}`)

export const getDestinationAirports = (origin: string) =>
  (routesByOrigin.get(origin) ?? [])
    .map((route) => airportByIata.get(route.to))
    .filter((airport): airport is Airport => Boolean(airport))
    .sort(
      (left, right) =>
        left.city.localeCompare(right.city) ||
        left.iata.localeCompare(right.iata)
    )
