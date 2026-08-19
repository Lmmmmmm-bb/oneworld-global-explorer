import snapshotJson from "@/data/generated/route-data.json"

import type { Airport, EligibleRoute, RouteDataSnapshot } from "./types"

export const routeData = snapshotJson as RouteDataSnapshot

export const airports = routeData.airports
export const routes = routeData.routes

export const airportByIata = new Map<string, Airport>(
  airports.map((airport) => [airport.iata, airport])
)

export const routesByOrigin = new Map<string, EligibleRoute[]>()
export const routeByCityPair = new Map<string, EligibleRoute>()

for (const route of routes) {
  routesByOrigin.set(route.from, [
    ...(routesByOrigin.get(route.from) ?? []),
    route,
  ])
  routeByCityPair.set(`${route.from}-${route.to}`, route)
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
