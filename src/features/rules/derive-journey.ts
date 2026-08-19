import type { Itinerary, OpenJawSegment } from "@/features/itinerary"
import { haversineMiles } from "@/utils"

import type { DerivedJourney, JourneyLeg, RuleDataContext } from "./types"

export const deriveJourney = (
  itinerary: Itinerary,
  context: RuleDataContext
): DerivedJourney => {
  const legs: JourneyLeg[] = []
  const openJaws: OpenJawSegment[] = []

  itinerary.flights.forEach((flight, index) => {
    const from = context.airportByIata.get(flight.from)
    const to = context.airportByIata.get(flight.to)

    if (from && to) {
      legs.push({
        id: flight.id,
        kind: "flight",
        from,
        to,
        distanceMiles: haversineMiles(from, to),
        flight,
      })
    }

    const nextFlight = itinerary.flights[index + 1]
    if (!nextFlight || flight.to === nextFlight.from) return

    const surfaceFrom = context.airportByIata.get(flight.to)
    const surfaceTo = context.airportByIata.get(nextFlight.from)
    if (!surfaceFrom || !surfaceTo) return

    const openJaw: OpenJawSegment = {
      id: `open-jaw:${flight.id}:${nextFlight.id}`,
      from: surfaceFrom.iata,
      to: surfaceTo.iata,
      afterFlightId: flight.id,
      beforeFlightId: nextFlight.id,
      isOriginDestination: false,
      distanceMiles: haversineMiles(surfaceFrom, surfaceTo),
    }
    openJaws.push(openJaw)
    legs.push({
      id: openJaw.id,
      kind: "open-jaw",
      from: surfaceFrom,
      to: surfaceTo,
      distanceMiles: openJaw.distanceMiles,
      openJaw,
    })
  })

  const firstFlight = itinerary.flights[0]
  const lastFlight = itinerary.flights.at(-1)

  if (
    itinerary.endWithOpenJaw &&
    firstFlight &&
    lastFlight &&
    lastFlight.to !== firstFlight.from
  ) {
    const surfaceFrom = context.airportByIata.get(lastFlight.to)
    const surfaceTo = context.airportByIata.get(firstFlight.from)

    if (surfaceFrom && surfaceTo) {
      const openJaw: OpenJawSegment = {
        id: `open-jaw:${lastFlight.id}:origin`,
        from: surfaceFrom.iata,
        to: surfaceTo.iata,
        afterFlightId: lastFlight.id,
        beforeFlightId: null,
        isOriginDestination: true,
        distanceMiles: haversineMiles(surfaceFrom, surfaceTo),
      }
      openJaws.push(openJaw)
      legs.push({
        id: openJaw.id,
        kind: "open-jaw",
        from: surfaceFrom,
        to: surfaceTo,
        distanceMiles: openJaw.distanceMiles,
        openJaw,
      })
    }
  }

  const flightMiles = legs
    .filter((leg) => leg.kind === "flight")
    .reduce((total, leg) => total + leg.distanceMiles, 0)
  const openJawMiles = legs
    .filter((leg) => leg.kind === "open-jaw")
    .reduce((total, leg) => total + leg.distanceMiles, 0)

  return {
    legs,
    openJaws,
    flightMiles,
    openJawMiles,
    totalMiles: flightMiles + openJawMiles,
  }
}
