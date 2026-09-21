import { describe, expect, it } from "vitest"
import {
  getStageForKey,
  getStageFromProgress,
  getStageWithHysteresis,
} from "./stage-progress"
describe("workbench chapter navigation", () => {
  it("clamps and restores the exact current chapter", () => {
    expect(
      [-1, 0, 0.32, 1 / 3, 0.65, 2 / 3, 1, 2].map(getStageFromProgress)
    ).toEqual([
      "build",
      "build",
      "build",
      "check",
      "check",
      "share",
      "share",
      "share",
    ])
  })
  it("avoids boundary jitter but permits large jumps", () => {
    expect(getStageWithHysteresis(0.34, "build")).toBe("build")
    expect(getStageWithHysteresis(0.36, "build")).toBe("check")
    expect(getStageWithHysteresis(0.32, "check")).toBe("check")
    expect(getStageWithHysteresis(0.3, "check")).toBe("build")
    expect(getStageWithHysteresis(0.95, "build")).toBe("share")
    expect(getStageWithHysteresis(0.05, "share")).toBe("build")
  })
  it("wraps vertical keyboard navigation", () => {
    expect(getStageForKey("share", "ArrowDown")).toBe("build")
    expect(getStageForKey("build", "ArrowUp")).toBe("share")
    expect(getStageForKey("check", "Home")).toBe("build")
    expect(getStageForKey("check", "End")).toBe("share")
    expect(getStageForKey("build", "Tab")).toBeNull()
  })
})
