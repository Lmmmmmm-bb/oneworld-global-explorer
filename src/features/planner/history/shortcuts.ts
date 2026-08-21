export type HistoryCommand = "undo" | "redo"

export interface HistoryShortcutInput {
  key: string
  metaKey: boolean
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  isComposing?: boolean
}

export const resolveHistoryShortcut = (
  event: HistoryShortcutInput
): HistoryCommand | null => {
  if (event.isComposing || event.altKey) return null

  const key = event.key.toLowerCase()
  const primaryModifier = event.metaKey || event.ctrlKey

  if (primaryModifier && key === "z") {
    return event.shiftKey ? "redo" : "undo"
  }

  if (event.ctrlKey && !event.metaKey && !event.shiftKey && key === "y") {
    return "redo"
  }

  return null
}

export const isHistoryShortcutBlockedTarget = (
  target: EventTarget | null
): boolean => {
  if (!(target instanceof Element)) return false

  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
    )
  )
}
