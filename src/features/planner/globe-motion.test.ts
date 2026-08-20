import { describe, expect, it } from "vitest"

import {
  resolveReleaseAngularVelocity,
  smoothAngularVelocity,
  stepAngularInertia,
} from "./globe-motion"

describe("globe motion", () => {
  it("samples angular velocity in the direction of the drag", () => {
    expect(
      smoothAngularVelocity({
        elapsedMs: 10,
        maximumVelocity: 0.006,
        movement: 10,
        previousVelocity: 0,
        sensitivity: 0.004,
        smoothing: 0.25,
      })
    ).toBeCloseTo(0.001)

    expect(
      smoothAngularVelocity({
        elapsedMs: 10,
        maximumVelocity: 0.006,
        movement: -10,
        previousVelocity: 0,
        sensitivity: 0.004,
        smoothing: 0.25,
      })
    ).toBeCloseTo(-0.001)
  })

  it("caps unusually fast pointer samples", () => {
    expect(
      smoothAngularVelocity({
        elapsedMs: 1,
        maximumVelocity: 0.006,
        movement: 100,
        previousVelocity: 0,
        sensitivity: 0.01,
        smoothing: 1,
      })
    ).toBe(0.006)
  })

  it.each([
    { cancelled: true, reducedMotion: false, sampleAgeMs: 10 },
    { cancelled: false, reducedMotion: true, sampleAgeMs: 10 },
    { cancelled: false, reducedMotion: false, sampleAgeMs: 81 },
  ])(
    "does not start inertia for cancelled, reduced, or stale input",
    ({ cancelled, reducedMotion, sampleAgeMs }) => {
      expect(
        resolveReleaseAngularVelocity({
          cancelled,
          maximumSampleAgeMs: 80,
          minimumVelocity: 0.00002,
          reducedMotion,
          sampleAgeMs,
          velocity: 0.003,
        })
      ).toBe(0)
    }
  )

  it("preserves a recent release velocity above the threshold", () => {
    expect(
      resolveReleaseAngularVelocity({
        cancelled: false,
        maximumSampleAgeMs: 80,
        minimumVelocity: 0.00002,
        reducedMotion: false,
        sampleAgeMs: 16,
        velocity: -0.003,
      })
    ).toBe(-0.003)
  })

  it("decelerates without changing direction", () => {
    const positive = stepAngularInertia({
      elapsedMs: 16,
      minimumVelocity: 0.00002,
      timeConstantMs: 325,
      velocity: 0.003,
    })
    const negative = stepAngularInertia({
      elapsedMs: 16,
      minimumVelocity: 0.00002,
      timeConstantMs: 325,
      velocity: -0.003,
    })

    expect(positive.rotation).toBeGreaterThan(0)
    expect(positive.velocity).toBeGreaterThan(0)
    expect(positive.velocity).toBeLessThan(0.003)
    expect(negative.rotation).toBeLessThan(0)
    expect(negative.velocity).toBeLessThan(0)
    expect(negative.velocity).toBeGreaterThan(-0.003)
  })

  it("travels the same distance across common refresh rates", () => {
    const simulate = (framesPerSecond: number) => {
      const frameCount = Math.round(framesPerSecond * 1.2)
      const elapsedMs = 1_200 / frameCount
      let rotation = 0
      let velocity = 0.004

      for (let frame = 0; frame < frameCount; frame += 1) {
        const step = stepAngularInertia({
          elapsedMs,
          minimumVelocity: 0.000000001,
          timeConstantMs: 325,
          velocity,
        })
        rotation += step.rotation
        velocity = step.velocity
      }

      return { rotation, velocity }
    }

    const at30Fps = simulate(30)
    const at60Fps = simulate(60)
    const at120Fps = simulate(120)

    expect(at30Fps.rotation).toBeCloseTo(at60Fps.rotation, 10)
    expect(at120Fps.rotation).toBeCloseTo(at60Fps.rotation, 10)
    expect(at30Fps.velocity).toBeCloseTo(at60Fps.velocity, 10)
    expect(at120Fps.velocity).toBeCloseTo(at60Fps.velocity, 10)
  })

  it("stops after decaying below the minimum velocity", () => {
    const step = stepAngularInertia({
      elapsedMs: 32,
      minimumVelocity: 0.00002,
      timeConstantMs: 325,
      velocity: 0.000021,
    })

    expect(step.active).toBe(false)
    expect(step.rotation).toBeGreaterThan(0)
    expect(step.velocity).toBe(0)
  })
})
