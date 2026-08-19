import type { Itinerary, MileageBand } from "@/features/itinerary"

import { BAND_RULES } from "./config"
import { getTravelRegion, type TravelRegion } from "./geography"
import { addRuleMessage, type RuleMessages } from "./messages"
import type { DerivedJourney, RuleDataContext } from "./types"

const addRegionStopover = (
  counts: Map<TravelRegion, number>,
  region: TravelRegion
) => counts.set(region, (counts.get(region) ?? 0) + 1)

export const validateStopovers = (
  itinerary: Itinerary,
  journey: DerivedJourney,
  selectedBand: MileageBand | null,
  context: RuleDataContext,
  messages: RuleMessages
) => {
  const countsByRegion = new Map<TravelRegion, number>()
  const openJawAfterFlightIds = new Set(
    journey.openJaws.map(({ afterFlightId }) => afterFlightId)
  )
  let stopoverCount = 0

  itinerary.flights.forEach((flight, index) => {
    if (
      index === itinerary.flights.length - 1 ||
      openJawAfterFlightIds.has(flight.id) ||
      flight.arrivalType !== "stopover"
    ) {
      return
    }

    const airport = context.airportByIata.get(flight.to)
    if (!airport) return
    stopoverCount += 1
    addRegionStopover(countsByRegion, getTravelRegion(airport))
  })

  for (const openJaw of journey.openJaws) {
    const from = context.airportByIata.get(openJaw.from)
    const to = context.airportByIata.get(openJaw.to)
    if (!from || !to) continue

    stopoverCount += 1
    const fromRegion = getTravelRegion(from)
    const toRegion = getTravelRegion(to)
    addRegionStopover(countsByRegion, fromRegion)
    if (fromRegion !== toRegion) addRegionStopover(countsByRegion, toRegion)
  }

  if (stopoverCount < 2) {
    addRuleMessage(messages, {
      id: "stopovers.minimum",
      rule: "8",
      kind: "incomplete",
      title: "At least two stopovers are required",
      description: `${stopoverCount} of the minimum 2 stopovers are currently planned.`,
    })
  }

  if (!selectedBand) return stopoverCount

  const bandRules = BAND_RULES[selectedBand]
  if (
    bandRules.maxStopovers !== null &&
    stopoverCount > bandRules.maxStopovers
  ) {
    addRuleMessage(messages, {
      id: "stopovers.maximum",
      rule: "8",
      kind: "violation",
      title: `${selectedBand.toLocaleString()} miles permits at most ${bandRules.maxStopovers} stopovers`,
      description: `${stopoverCount} stopovers are currently planned.`,
    })
  }

  const firstAirport = context.airportByIata.get(
    itinerary.flights[0]?.from ?? ""
  )
  const originRegion = firstAirport ? getTravelRegion(firstAirport) : null

  for (const [region, count] of countsByRegion) {
    const limit =
      region === originRegion
        ? Math.min(2, bandRules.maxStopoversPerRegion)
        : bandRules.maxStopoversPerRegion
    if (count > limit) {
      addRuleMessage(messages, {
        id: `stopovers.region.${region}`,
        rule: "8",
        kind: "violation",
        title: `Too many stopovers in ${region}`,
        description: `${count} stopovers count in this region; the applicable limit is ${limit}.`,
      })
    }
  }

  return stopoverCount
}
