interface SmoothAngularVelocityOptions {
  elapsedMs: number
  maximumVelocity: number
  movement: number
  previousVelocity: number
  sensitivity: number
  smoothing: number
}

interface ReleaseAngularVelocityOptions {
  cancelled: boolean
  maximumSampleAgeMs: number
  minimumVelocity: number
  reducedMotion: boolean
  sampleAgeMs: number
  velocity: number
}

interface StepAngularInertiaOptions {
  elapsedMs: number
  minimumVelocity: number
  timeConstantMs: number
  velocity: number
}

interface AngularInertiaStep {
  active: boolean
  rotation: number
  velocity: number
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

export const smoothAngularVelocity = ({
  elapsedMs,
  maximumVelocity,
  movement,
  previousVelocity,
  sensitivity,
  smoothing,
}: SmoothAngularVelocityOptions) => {
  if (elapsedMs <= 0) return previousVelocity

  const instantaneousVelocity = clamp(
    (movement * sensitivity) / elapsedMs,
    -maximumVelocity,
    maximumVelocity
  )

  return (
    previousVelocity +
    (instantaneousVelocity - previousVelocity) * clamp(smoothing, 0, 1)
  )
}

export const resolveReleaseAngularVelocity = ({
  cancelled,
  maximumSampleAgeMs,
  minimumVelocity,
  reducedMotion,
  sampleAgeMs,
  velocity,
}: ReleaseAngularVelocityOptions) => {
  if (
    cancelled ||
    reducedMotion ||
    sampleAgeMs > maximumSampleAgeMs ||
    Math.abs(velocity) < minimumVelocity
  ) {
    return 0
  }

  return velocity
}

export const stepAngularInertia = ({
  elapsedMs,
  minimumVelocity,
  timeConstantMs,
  velocity,
}: StepAngularInertiaOptions): AngularInertiaStep => {
  if (timeConstantMs <= 0 || Math.abs(velocity) < minimumVelocity) {
    return {
      active: false,
      rotation: 0,
      velocity: 0,
    }
  }

  if (elapsedMs <= 0) {
    return {
      active: true,
      rotation: 0,
      velocity,
    }
  }

  const decay = Math.exp(-elapsedMs / timeConstantMs)
  const nextVelocity = velocity * decay
  const rotation = velocity * timeConstantMs * (1 - decay)

  if (Math.abs(nextVelocity) < minimumVelocity) {
    return {
      active: false,
      rotation,
      velocity: 0,
    }
  }

  return {
    active: true,
    rotation,
    velocity: nextVelocity,
  }
}
