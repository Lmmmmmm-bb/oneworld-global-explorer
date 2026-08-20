import type { FlightSegment } from "@/features/itinerary"
import type { Airport } from "@/features/route-data"

export type GlobeLocation = [number, number]

export interface GlobeAirportMarker {
  airport: Airport
  id: string
  location: GlobeLocation
  sequence: string
}

export interface GlobeFlightArc {
  from: GlobeLocation
  id: string
  to: GlobeLocation
}

export interface GlobeRouteData {
  arcs: GlobeFlightArc[]
  markers: GlobeAirportMarker[]
}

export const buildGlobeRouteData = (
  flights: FlightSegment[],
  airportByIata: Map<string, Airport>
): GlobeRouteData => {
  const visits: string[] = []

  flights.forEach((flight, index) => {
    const previousFlight = flights[index - 1]
    if (!previousFlight || previousFlight.to !== flight.from) {
      visits.push(flight.from)
    }
    visits.push(flight.to)
  })

  const sequencesByAirport = new Map<string, number[]>()
  visits.forEach((iata, index) => {
    sequencesByAirport.set(iata, [
      ...(sequencesByAirport.get(iata) ?? []),
      index + 1,
    ])
  })

  const markers = [...sequencesByAirport.entries()].flatMap(
    ([iata, sequences]) => {
      const airport = airportByIata.get(iata)
      return airport
        ? [
            {
              airport,
              id: `airport-${iata.toLowerCase()}`,
              location: [airport.latitude, airport.longitude] as GlobeLocation,
              sequence: sequences.join(","),
            },
          ]
        : []
    }
  )

  const arcs = flights.flatMap((flight, index) => {
    const from = airportByIata.get(flight.from)
    const to = airportByIata.get(flight.to)
    return from && to
      ? [
          {
            from: [from.latitude, from.longitude] as GlobeLocation,
            id: `flight-${index + 1}-${flight.from.toLowerCase()}-${flight.to.toLowerCase()}`,
            to: [to.latitude, to.longitude] as GlobeLocation,
          },
        ]
      : []
  })

  return { arcs, markers }
}
