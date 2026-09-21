import { describe, expect, it } from "vitest"
import { JOURNEY_LEGS } from "../data/journey"
import { greatCircleSegments } from "./map-projection"
import {
  createRouteDrawing,
  createRouteTimeline,
  segmentProgress,
} from "./route-drawing"

describe("continuous atlas drawing", () => {
  const drawing = createRouteDrawing(
    JOURNEY_LEGS.map(({ from, to }) => greatCircleSegments(from, to))
  )

  it("draws each leg and both Pacific pieces in journey order, without overlap or pauses", () => {
    expect(drawing.map(({ legIndex }) => legIndex)).toEqual([0, 1, 2, 3, 3])
    expect(drawing[0].delay).toBe(0)
    drawing.forEach((segment, index) => {
      expect(segment.d.match(/M/g)).toHaveLength(1)
      expect(segment.duration).toBeGreaterThan(0)
      if (index > 0) {
        const previous = drawing[index - 1]
        expect(segment.delay).toBeCloseTo(previous.delay + previous.duration)
      }
    })
    const last = drawing[drawing.length - 1]
    expect(last.delay + last.duration).toBeCloseTo(4)
  })

  it("keeps the pen moving at the same speed through stops and the date line", () => {
    const speed = drawing[0].length / drawing[0].duration
    drawing.forEach(({ length, duration }) =>
      expect(length / duration).toBeCloseTo(speed)
    )
  })

  it("does not schedule empty or zero-length strokes", () => {
    expect(createRouteDrawing([])).toEqual([])
    expect(createRouteDrawing([[{ d: "M0,0", length: 0 }]])).toEqual([])
  })

  it("derives arrivals from the final piece of each leg", () => {
    const timeline = createRouteTimeline(
      JOURNEY_LEGS.map(({ from, to }) => greatCircleSegments(from, to))
    )
    expect(timeline.arrivals).toHaveLength(4)
    for (const { legIndex, at } of timeline.arrivals) {
      const piece = timeline.segments
        .filter((segment) => segment.legIndex === legIndex)
        .at(-1)!
      expect(at).toBeCloseTo(piece.delay + piece.duration)
    }
    expect(timeline.arrivals.at(-1)?.at).toBeCloseTo(4)
    expect(createRouteTimeline([]).duration).toBe(0)
  })

  it("has at most one growing piece at any sampled instant", () => {
    for (let time = 0; time <= 4; time += 0.013) {
      const growing = drawing.filter((segment) => {
        const value = segmentProgress(time, segment)
        return value > 0 && value < 1
      })
      expect(growing.length).toBeLessThanOrEqual(1)
    }
    for (const segment of drawing)
      expect(segmentProgress(4, segment)).toBeCloseTo(1)
    expect(() => createRouteDrawing([], 0)).toThrow(RangeError)
    expect(() => createRouteDrawing([], Infinity)).toThrow(RangeError)
  })
})
