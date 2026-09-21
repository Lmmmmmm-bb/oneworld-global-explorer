import { useEffect, useRef } from "react"
import { Check } from "lucide-react"
import { animate, motion, useInView, useMotionValue } from "motion/react"
import { GUIDE_MOTION } from "../../../motion/transitions.ts"
import { useMotionSettings } from "../../../motion/use-motion-settings.ts"
import { formatMiles } from "../../../../utils.ts"
import { JOURNEY_BAND, JOURNEY_MILES } from "../../../data/journey.ts"

const ratio = JOURNEY_MILES / JOURNEY_BAND
export const MileagePreview = ({ active = true }: { active?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.2 })
  const fill = useMotionValue(ratio)
  const phase = useRef<"pending" | "running" | "complete">("pending")
  const { preference } = useMotionSettings()
  useEffect(() => {
    if (preference === "unknown") return
    if (preference === "reduce" || (!active && phase.current === "running")) {
      phase.current = "complete"
      fill.set(ratio)
      return
    }
    if (!active || !visible || phase.current === "complete") return
    if (phase.current === "pending") fill.set(0)
    phase.current = "running"
    const controls = animate(fill, ratio, {
      ...GUIDE_MOTION.meter,
      onComplete: () => {
        phase.current = "complete"
      },
    })
    return () => controls.stop()
  }, [active, visible, preference, fill])
  return (
    <div className="demo-checks" ref={ref}>
      <div className="demo-caption">
        <span>Estimated distance</span>
        <span>Economy / auto band</span>
      </div>
      <div className="demo-distance">
        <strong>{formatMiles(JOURNEY_MILES)}</strong>
        <span>/ {formatMiles(JOURNEY_BAND)} mi</span>
      </div>
      <div
        className="demo-meter"
        role="meter"
        aria-label="Estimated mileage used"
        aria-valuemin={0}
        aria-valuemax={JOURNEY_BAND}
        aria-valuenow={JOURNEY_MILES}
      >
        <motion.div style={{ scaleX: fill }} />
      </div>
      <p className="demo-check-note">
        <Check size={16} aria-hidden="true" />
        Passes the planner’s implemented checks
      </p>
      <p className="demo-check-context">
        Mileage is one part of the plan. Routing and ticketing conditions still
        apply.
      </p>
    </div>
  )
}
