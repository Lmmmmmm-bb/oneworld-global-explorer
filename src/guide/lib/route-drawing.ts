import type { ProjectedRouteSegment } from "./map-projection.ts"

export const createRouteDrawing = (
  legs: ProjectedRouteSegment[][],
  totalDuration = 4
) => {
  if (!Number.isFinite(totalDuration) || totalDuration <= 0)
    throw new RangeError("Route duration must be a finite positive number")
  const segments = legs.flatMap((leg, legIndex) =>
    leg
      .filter(({ length }) => Number.isFinite(length) && length > 0)
      .map((segment) => ({ ...segment, legIndex }))
  )
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0)
  let elapsed = 0
  return segments.map((segment) => {
    const duration = (segment.length / totalLength) * totalDuration
    const delay = elapsed
    elapsed += duration
    return { ...segment, delay, duration }
  })
}
export type DrawSegment = ReturnType<typeof createRouteDrawing>[number]
export const segmentProgress = (time: number, segment: DrawSegment) =>
  Math.max(0, Math.min(1, (time - segment.delay) / segment.duration))

export const createRouteTimeline = (
  legs: ProjectedRouteSegment[][],
  duration = 4
) => {
  const segments = createRouteDrawing(legs, duration)
  const arrivals = new Map<number, number>()
  for (const piece of segments)
    arrivals.set(piece.legIndex, piece.delay + piece.duration)
  return {
    duration: segments.length ? duration : 0,
    segments,
    arrivals: [...arrivals].map(([legIndex, at]) => ({ legIndex, at })),
  }
}
