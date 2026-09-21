import { JOURNEY_STEPS, type StageId } from "./stages.ts"

const STAGE_COUNT = JOURNEY_STEPS.length
const STAGE_HYSTERESIS = 0.02

export const getStageFromProgress = (progress: number): StageId =>
  JOURNEY_STEPS[
    Math.min(
      STAGE_COUNT - 1,
      Math.floor(
        Math.max(0, Number.isFinite(progress) ? progress : 0) * STAGE_COUNT
      )
    )
  ].id

export const getStageWithHysteresis = (
  progress: number,
  previous: StageId
): StageId => {
  const index = JOURNEY_STEPS.findIndex(({ id }) => id === previous)
  const target = getStageFromProgress(progress)
  const next = JOURNEY_STEPS.findIndex(({ id }) => id === target)
  if (next > index && progress < (index + 1) / STAGE_COUNT + STAGE_HYSTERESIS)
    return previous
  if (next < index && progress > index / STAGE_COUNT - STAGE_HYSTERESIS)
    return previous
  return target
}

export const getStageForKey = (stage: StageId, key: string): StageId | null => {
  const index = JOURNEY_STEPS.findIndex(({ id }) => id === stage)
  switch (key) {
    case "Home":
      return JOURNEY_STEPS[0].id
    case "End":
      return JOURNEY_STEPS[STAGE_COUNT - 1].id
    case "ArrowDown":
      return JOURNEY_STEPS[(index + 1) % STAGE_COUNT].id
    case "ArrowUp":
      return JOURNEY_STEPS[(index + STAGE_COUNT - 1) % STAGE_COUNT].id
    default:
      return null
  }
}
