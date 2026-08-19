import type { Itinerary } from "@/features/itinerary"

import {
  getOceanCrossing,
  getTrafficConference,
  getTravelRegion,
  isInternational,
  isPermittedOriginDestinationSurface,
  type TrafficConference,
  type TravelRegion,
} from "./geography"
import { addRuleMessage, type RuleMessages } from "./messages"
import type { DerivedJourney, RuleDataContext } from "./types"

const CONFERENCE_INDEX: Record<TrafficConference, number> = {
  TC1: 0,
  TC2: 1,
  TC3: 2,
}

const getDirection = (from: TrafficConference, to: TrafficConference) => {
  const delta = (CONFERENCE_INDEX[to] - CONFERENCE_INDEX[from] + 3) % 3
  return delta === 1 ? "forward" : "reverse"
}

const hasQualifyingUsTransfer = (
  itinerary: Itinerary,
  context: RuleDataContext
) =>
  itinerary.flights.some((flight, index) => {
    const nextFlight = itinerary.flights[index + 1]
    const from = context.airportByIata.get(flight.from)
    const to = context.airportByIata.get(flight.to)
    const nextTo = nextFlight
      ? context.airportByIata.get(nextFlight.to)
      : undefined

    return Boolean(
      nextFlight &&
      from &&
      to &&
      nextTo &&
      to.countryCode === "US" &&
      flight.arrivalType === "transfer" &&
      nextFlight.from === flight.to &&
      isInternational(from, to) &&
      isInternational(to, nextTo)
    )
  })

