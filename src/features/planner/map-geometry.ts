import type { FlightSegment } from "@/features/itinerary"
import type { Airport } from "@/features/route-data"

type Vector = [number, number, number]
type Position = [number, number]
type RouteGeometry =
  | { type: "LineString"; coordinates: Position[] }
  | { type: "MultiLineString"; coordinates: Position[][] }

interface RouteFeature {
  type: "Feature"
  properties: { sequence: number }
  geometry: RouteGeometry
}

interface RouteFeatureCollection {
  type: "FeatureCollection"
  features: RouteFeature[]
}

const toRadians = (value: number) => (value * Math.PI) / 180
const toDegrees = (value: number) => (value * 180) / Math.PI

const toVector = (airport: Airport): Vector => {
  const latitude = toRadians(airport.latitude)
  const longitude = toRadians(airport.longitude)
  return [
    Math.cos(latitude) * Math.cos(longitude),
    Math.cos(latitude) * Math.sin(longitude),
    Math.sin(latitude),
  ]
}

const toPosition = ([x, y, z]: Vector): Position => [
  toDegrees(Math.atan2(y, x)),
  toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
]

export const createGreatCircle = (
  from: Airport,
  to: Airport,
  steps = 48
): Position[] => {
  const start = toVector(from)
  const end = toVector(to)
  const dot = Math.max(
    -1,
    Math.min(1, start[0] * end[0] + start[1] * end[1] + start[2] * end[2])
  )
  const angle = Math.acos(dot)

  if (angle < 0.000001) {
    return [
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ]
  }

  return Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const denominator = Math.sin(angle)
    const fromWeight = Math.sin((1 - progress) * angle) / denominator
    const toWeight = Math.sin(progress * angle) / denominator
    return toPosition([
      start[0] * fromWeight + end[0] * toWeight,
      start[1] * fromWeight + end[1] * toWeight,
      start[2] * fromWeight + end[2] * toWeight,
    ])
  })
}

export const splitAtAntimeridian = (positions: Position[]): Position[][] => {
  if (positions.length < 2) return [positions]
  const lines: Position[][] = [[positions[0]]]

  for (let index = 1; index < positions.length; index += 1) {
    const previous = positions[index - 1]
    const current = positions[index]
    const activeLine = lines.at(-1)!
    const longitudeDelta = current[0] - previous[0]

    if (Math.abs(longitudeDelta) <= 180) {
      activeLine.push(current)
      continue
    }

    const adjustedCurrentLongitude =
      current[0] + (longitudeDelta > 0 ? -360 : 360)
    const boundary = longitudeDelta > 0 ? -180 : 180
    const progress =
      (boundary - previous[0]) / (adjustedCurrentLongitude - previous[0])
    const crossingLatitude = previous[1] + (current[1] - previous[1]) * progress

    activeLine.push([boundary, crossingLatitude])
    lines.push([[-boundary, crossingLatitude], current])
  }

  return lines
}

export const buildRouteGeoJson = (
  flights: FlightSegment[],
  airportByIata: Map<string, Airport>
): RouteFeatureCollection => {
  const features = flights.flatMap((flight, index) => {
    const from = airportByIata.get(flight.from)
    const to = airportByIata.get(flight.to)
    if (!from || !to) return []

    const lines = splitAtAntimeridian(createGreatCircle(from, to))
    const geometry: RouteGeometry =
      lines.length === 1
        ? { type: "LineString", coordinates: lines[0] }
        : { type: "MultiLineString", coordinates: lines }
    const feature: RouteFeature = {
      type: "Feature",
      properties: { sequence: index + 1 },
      geometry,
    }
    return [feature]
  })

  return { type: "FeatureCollection", features }
}

export interface RoutePoint {
  airport: Airport
  sequence: string
}

export const buildRoutePoints = (
  flights: FlightSegment[],
  airportByIata: Map<string, Airport>
): RoutePoint[] => {
  const visits: string[] = []
  flights.forEach((flight, index) => {
    const previous = flights[index - 1]
    if (!previous || previous.to !== flight.from) visits.push(flight.from)
    visits.push(flight.to)
  })

  const sequencesByAirport = new Map<string, number[]>()
  visits.forEach((iata, index) => {
    sequencesByAirport.set(iata, [
      ...(sequencesByAirport.get(iata) ?? []),
      index + 1,
    ])
  })

  return [...sequencesByAirport.entries()].flatMap(([iata, sequences]) => {
    const airport = airportByIata.get(iata)
    return airport ? [{ airport, sequence: sequences.join(",") }] : []
  })
}
