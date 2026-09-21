import { ArrowUpRight, Check, CircleHelp } from "lucide-react"
import { APP_CONFIG } from "../../config.ts"
import { Reveal } from "../motion/reveal.tsx"
import { PAGE_WIDTH } from "../layout/classes.ts"

const CHECKS = [
  [
    "Connections & carriers",
    "Routes and participating carriers from the included network snapshot.",
  ],
  [
    "Miles & segments",
    "Estimated flight and open-jaw distance, mileage bands, and segment counts.",
  ],
  [
    "The shape of your journey",
    "Direction, crossings, stopovers, regional limits, and itinerary closure.",
  ],
]
const CONFIRMATIONS = [
  [
    "Flights & availability",
    "Current schedules, operating flights, and seats in the right booking class.",
  ],
  [
    "The fare & the ticket",
    "Live pricing, booking conditions, and whether a carrier will issue your itinerary.",
  ],
  [
    "The final word",
    "Confirm the complete journey with the issuing airline or travel agent.",
  ],
]

export const PlannerChecks = () => (
  <section
    className={`${PAGE_WIDTH} guide-section-space`}
    aria-labelledby="checks-title"
  >
    <Reveal className="grid gap-8 md:grid-cols-[1fr_0.65fr] md:items-end">
      <div>
        <p className="guide-eyebrow">CONFIDENCE, WITH CONTEXT</p>
        <h2 id="checks-title" className="guide-section-title mt-6">
          Know what’s checked.
          <br />
          <span className="text-guide-muted">Know what comes next.</span>
        </h2>
      </div>
      <p className="text-guide-muted max-w-md text-base leading-[1.85]">
        A good plan makes the next conversation easier. “Route valid” means your
        plan passes the checks implemented here. It isn’t a booking
        confirmation.
      </p>
    </Reveal>
    <div className="mt-14 grid gap-5 md:grid-cols-2">
      <Reveal className="boundary-panel boundary-panel-checked">
        <div className="flex items-center gap-3">
          <span className="boundary-icon">
            <Check className="size-4" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-xl tracking-tight">
            In the planner
          </h3>
        </div>
        <dl>
          {CHECKS.map(([title, body]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{body}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
      <Reveal className="boundary-panel">
        <div className="flex items-center gap-3">
          <span className="boundary-icon boundary-icon-confirm">
            <CircleHelp className="size-4" aria-hidden="true" />
          </span>
          <h3 className="font-heading text-xl tracking-tight">
            With your airline
          </h3>
        </div>
        <dl>
          {CONFIRMATIONS.map(([title, body]) => (
            <div key={title}>
              <dt>{title}</dt>
              <dd>{body}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
    <a
      className="text-guide-green mt-7 inline-flex items-center gap-2 text-xs underline underline-offset-4"
      href={APP_CONFIG.officialTermsUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Read the published Global Explorer terms{" "}
      <ArrowUpRight className="size-3.5" aria-hidden="true" />
    </a>
  </section>
)