export const validateRouting = (
  itinerary: Itinerary,
  journey: DerivedJourney,
  context: RuleDataContext,
  messages: RuleMessages
) => {
  const segmentCount = itinerary.flights.length + journey.openJaws.length

  if (segmentCount < 3) {
    addRuleMessage(messages, {
      id: "routing.minimum-segments",
      rule: "4(i)",
      kind: "incomplete",
      title: "At least three total segments are required",
      description: `${segmentCount} of the minimum 3 flight and open-jaw segments are planned.`,
    })
  }
  if (segmentCount > 16) {
    addRuleMessage(messages, {
      id: "routing.maximum-segments",
      rule: "4(i)",
      kind: "violation",
      title: "The 16-segment limit is exceeded",
      description: `${segmentCount} flight and open-jaw segments are currently planned.`,
    })
  }

  const firstFlight = itinerary.flights[0]
  const lastFlight = itinerary.flights.at(-1)
  if (!firstFlight || !lastFlight) {
    return { atlanticCrossings: 0, pacificCrossings: 0 }
  }

  if (!itinerary.endWithOpenJaw && lastFlight.to !== firstFlight.from) {
    addRuleMessage(messages, {
      id: "routing.not-closed",
      rule: "4(d)",
      kind: "incomplete",
      title: "Return to the starting airport or end with an open jaw",
      description: `The current route ends at ${lastFlight.to}, not ${firstFlight.from}.`,
    })
  }

  const originSurface = journey.openJaws.find(
    (openJaw) => openJaw.isOriginDestination
  )
  if (originSurface) {
    const origin = context.airportByIata.get(originSurface.to)
    const destination = context.airportByIata.get(originSurface.from)
    if (
      origin &&
      destination &&
      !isPermittedOriginDestinationSurface(origin, destination)
    ) {
      addRuleMessage(messages, {
        id: "routing.origin-surface",
        rule: "4(d)",
        kind: "violation",
        title: "The origin-to-destination open jaw is not permitted",
        description: `${destination.iata} to ${origin.iata} is outside the listed origin-destination surface exceptions.`,
        segmentIds: [originSurface.id],
      })
    }
  }

  itinerary.flights.forEach((flight, index) => {
    const revisitsOrigin =
      (flight.to === firstFlight.from &&
        index < itinerary.flights.length - 1) ||
      (flight.from === firstFlight.from && index > 0)

    if (revisitsOrigin) {
      addRuleMessage(messages, {
        id: "routing.via-origin",
        rule: "4(e)",
        kind: "violation",
        title: "The route travels via its point of origin",
        description: `${firstFlight.from} may only be the starting point and final terminus.`,
        segmentIds: [flight.id],
      })
    }
  })

  let atlanticCrossings = 0
  let pacificCrossings = 0
  const directions = new Set<string>()

  for (const leg of journey.legs) {
    const fromConference = getTrafficConference(getTravelRegion(leg.from))
    const toConference = getTrafficConference(getTravelRegion(leg.to))
    if (fromConference === toConference) continue

    directions.add(getDirection(fromConference, toConference))
    const ocean = getOceanCrossing(fromConference, toConference)
    if (ocean === "Atlantic") atlanticCrossings += 1
    if (ocean === "Pacific") pacificCrossings += 1
  }

  if (atlanticCrossings === 0) {
    addRuleMessage(messages, {
      id: "routing.atlantic-missing",
      rule: "4(b)",
      kind: "incomplete",
      title: "Add one Atlantic crossing",
      description:
        "The completed journey must cross the Atlantic exactly once.",
    })
  } else if (atlanticCrossings > 1) {
    addRuleMessage(messages, {
      id: "routing.atlantic-repeated",
      rule: "4(b)",
      kind: "violation",
      title: "The Atlantic is crossed more than once",
      description: `${atlanticCrossings} Atlantic crossings are currently present; only one is permitted.`,
    })
  }

  if (pacificCrossings === 0) {
    addRuleMessage(messages, {
      id: "routing.pacific-missing",
      rule: "4(b)",
      kind: "incomplete",
      title: "Add one Pacific crossing",
      description: "The completed journey must cross the Pacific exactly once.",
    })
  } else if (pacificCrossings > 1) {
    addRuleMessage(messages, {
      id: "routing.pacific-repeated",
      rule: "4(b)",
      kind: "violation",
      title: "The Pacific is crossed more than once",
      description: `${pacificCrossings} Pacific crossings are currently present; only one is permitted.`,
    })
  }

  if (directions.size > 1) {
    addRuleMessage(messages, {
      id: "routing.direction",
      rule: "4(c)",
      kind: "violation",
      title: "Intercontinental travel changes direction",
      description:
        "Keep moving continuously through the three global areas; backtracking is only allowed within one area.",
    })
  }

  const transoceanicSurfaces = journey.legs.filter((leg) => {
    if (leg.kind !== "open-jaw") return false
    const fromConference = getTrafficConference(getTravelRegion(leg.from))
    const toConference = getTrafficConference(getTravelRegion(leg.to))
    return getOceanCrossing(fromConference, toConference) !== null
  })
  const origin = context.airportByIata.get(firstFlight.from)
  const surfaceAllowance =
    origin && getTravelRegion(origin) === "South West Pacific" ? 1 : 0
  if (transoceanicSurfaces.length > surfaceAllowance) {
    addRuleMessage(messages, {
      id: "routing.transoceanic-surface",
      rule: "4(h)",
      kind: "violation",
      title: "A transoceanic open jaw is not permitted",
      description:
        surfaceAllowance === 1
          ? "Journeys originating in the South West Pacific may contain only one transoceanic open jaw."
          : "Open jaws between the Americas and Europe/Africa or Asia/South West Pacific are not permitted.",
      segmentIds: transoceanicSurfaces.map(({ id }) => id),
    })
  }

  const regionArrivals = new Map<TravelRegion, number>()
  const regionDepartures = new Map<TravelRegion, number>()
  const internationalDepartures = new Map<string, number>()
  let originCountryArrivals = 0
  let originCountryDepartures = 0

  for (const leg of journey.legs) {
    const fromRegion = getTravelRegion(leg.from)
    const toRegion = getTravelRegion(leg.to)
    if (fromRegion !== toRegion) {
      regionDepartures.set(
        fromRegion,
        (regionDepartures.get(fromRegion) ?? 0) + 1
      )
      regionArrivals.set(toRegion, (regionArrivals.get(toRegion) ?? 0) + 1)
    }

    if (!isInternational(leg.from, leg.to)) continue
    internationalDepartures.set(
      leg.from.countryCode,
      (internationalDepartures.get(leg.from.countryCode) ?? 0) + 1
    )
    if (origin && leg.from.countryCode === origin.countryCode) {
      originCountryDepartures += 1
    }
    if (origin && leg.to.countryCode === origin.countryCode) {
      originCountryArrivals += 1
    }
  }

  const usesEligibleAfricaException = journey.legs.some((leg) =>
    [leg.from, leg.to].some(
      (airport) =>
        getTravelRegion(airport) === "Africa" &&
        !["ZA", "MU"].includes(airport.countryCode)
    )
  )
  const allRegions = new Set([
    ...regionArrivals.keys(),
    ...regionDepartures.keys(),
  ])
  for (const region of allRegions) {
    const limit =
      region === "North America" ||
      region === "Asia" ||
      (region === "Europe / Middle East" && usesEligibleAfricaException)
        ? 2
        : 1
    const arrivals = regionArrivals.get(region) ?? 0
    const departures = regionDepartures.get(region) ?? 0
    if (arrivals > limit || departures > limit) {
      addRuleMessage(messages, {
        id: `routing.intercontinental.${region}`,
        rule: "4(f)",
        kind: "violation",
        title: `Too many intercontinental entries or exits in ${region}`,
        description: `${arrivals} arrivals and ${departures} departures are planned; the applicable limit is ${limit} of each.`,
      })
    }
  }

  if (origin) {
    const originCountryLimit =
      origin.countryCode === "US" && hasQualifyingUsTransfer(itinerary, context)
        ? 2
        : 1
    if (
      originCountryArrivals > originCountryLimit ||
      originCountryDepartures > originCountryLimit
    ) {
      addRuleMessage(messages, {
        id: "routing.origin-country",
        rule: "4(g)",
        kind: "violation",
        title: "Too many international entries or exits in the origin country",
        description: `${originCountryArrivals} international arrivals and ${originCountryDepartures} departures involve ${origin.country}; the applicable limit is ${originCountryLimit} of each.`,
      })
    }
  }

  for (const [countryCode, departures] of internationalDepartures) {
    if (departures > 4) {
      addRuleMessage(messages, {
        id: `routing.international-transfers.${countryCode}`,
        rule: "4(g)",
        kind: "violation",
        title: `More than four international transfers depart ${countryCode}`,
        description: `${departures} international departures are currently planned from this country.`,
      })
    }
  }

  return { atlanticCrossings, pacificCrossings }
}
