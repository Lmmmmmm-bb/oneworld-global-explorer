import type { FC } from "react"

import { SectionHeading } from "../components/section-heading.tsx"
import { PAGE_WIDTH } from "../styles.ts"

const STEPS = [
  {
    number: "01",
    title: "Choose the cabin",
    body: "Let the planner select a compatible mileage band automatically, or choose a band yourself.",
  },
  {
    number: "02",
    title: "Add each flight",
    body: "Pick an origin, a destination, and a carrier from the included route snapshot. Mark arrivals as transfers or stopovers.",
  },
  {
    number: "03",
    title: "Review and share",
    body: "Watch the mileage and route checks update. Share a read-only snapshot when you want someone else to review the plan.",
  },
] as const

export const HowItWorks: FC = () => (
  <section
    className={`${PAGE_WIDTH} py-[72px] sm:py-[104px]`}
    id="how-it-works"
  >
    <SectionHeading
      eyebrowText="HOW IT WORKS"
      title="Plan flight by flight, with the rules in view."
    >
      <p>
        Global Explorer is the distance-based round-the-world fare. This planner
        focuses on that product and checks the route against the rules it
        implements from the published terms.
      </p>
    </SectionHeading>
    <ol className="bg-guide-line mt-11 grid list-none gap-px p-px sm:grid-cols-3">
      {STEPS.map((step) => (
        <li
          className="min-h-0 bg-white p-[26px] sm:min-h-60 sm:p-[30px]"
          key={step.number}
        >
          <span className="text-guide-green font-mono text-[13px]">
            {step.number}
          </span>
          <h3 className="mt-[18px] text-lg font-semibold tracking-[-0.025em] sm:mt-[30px]">
            {step.title}
          </h3>
          <p className="text-guide-muted mt-2.5 mb-0 text-[13px] leading-[1.7]">
            {step.body}
          </p>
        </li>
      ))}
    </ol>
  </section>
)
