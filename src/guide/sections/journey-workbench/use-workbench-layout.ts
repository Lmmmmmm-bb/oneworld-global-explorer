import { useEffect, useRef, useState, type RefObject } from "react"
import type { MotionPreference } from "../../motion/use-motion-settings.ts"

export type WorkbenchLayout = {
  cinematic: boolean
  height: number
  travel: number
  top: number
}
const INITIAL_LAYOUT: WorkbenchLayout = {
  cinematic: false,
  height: 0,
  travel: 0,
  top: 92,
}

export const useWorkbenchLayout = (
  ref: RefObject<HTMLElement | null>,
  preference: MotionPreference
) => {
  const [layout, setLayout] = useState(INITIAL_LAYOUT)
  const decision = useRef<"pending" | "allowed" | "flow">("pending")
  const current = useRef(INITIAL_LAYOUT)
  useEffect(() => {
    const section = ref.current
    if (!section || preference === "unknown") return
    const inner = section.querySelector<HTMLElement>(".workbench-inner")!
    const stack = section.querySelector<HTMLElement>(".demo-panels")!
    const header = document.querySelector<HTMLElement>(".guide-header")!
    let frame = 0
    const measure = () => {
      const top = header.getBoundingClientRect().height + 20
      if (decision.current === "pending") {
        const alreadyReading =
          section.getBoundingClientRect().top <= window.innerHeight ||
          section.contains(document.activeElement) ||
          (!!window.location.hash && window.location.hash !== "#guide-main")
        decision.current = alreadyReading ? "flow" : "allowed"
      }
      const panels = Array.from(
        section.querySelectorAll<HTMLElement>(".workbench-panel-content")
      )
      const maxPanel =
        Math.max(
          ...panels.map((panel) => panel.getBoundingClientRect().height)
        ) + 48
      const common =
        inner.getBoundingClientRect().height -
        stack.getBoundingClientRect().height
      const height = Math.ceil(common + maxPanel)
      const available = window.innerHeight - top - 20
      const cinematic =
        decision.current === "allowed" &&
        preference === "allow" &&
        (current.current.cinematic ||
          !section.contains(document.activeElement)) &&
        window.innerWidth >= 1024 &&
        window.innerHeight >= 800 &&
        height <= available - (current.current.cinematic ? 0 : 12)
      const next = {
        cinematic,
        height,
        top,
        travel: Math.round(available * 0.9),
      }
      if (
        Object.keys(next).some(
          (key) =>
            next[key as keyof WorkbenchLayout] !==
            current.current[key as keyof WorkbenchLayout]
        )
      ) {
        current.current = next
        setLayout(next)
      }
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(inner)
    observer.observe(header)
    section
      .querySelectorAll(".workbench-panel-content")
      .forEach((panel) => observer.observe(panel))
    window.addEventListener("resize", schedule)
    schedule()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", schedule)
    }
  }, [preference, ref])
  return layout
}
