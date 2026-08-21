import { useEffect } from "react"

import { useItineraryStore } from "@/stores"

import {
  isHistoryShortcutBlockedTarget,
  resolveHistoryShortcut,
} from "./shortcuts"

export const useHistoryShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        isHistoryShortcutBlockedTarget(event.target) ||
        document.querySelector('[role="dialog"], [role="alertdialog"]')
      ) {
        return
      }

      const command = resolveHistoryShortcut(event)
      if (!command) return

      const state = useItineraryStore.getState()
      const canApply =
        command === "undo" ? state.past.length > 0 : state.future.length > 0

      if (!canApply) return

      event.preventDefault()
      if (command === "undo") state.undo()
      else state.redo()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])
}
