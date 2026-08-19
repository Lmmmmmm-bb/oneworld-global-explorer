import type { Itinerary } from "@/features/itinerary"

import {
  AFFILIATED_OPERATORS,
  CODESHARE_EXCEPTIONS,
  ELIGIBLE_CARRIER_CODES,
} from "./config"
import { addRuleMessage, type RuleMessages } from "./messages"
import type { RuleDataContext } from "./types"

const isOperatingCarrierAllowed = (
  marketingCarrier: string,
  operatingCarrier: string
) => {
  if (
    ELIGIBLE_CARRIER_CODES.includes(operatingCarrier) &&
    !(marketingCarrier === "JL" && operatingCarrier === "GK")
  ) {
    return true
  }

  return [...CODESHARE_EXCEPTIONS, ...AFFILIATED_OPERATORS].some(
    (operator) =>
      operator.id === operatingCarrier &&
      operator.marketingCarriers !== "all" &&
      operator.marketingCarriers.includes(marketingCarrier)
  )
}

export const validateFlights = (
  itinerary: Itinerary,
  context: RuleDataContext,
  messages: RuleMessages
) => {
  if (itinerary.flights.length === 0) {
    addRuleMessage(messages, {
      id: "flights.empty",
      rule: "4",
      kind: "incomplete",
      title: "Add your first flight",
      description:
        "A Global Explorer route needs at least three total segments.",
    })
    return
  }

  itinerary.flights.forEach((flight, index) => {
    const label = `Flight ${index + 1}`
    const missingFields = [
      !flight.from && "departure airport",
      !flight.to && "arrival airport",
      !flight.marketingCarrier && "marketing carrier",
      flight.isCodeshare && !flight.operatingCarrier && "operating carrier",
    ].filter(Boolean)

    if (missingFields.length > 0) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.incomplete`,
        rule: "4",
        kind: "incomplete",
        title: `${label} is incomplete`,
        description: `Select ${missingFields.join(", ")}.`,
        segmentIds: [flight.id],
      })
      return
    }

    const fromAirport = context.airportByIata.get(flight.from)
    const toAirport = context.airportByIata.get(flight.to)
    if (!fromAirport || !toAirport) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.airport-unavailable`,
        rule: "4",
        kind: "violation",
        title: `${label} uses unavailable airport data`,
        description:
          "One of its airports is no longer in the eligible route snapshot.",
        segmentIds: [flight.id],
      })
      return
    }

    if (flight.from === flight.to) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.same-airport`,
        rule: "4",
        kind: "violation",
        title: `${label} has the same departure and arrival`,
        description: "A flight segment must connect two different airports.",
        segmentIds: [flight.id],
      })
      return
    }

    const route = context.getRoute(flight.from, flight.to)
    if (!route) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.route-unavailable`,
        rule: "4",
        kind: "violation",
        title: `${flight.from} to ${flight.to} is not in the route snapshot`,
        description:
          "Choose a direct route currently attributed to an eligible Global Explorer carrier.",
        segmentIds: [flight.id],
      })
    } else if (!route.carrierCodes.includes(flight.marketingCarrier)) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.carrier-route`,
        rule: "4(k)",
        kind: "violation",
        title: `${flight.marketingCarrier} is not listed on this route`,
        description: `Choose one of the eligible carriers available for ${flight.from} to ${flight.to}.`,
        segmentIds: [flight.id],
      })
    }

    if (!ELIGIBLE_CARRIER_CODES.includes(flight.marketingCarrier)) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.carrier-ineligible`,
        rule: "4(k)",
        kind: "violation",
        title: `${flight.marketingCarrier} is not an eligible marketing carrier`,
        description: "Select a carrier included in the Global Explorer rule.",
        segmentIds: [flight.id],
      })
    }

    if (
      flight.isCodeshare &&
      !isOperatingCarrierAllowed(
        flight.marketingCarrier,
        flight.operatingCarrier
      )
    ) {
      addRuleMessage(messages, {
        id: `flight.${flight.id}.codeshare`,
        rule: "4(k)",
        kind: "violation",
        title: `${label} has an ineligible codeshare operator`,
        description:
          flight.marketingCarrier === "JL" && flight.operatingCarrier === "GK"
            ? "JL flights operated by GK are specifically excluded."
            : "The selected marketing and operating carrier combination is not permitted by the basic route rule.",
        segmentIds: [flight.id],
      })
    }
  })

  const seenCityPairs = new Map<string, string>()
  for (const flight of itinerary.flights) {
    const from = context.airportByIata.get(flight.from)
    const to = context.airportByIata.get(flight.to)
    if (!from || !to) continue

    const key = `${from.city}:${from.countryCode}>${to.city}:${to.countryCode}`
    const firstSegmentId = seenCityPairs.get(key)
    if (firstSegmentId) {
      addRuleMessage(messages, {
        id: `routing.duplicate-city-pair.${key}`,
        rule: "4(j)",
        kind: "violation",
        title: "A city pair is repeated in the same direction",
        description: `${from.city} to ${to.city} may only be flown once in that direction.`,
        segmentIds: [firstSegmentId, flight.id],
      })
    } else {
      seenCityPairs.set(key, flight.id)
    }
  }
}
