import { useSyncExternalStore } from "react"

export type MotionPreference = "unknown" | "allow" | "reduce"
const query = "(prefers-reduced-motion: reduce)"
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}
const snapshot = (): MotionPreference =>
  window.matchMedia(query).matches ? "reduce" : "allow"
const serverSnapshot = (): MotionPreference => "unknown"

export const useMotionSettings = () => {
  const preference = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  return { preference, motionEnabled: preference === "allow" }
}
