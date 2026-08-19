const KM_TO_MILES = 0.621371

const isAirportCode = (value) => /^[A-Z]{3}$/.test(value)

const toCoordinate = (value) => {
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate : null
}

const toAirport = (airport) => {
  const latitude = toCoordinate(airport.latitude)
  const longitude = toCoordinate(airport.longitude)

  if (
    !isAirportCode(airport.iata) ||
    latitude === null ||
    longitude === null
  ) {
    return null
  }

  return {
    iata: airport.iata,
    name: airport.name,
    city: airport.city_name || airport.name,
    country: airport.country,
    countryCode: airport.country_code,
    continentCode: airport.continent,
    latitude,
    longitude,
  }
}

export const transformRouteData = ({
  rawAirports,
  eligibleCarrierCodes,
  sourceCommit,
  sourceRepository,
}) => {
  const eligibleCodes = new Set(eligibleCarrierCodes)
  const sourceAirportCodes = new Set(Object.keys(rawAirports))
  const routeByPair = new Map()

  for (const [from, airport] of Object.entries(rawAirports)) {
    if (!isAirportCode(from)) continue

    for (const route of airport.routes ?? []) {
      if (!isAirportCode(route.iata) || !sourceAirportCodes.has(route.iata)) {
        continue
      }

      const carrierCodes = (route.carriers ?? [])
        .map((carrier) => carrier.iata)
        .filter((code) => eligibleCodes.has(code))

      if (carrierCodes.length === 0) continue

      const key = `${from}-${route.iata}`
      const existing = routeByPair.get(key)
      const mergedCodes = new Set([
        ...(existing?.carrierCodes ?? []),
        ...carrierCodes,
      ])

      routeByPair.set(key, {
        from,
        to: route.iata,
        distanceMiles: Math.round(Number(route.km) * KM_TO_MILES),
        estimatedMinutes: Number(route.min) || null,
        carrierCodes: [...mergedCodes].sort(),
      })
    }
  }

  const routes = [...routeByPair.values()].sort(
    (left, right) =>
      left.from.localeCompare(right.from) || left.to.localeCompare(right.to)
  )
  const connectedAirportCodes = new Set(
    routes.flatMap((route) => [route.from, route.to])
  )
  const airports = Object.values(rawAirports)
    .map(toAirport)
    .filter((airport) => airport && connectedAirportCodes.has(airport.iata))
    .sort((left, right) => left.iata.localeCompare(right.iata))

  return {
    metadata: {
      sourceRepository,
      sourceCommit,
      eligibleCarrierCodes: [...eligibleCarrierCodes],
    },
    airports,
    routes,
  }
}
