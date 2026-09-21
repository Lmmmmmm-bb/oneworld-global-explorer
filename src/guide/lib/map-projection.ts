type Location = { latitude: number; longitude: number }

export type ProjectedRouteSegment = { d: string; length: number }

export const projectLocation = ({ latitude, longitude }: Location) => ({
  x: ((longitude + 180) / 360) * 1000,
  y: ((83 - latitude) / 143) * 440,
})

// Sample the great-circle arc, breaking the path at the date line.
// These lines illustrate geography, not an airline's filed flight path.
export const greatCircleSegments = (
  from: Location,
  to: Location
): ProjectedRouteSegment[] => {
  const radians = Math.PI / 180
  const vector = (point: Location) => [
    Math.cos(point.latitude * radians) * Math.cos(point.longitude * radians),
    Math.cos(point.latitude * radians) * Math.sin(point.longitude * radians),
    Math.sin(point.latitude * radians),
  ]
  const a = vector(from)
  const b = vector(to)
  const angle = Math.acos(
    Math.max(
      -1,
      Math.min(
        1,
        a.reduce((sum, v, i) => sum + v * b[i], 0)
      )
    )
  )
  if (angle < 1e-8) return []
  const segments: ProjectedRouteSegment[] = []
  let previous: ReturnType<typeof projectLocation> | undefined
  for (let index = 0; index <= 80; index++) {
    const progress = index / 80
    const start = Math.sin((1 - progress) * angle) / Math.sin(angle)
    const end = Math.sin(progress * angle) / Math.sin(angle)
    const [x, y, z] = a.map((value, i) => start * value + end * b[i])
    const point = projectLocation({
      longitude: Math.atan2(y, x) / radians,
      latitude: Math.atan2(z, Math.hypot(x, y)) / radians,
    })
    const coordinate = `${point.x.toFixed(2)},${point.y.toFixed(2)}`
    if (!previous || Math.abs(point.x - previous.x) > 500) {
      segments.push({ d: `M${coordinate}`, length: 0 })
    } else {
      const segment = segments[segments.length - 1]
      segment.d += ` L${coordinate}`
      segment.length += Math.hypot(point.x - previous.x, point.y - previous.y)
    }
    previous = point
  }
  return segments
}

export const greatCirclePath = (from: Location, to: Location): string =>
  greatCircleSegments(from, to)
    .map(({ d }) => d)
    .join(" ")
