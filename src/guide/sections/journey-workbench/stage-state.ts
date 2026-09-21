import type { StageId } from "./stages.ts"

export type StageState = {
  scrollStage: StageId
  activeStage: StageId
  manual: { atScrollStage: StageId } | null
  focusLocked: boolean
  resumeOnScroll: boolean
}

export type StageEvent =
  | { type: "SCROLL"; stage: StageId }
  | { type: "RESYNC"; stage: StageId }
  | { type: "SELECT"; stage: StageId }
  | { type: "FOCUS_LOCK"; locked: boolean }
  | { type: "FLOW" }

export const INITIAL_STAGE_STATE: StageState = {
  scrollStage: "build",
  activeStage: "build",
  manual: null,
  focusLocked: false,
  resumeOnScroll: false,
}

export const stageReducer = (
  state: StageState,
  event: StageEvent
): StageState => {
  if (event.type === "SELECT")
    return {
      ...state,
      activeStage: event.stage,
      manual: { atScrollStage: state.scrollStage },
      resumeOnScroll: false,
    }
  if (event.type === "FOCUS_LOCK") {
    if (event.locked === state.focusLocked) return state
    return {
      ...state,
      focusLocked: event.locked,
      resumeOnScroll: !event.locked,
    }
  }
  if (event.type === "FLOW")
    return {
      ...state,
      manual: null,
      focusLocked: false,
      resumeOnScroll: false,
    }
  const preserve =
    state.focusLocked ||
    (event.type === "RESYNC" && state.manual !== null) ||
    (!state.resumeOnScroll && state.manual?.atScrollStage === event.stage)
  const activeStage = preserve ? state.activeStage : event.stage
  const manual = preserve ? state.manual : null
  if (
    state.scrollStage === event.stage &&
    state.activeStage === activeStage &&
    state.manual === manual &&
    !state.resumeOnScroll
  )
    return state
  return {
    ...state,
    scrollStage: event.stage,
    activeStage,
    manual,
    resumeOnScroll: state.focusLocked ? state.resumeOnScroll : false,
  }
}
