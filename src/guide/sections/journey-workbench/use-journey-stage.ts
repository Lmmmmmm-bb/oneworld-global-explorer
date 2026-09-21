import { useEffect, useReducer, useRef, type RefObject } from "react"
import { useMotionValue } from "motion/react"
import {
  getStageFromProgress,
  getStageWithHysteresis,
} from "./stage-progress.ts"
import { INITIAL_STAGE_STATE, stageReducer } from "./stage-state.ts"
import type { StageId } from "./stages.ts"
import type { WorkbenchLayout } from "./use-workbench-layout.ts"

export const useJourneyStage = (
  ref: RefObject<HTMLElement | null>,
  layout: WorkbenchLayout
) => {
  const [state, dispatch] = useReducer(stageReducer, INITIAL_STAGE_STATE)
  const progress = useMotionValue(0)
  const scrollStage = useRef<StageId>("build")
  const focusedTab = useRef<string | null>(null)
  useEffect(() => {
    const section = ref.current
    if (!section) return
    const rememberFocus = (event: FocusEvent) => {
      const target = event.target
      focusedTab.current =
        target instanceof HTMLElement && target.matches('[role="tab"]')
          ? (target.dataset.stage ?? null)
          : null
    }
    const forgetFocus = (event: FocusEvent) => {
      // A breakpoint can hide the focused tab before the layout effect runs.
      // Keep its identity only for that browser-generated blur, not a user exit.
      if (
        event.relatedTarget ||
        (event.target instanceof HTMLElement &&
          event.target.getClientRects().length > 0)
      )
        focusedTab.current = null
    }
    section.addEventListener("focusin", rememberFocus)
    section.addEventListener("focusout", forgetFocus)
    return () => {
      section.removeEventListener("focusin", rememberFocus)
      section.removeEventListener("focusout", forgetFocus)
    }
  }, [ref])
  useEffect(() => {
    const section = ref.current
    if (!section) return
    let frame = 0
    if (!layout.cinematic) {
      frame = requestAnimationFrame(() => {
        const focused = document.activeElement
        const tabIsFocused =
          focused instanceof HTMLElement &&
          focused.matches('[role="tab"]') &&
          section.contains(focused)
        const id = tabIsFocused ? focused.dataset.stage : focusedTab.current
        if (id && (tabIsFocused || focused === document.body)) {
          section
            .querySelector<HTMLElement>(`[data-stage-heading="${id}"]`)
            ?.focus({ preventScroll: true })
        }
        focusedTab.current = null
        dispatch({ type: "FLOW" })
      })
      return () => cancelAnimationFrame(frame)
    }
    const sync = (initial: boolean) => {
      const start =
        section.getBoundingClientRect().top + window.scrollY - layout.top
      const value = Math.max(
        0,
        Math.min(1, (window.scrollY - start) / Math.max(1, layout.travel))
      )
      progress.set(value)
      const stage = initial
        ? getStageFromProgress(value)
        : getStageWithHysteresis(value, scrollStage.current)
      scrollStage.current = stage
      dispatch({ type: initial ? "RESYNC" : "SCROLL", stage })
    }
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => sync(false))
    }
    frame = requestAnimationFrame(() => sync(true))
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
    }
  }, [layout.cinematic, layout.top, layout.travel, progress, ref])

  return {
    stage: state.activeStage,
    progress,
    select: (stage: StageId) => dispatch({ type: "SELECT", stage }),
    lock: (locked: boolean) => dispatch({ type: "FOCUS_LOCK", locked }),
  }
}
