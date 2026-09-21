import { useEffect, useRef, type RefObject } from "react"
import { animate, useMotionValue } from "motion/react"
import { useMotionSettings } from "../../motion/use-motion-settings.ts"
import { GUIDE_MOTION } from "../../motion/transitions.ts"

export const useRoutePlayback = (
  ref: RefObject<HTMLElement | null>,
  duration: number
) => {
  const elapsed = useMotionValue(0)
  const phase = useRef<"pending" | "running" | "complete">("pending")
  const { preference } = useMotionSettings()
  useEffect(() => {
    const element = ref.current
    if (!element || preference === "unknown") return
    let controls: ReturnType<typeof animate> | undefined
    const finish = () => {
      controls?.stop()
      elapsed.set(duration)
      phase.current = "complete"
    }
    if (preference === "reduce" || duration === 0) {
      finish()
      return
    }
    const start = () => {
      if (phase.current === "complete" || controls || document.hidden) return
      const delay = phase.current === "pending" ? GUIDE_MOTION.route.delay : 0
      phase.current = "running"
      controls = animate(elapsed, duration, {
        duration: Math.max(0, duration - elapsed.get()),
        delay,
        ease: "linear",
        onComplete: () => {
          phase.current = "complete"
        },
      })
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.2) start()
        else if (!entry.isIntersecting && phase.current === "running") finish()
      },
      { threshold: [0, 0.2] }
    )
    const visibility = () => {
      if (document.hidden && phase.current === "running") finish()
      else if (!document.hidden && phase.current === "pending") {
        const rect = element.getBoundingClientRect()
        if (rect.bottom > 0 && rect.top < window.innerHeight * 0.8) start()
      }
    }
    observer.observe(element)
    document.addEventListener("visibilitychange", visibility)
    return () => {
      controls?.stop()
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibility)
    }
  }, [ref, duration, elapsed, preference])
  return elapsed
}
