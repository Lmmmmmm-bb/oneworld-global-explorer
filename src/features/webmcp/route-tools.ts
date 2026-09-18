import {
  airportByIata,
  airports,
  routesByOrigin,
  searchAirports,
} from "@/features/route-data"

import {
  inputError,
  routesInputSchema,
  routesJsonSchema,
  searchInputSchema,
  searchJsonSchema,
} from "./input"
import type { WebMcpTool } from "./types"

export const createRouteTools = (): WebMcpTool[] => [
  {
    name: "search_airports",
    title: "Search eligible airports",
    description:
      "Search the planner's checked-in airport snapshot by IATA code, city, airport, or country. This is planning data, not a live schedule.",
    inputSchema: searchJsonSchema,
    annotations: { readOnlyHint: true },
    execute: (input) => {
      const parsed = searchInputSchema.safeParse(input)
      if (!parsed.success) return inputError(parsed.error)
      return {
        success: true,
        airports: searchAirports(
          airports,
          parsed.data.query,
          parsed.data.limit
        ),
      }
    },
  },
  {
    name: "find_routes",
    title: "Find eligible direct routes",
    description:
      "List directed routes from an origin in the checked-in snapshot, optionally filtering by destination and marketing carrier. A missing route does not prove a flight does not operate.",
    inputSchema: routesJsonSchema,
    annotations: { readOnlyHint: true },
    execute: (input) => {
      const parsed = routesInputSchema.safeParse(input)
      if (!parsed.success) return inputError(parsed.error)
      const { from, to, carrier, limit } = parsed.data
      const matches = (routesByOrigin.get(from) ?? []).filter(
        (route) =>
          (!to || route.to === to) &&
          (!carrier || route.carrierCodes.includes(carrier))
      )
      return {
        success: true,
        from,
        totalMatches: matches.length,
        routes: matches.slice(0, limit).map((route) => {
          const destination = airportByIata.get(route.to)
          return {
            ...route,
            destination: destination
              ? { city: destination.city, country: destination.country }
              : null,
          }
        }),
      }
    },
  },
]
