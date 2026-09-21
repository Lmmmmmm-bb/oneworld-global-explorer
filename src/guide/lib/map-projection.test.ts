import { describe, expect, it } from "vitest"
import { JOURNEY_AIRPORTS } from "../data/journey"
import { greatCirclePath, projectLocation } from "./map-projection"

describe("guide route atlas", () => {
  it("splits the trans-Pacific leg at the date line instead of drawing across the map", () => {
    const path = greatCirclePath(JOURNEY_AIRPORTS[3], JOURNEY_AIRPORTS[0])
    expect(path.match(/M/g)).toHaveLength(2)
    const subpaths = path.split("M").filter(Boolean)
    for (const subpath of subpaths) {
      const points = subpath
        .split(" L")
        .map((point) => point.split(",").map(Number))
      expect(points.flat().every(Number.isFinite)).toBe(true)
      for (let i = 1; i < points.length; i++) {
        expect(Math.abs(points[i][0] - points[i - 1][0])).toBeLessThan(500)
      }
    }
  })

  it("ends each arc at its airport marker", () => {
    JOURNEY_AIRPORTS.forEach((from, index) => {
      const to = JOURNEY_AIRPORTS[(index + 1) % JOURNEY_AIRPORTS.length]
      const start = projectLocation(from)
      const end = projectLocation(to)
      const path = greatCirclePath(from, to)
      expect(
        path.startsWith(`M${start.x.toFixed(2)},${start.y.toFixed(2)}`)
      ).toBe(true)
      expect(path.endsWith(`${end.x.toFixed(2)},${end.y.toFixed(2)}`)).toBe(
        true
      )
    })
  })
})
