import { describe, expect, it } from "vitest"
import {
  INITIAL_STAGE_STATE as initial,
  stageReducer as reduce,
} from "./stage-state"
describe("workbench interaction priority", () => {
  it("keeps manual selection until a chapter boundary is crossed", () => {
    const selected = reduce(initial, { type: "SELECT", stage: "share" })
    expect(
      reduce(selected, { type: "SCROLL", stage: "build" }).activeStage
    ).toBe("share")
    expect(
      reduce(selected, { type: "SCROLL", stage: "check" }).activeStage
    ).toBe("check")
  })
  it("does not clear a user choice on layout resync", () => {
    const selected = reduce(initial, { type: "SELECT", stage: "share" })
    expect(
      reduce(selected, { type: "RESYNC", stage: "check" }).activeStage
    ).toBe("share")
  })
  it("protects focused content and resumes only on a subsequent scroll", () => {
    const locked = reduce(initial, { type: "FOCUS_LOCK", locked: true })
    const scrolled = reduce(locked, { type: "SCROLL", stage: "share" })
    expect(scrolled.activeStage).toBe("build")
    expect(scrolled.scrollStage).toBe("share")
    const unlocked = reduce(scrolled, { type: "FOCUS_LOCK", locked: false })
    expect(unlocked.activeStage).toBe("build")
    expect(
      reduce(unlocked, { type: "SCROLL", stage: "share" }).activeStage
    ).toBe("share")
  })
  it("lets explicit selection override focus protection", () => {
    const locked = reduce(initial, { type: "FOCUS_LOCK", locked: true })
    expect(reduce(locked, { type: "SELECT", stage: "check" }).activeStage).toBe(
      "check"
    )
  })
  it("clears obsolete locks and manual choices in flow mode", () => {
    const selected = reduce(initial, { type: "SELECT", stage: "share" })
    expect(reduce(selected, { type: "FLOW" })).toMatchObject({
      manual: null,
      focusLocked: false,
    })
  })
  it("returns the same snapshot for an unchanged scroll chapter", () => {
    expect(reduce(initial, { type: "SCROLL", stage: "build" })).toBe(initial)
  })
})
