import { useId, useRef, type CSSProperties } from "react"
import { motion } from "motion/react"
import { JourneyDemo } from "./demo/journey-demo.tsx"
import { JourneyTabs } from "./journey-tabs.tsx"
import { useJourneyStage } from "./use-journey-stage.ts"
import { useWorkbenchLayout } from "./use-workbench-layout.ts"
import { useMotionSettings } from "../../motion/use-motion-settings.ts"

export const JourneyWorkbench = () => {
  const ref = useRef<HTMLElement>(null)
  const prefix = useId().replaceAll(":", "")
  const { preference } = useMotionSettings()
  const layout = useWorkbenchLayout(ref, preference)
  const { stage, select, lock, progress } = useJourneyStage(ref, layout)
  return (
    <section
      ref={ref}
      id="how-it-works"
      className="journey-workbench guide-container"
      aria-labelledby="workbench-title"
      data-presentation={layout.cinematic ? "cinematic" : "flow"}
      style={
        {
          "--workbench-top": `${layout.top}px`,
          "--workbench-height": `${layout.height + layout.travel}px`,
        } as CSSProperties
      }
      onFocusCapture={(event) => {
        if (!layout.cinematic) return
        const target = event.target as HTMLElement
        lock(
          !!target.closest(".demo-panels") || target.matches(":focus-visible")
        )
      }}
      onKeyDownCapture={() => {
        if (layout.cinematic) lock(true)
      }}
      onPointerDownCapture={(event) => {
        if (!(event.target as HTMLElement).closest(".demo-panels")) lock(false)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) lock(false)
      }}
    >
      <div className="workbench-inner">
        <div className="workbench-heading">
          <p className="guide-eyebrow">From an idea to an itinerary</p>
          <h2 id="workbench-title" className="guide-section-title">
            A big journey.
            <br />
            <span>Every detail connected.</span>
          </h2>
        </div>
        <div className="workbench-body">
          <aside className="workbench-aside">
            <div className="workbench-flow-intro">
              <p>
                One route.
                <br />
                Three ways to see it.
              </p>
              <span>
                Build a route, review the checks, and share a read-only
                snapshot.
              </span>
            </div>
            <div className="workbench-navigation">
              <JourneyTabs stage={stage} prefix={prefix} onSelect={select} />
              <div className="workbench-progress" aria-hidden="true">
                <motion.div style={{ scaleX: progress }} />
              </div>
              <p className="workbench-hint">
                Scroll to explore, or choose a step.
              </p>
            </div>
          </aside>
          <JourneyDemo
            stage={stage}
            prefix={prefix}
            presentation={layout.cinematic ? "cinematic" : "flow"}
          />
        </div>
      </div>
    </section>
  )
}
