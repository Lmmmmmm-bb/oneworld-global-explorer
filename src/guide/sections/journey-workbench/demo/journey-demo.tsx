import { ShieldCheck } from "lucide-react"
import { motion } from "motion/react"
import { GUIDE_MOTION } from "../../../motion/transitions.ts"
import { JOURNEY_ROUTE_LABEL } from "../../../data/journey.ts"
import { RouteAtlas } from "../../../visuals/route-atlas/route-atlas.tsx"
import {
  JOURNEY_STEPS,
  type StageId,
  type WorkbenchPresentation,
} from "../stages.ts"
import { FlightsPreview } from "./flights-preview.tsx"
import { MileagePreview } from "./mileage-preview.tsx"
import { SharePreview } from "./share-preview.tsx"

const PREVIEWS = {
  build: FlightsPreview,
  check: MileagePreview,
  share: SharePreview,
}
export const JourneyDemo = ({
  stage,
  prefix,
  presentation,
}: {
  stage: StageId
  prefix: string
  presentation: WorkbenchPresentation
}) => {
  const cinematic = presentation === "cinematic"
  return (
    <div className="journey-demo">
      <div className="demo-toolbar">
        <span>
          <i className="signal-dot" /> Sample itinerary
        </span>
        <span>Read-only</span>
      </div>
      <div className="demo-map">
        <RouteAtlas labels={false} />
      </div>
      <p className="demo-route-caption">{JOURNEY_ROUTE_LABEL}</p>
      <div className="demo-panels">
        {JOURNEY_STEPS.map((step) => {
          const Scene = PREVIEWS[step.id]
          const active = !cinematic || stage === step.id
          return (
            <motion.section
              key={step.id}
              id={`${prefix}-panel-${step.id}`}
              role={cinematic ? "tabpanel" : undefined}
              tabIndex={cinematic && active ? 0 : undefined}
              aria-labelledby={
                cinematic
                  ? `${prefix}-tab-${step.id}`
                  : `${prefix}-heading-${step.id}`
              }
              aria-hidden={!active || undefined}
              inert={!active}
              className="workbench-panel"
              data-stage={step.id}
              initial={false}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
              style={{ visibility: active ? "visible" : "hidden" }}
              transition={cinematic ? GUIDE_MOTION.scene : { duration: 0 }}
            >
              <div className="workbench-panel-heading">
                <span className="guide-eyebrow">
                  {step.number} / {step.id}
                </span>
                <h3
                  id={`${prefix}-heading-${step.id}`}
                  data-stage-heading={step.id}
                  tabIndex={-1}
                >
                  {step.title}
                </h3>
                <p>{step.description}</p>
              </div>
              <div className="workbench-panel-content">
                <Scene active={active} />
              </div>
            </motion.section>
          )
        })}
      </div>
      <div className="demo-footer">
        <ShieldCheck size={16} aria-hidden="true" />
        Planning checks only. Availability is not confirmed.
      </div>
    </div>
  )
}
