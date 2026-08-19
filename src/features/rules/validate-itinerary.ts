import type {
  Itinerary,
  ItineraryValidation,
  MileageBand,
} from "@/features/itinerary"
import { airportByIata, getRoute } from "@/features/route-data"

import { BAND_RULES } from "./config"
import { deriveJourney } from "./derive-journey"
import { getTravelRegion } from "./geography"
import { createRuleMessages, addRuleMessage } from "./messages"
import { resolveMileageBand } from "./mileage"
import type { RuleDataContext } from "./types"
import { validateFlights } from "./validate-flights"
import { validateRouting } from "./validate-routing"
import { validateStopovers } from "./validate-stopovers"

const defaultContext: RuleDataContext = { airportByIata, getRoute }

const getRegionPath = (journey: ReturnType<typeof deriveJourney>): string[] => {
  const regions = journey.legs.flatMap((leg, index) => [
    ...(index === 0 ? [getTravelRegion(leg.from)] : []),
    getTravelRegion(leg.to),
  ])

  return regions.filter((region, index) => region !== regions[index - 1])
}

const validateMileage = (
  itinerary: Itinerary,
  totalMiles: number,
  selectedBand: MileageBand | null,
  messages: ReturnType<typeof createRuleMessages>
) => {
  if (
    itinerary.mileageBand !== "auto" &&
    !BAND_RULES[itinerary.mileageBand].compatibleCabins.includes(
      itinerary.cabinClass
    )
  ) {
    addRuleMessage(messages, {
      id: "mileage.cabin-band",
      rule: "4",
      kind: "violation",
      title: "The mileage band is not available for this cabin",
      description: `${itinerary.mileageBand.toLocaleString()} miles is not compatible with ${itinerary.cabinClass} class.`,
    })
  }

  if (!selectedBand) {
    addRuleMessage(messages, {
      id: "mileage.exceeded",
      rule: "4",
      kind: "violation",
      title: "The route exceeds the available mileage bands",
      description: `${totalMiles.toLocaleString()} estimated miles is above every band available for ${itinerary.cabinClass} class.`,
    })
    return
  }

  if (totalMiles > selectedBand) {
    addRuleMessage(messages, {
      id: "mileage.band-exceeded",
      rule: "4",
      kind: "violation",
      title: `The ${selectedBand.toLocaleString()}-mile band is exceeded`,
      description: `${totalMiles.toLocaleString()} estimated miles is ${(
        totalMiles - selectedBand
      ).toLocaleString()} miles over the selected band.`,
    })
    return
  }

  const remainingMiles = selectedBand - totalMiles
  if (remainingMiles <= Math.max(500, selectedBand * 0.02)) {
    addRuleMessage(messages, {
      id: "mileage.near-limit",
      rule: "4",
      kind: "warning",
      title: "Mileage is close to the selected limit",
      description: `${remainingMiles.toLocaleString()} estimated miles remain in the ${selectedBand.toLocaleString()}-mile band.`,
    })
  }
}

export const validateItinerary = (
  itinerary: Itinerary,
  context: RuleDataContext = defaultContext
): ItineraryValidation => {
  const messages = createRuleMessages()
  const journey = deriveJourney(itinerary, context)
  const selectedBand = resolveMileageBand(
    itinerary.mileageBand,
    itinerary.cabinClass,
    journey.totalMiles
  )

  validateFlights(itinerary, context, messages)
  const crossingCounts = validateRouting(itinerary, journey, context, messages)
  validateMileage(itinerary, journey.totalMiles, selectedBand, messages)
  const stopoverCount = validateStopovers(
    itinerary,
    journey,
    selectedBand,
    context,
    messages
  )

  const status =
    messages.violations.length > 0
      ? "invalid"
      : messages.incomplete.length > 0
        ? "incomplete"
        : "valid"

  return {
    status,
    violations: messages.violations,
    incomplete: messages.incomplete,
    warnings: messages.warnings,
    openJaws: journey.openJaws,
    metrics: {
      flightCount: itinerary.flights.length,
      openJawCount: journey.openJaws.length,
      segmentCount: itinerary.flights.length + journey.openJaws.length,
      flightMiles: journey.flightMiles,
      openJawMiles: journey.openJawMiles,
      totalMiles: journey.totalMiles,
      selectedBand,
      remainingMiles: selectedBand ? selectedBand - journey.totalMiles : null,
      stopoverCount: stopoverCount ?? 0,
      atlanticCrossings: crossingCounts.atlanticCrossings,
      pacificCrossings: crossingCounts.pacificCrossings,
      regionPath: getRegionPath(journey),
    },
  }
}
