import { useRef, type KeyboardEvent } from "react"
import { ArrowUpRight } from "lucide-react"
import { getStageForKey } from "./stage-progress.ts"
import { JOURNEY_STEPS, type StageId } from "./stages.ts"

export const JourneyTabs = ({
  stage,
  prefix,
  onSelect,
}: {
  stage: StageId
  prefix: string
  onSelect: (stage: StageId) => void
}) => {
  const buttons = useRef<Partial<Record<StageId, HTMLButtonElement | null>>>({})
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, id: StageId) => {
    const next = getStageForKey(id, event.key)
    if (!next) return
    event.preventDefault()
    onSelect(next)
    buttons.current[next]?.focus({ preventScroll: true })
  }
  return (
    <div
      className="journey-tabs"
      role="tablist"
      aria-label="Explore the planner"
      aria-orientation="vertical"
    >
      {JOURNEY_STEPS.map((step) => (
        <button
          key={step.id}
          type="button"
          role="tab"
          data-stage={step.id}
          ref={(node) => {
            buttons.current[step.id] = node
          }}
          id={`${prefix}-tab-${step.id}`}
          aria-controls={`${prefix}-panel-${step.id}`}
          aria-labelledby={`${prefix}-tab-title-${step.id}`}
          aria-selected={stage === step.id}
          tabIndex={stage === step.id ? 0 : -1}
          onClick={() => onSelect(step.id)}
          onKeyDown={(event) => onKey(event, step.id)}
          className="journey-tab"
        >
          <span className="journey-tab-number">{step.number}</span>
          <span>
            <span
              className="journey-tab-title"
              id={`${prefix}-tab-title-${step.id}`}
            >
              {step.title}
            </span>
            <span className="journey-tab-description">{step.description}</span>
          </span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
