import { describe, expect, it } from "vitest"

import { commitHistory, redoHistory, undoHistory } from "./transitions"

describe("history transitions", () => {
  it("commits, undoes, and redoes a snapshot", () => {
    const committed = commitHistory({
      present: 0,
      next: 1,
      change: "increment",
      past: [],
      future: [],
    })

    expect(committed).toMatchObject({
      present: 1,
      future: [],
      appliedChange: "increment",
    })
    expect(committed.past).toEqual([{ snapshot: 0, change: "increment" }])

    const undone = undoHistory(committed)
    expect(undone).toMatchObject({
      present: 0,
      past: [],
      appliedChange: "increment",
    })
    expect(undone.future).toEqual([{ snapshot: 1, change: "increment" }])

    const redone = redoHistory(undone)
    expect(redone.present).toBe(1)
    expect(redone.future).toEqual([])
    expect(redone.past).toEqual([{ snapshot: 0, change: "increment" }])
  })

  it("clears the redo branch only for a real commit", () => {
    const future = [{ snapshot: 2, change: "old branch" }]
    const unchanged = commitHistory({
      present: 1,
      next: 1,
      change: "no-op",
      past: [],
      future,
    })

    expect(unchanged.appliedChange).toBeNull()
    expect(unchanged.future).toBe(future)

    const branched = commitHistory({
      present: 1,
      next: 3,
      change: "new branch",
      past: [],
      future,
    })

    expect(branched.future).toEqual([])
    expect(branched.past.at(-1)?.change).toBe("new branch")
  })

  it("is safe on empty undo and redo stacks", () => {
    const state = { present: 1, past: [], future: [] }

    expect(undoHistory(state)).toEqual({
      ...state,
      appliedChange: null,
    })
    expect(redoHistory(state)).toEqual({
      ...state,
      appliedChange: null,
    })
  })

  it("keeps only the configured number of snapshots", () => {
    let state = {
      present: 0,
      past: [] as { snapshot: number; change: number }[],
      future: [] as { snapshot: number; change: number }[],
      appliedChange: null as number | null,
    }

    for (let value = 1; value <= 5; value += 1) {
      state = commitHistory({
        ...state,
        next: value,
        change: value,
        limit: 3,
      })
    }

    expect(state.past).toHaveLength(3)
    expect(state.past.map(({ snapshot }) => snapshot)).toEqual([2, 3, 4])
  })
})
