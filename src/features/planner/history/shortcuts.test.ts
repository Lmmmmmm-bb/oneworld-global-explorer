import { describe, expect, it } from "vitest"

import { resolveHistoryShortcut, type HistoryShortcutInput } from "./shortcuts"

const event = (
  partial: Partial<HistoryShortcutInput>
): HistoryShortcutInput => ({
  key: "z",
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  altKey: false,
  ...partial,
})

describe("history shortcuts", () => {
  it("supports the standard undo shortcuts", () => {
    expect(resolveHistoryShortcut(event({ metaKey: true }))).toBe("undo")
    expect(resolveHistoryShortcut(event({ ctrlKey: true }))).toBe("undo")
  })

  it("supports the standard redo shortcuts", () => {
    expect(
      resolveHistoryShortcut(event({ metaKey: true, shiftKey: true }))
    ).toBe("redo")
    expect(
      resolveHistoryShortcut(event({ ctrlKey: true, shiftKey: true }))
    ).toBe("redo")
    expect(resolveHistoryShortcut(event({ key: "y", ctrlKey: true }))).toBe(
      "redo"
    )
  })

  it("ignores unrelated, composing, and alt-modified keys", () => {
    expect(
      resolveHistoryShortcut(event({ key: "x", ctrlKey: true }))
    ).toBeNull()
    expect(
      resolveHistoryShortcut(event({ ctrlKey: true, isComposing: true }))
    ).toBeNull()
    expect(
      resolveHistoryShortcut(event({ ctrlKey: true, altKey: true }))
    ).toBeNull()
  })
})
