import type { FC } from "react"

import { SectionHeading } from "../components/section-heading.tsx"
import { PAGE_WIDTH } from "../styles.ts"

const CHECKS = [
  {
    symbol: "↗",
    title: "Known routes and carriers",
    body: "Suggestions come from a checked-in route snapshot, not a live schedule.",
  },
  {
    symbol: "◉",
    title: "Mileage and segments",
    body: "Estimated flight and open-jaw distance counts toward the selected mileage band and segment limit.",
  },
  {
    symbol: "◇",
    title: "Common routing rules",
    body: "Review crossings, direction, stopovers, regional limits, itinerary closure, and open-jaw restrictions.",
  },
] as const

export const PlannerChecks: FC = () => (
  <section className="bg-[#eaf2ec] py-[68px] sm:py-[88px]">
    <div
      className={`${PAGE_WIDTH} grid gap-11 min-[1041px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] min-[1041px]:gap-20`}
    >
      <SectionHeading
        eyebrowText="WHAT THE PLANNER CHECKS"
        title="See issues while the route is still easy to change."
      />
      <div className="border-t border-[#cadbce]">
        {CHECKS.map(({ body, symbol, title }) => (
          <div
            className="flex items-start gap-5 border-b border-[#cadbce] py-6"
            key={title}
          >
            <span className="text-guide-green grid size-8 shrink-0 place-items-center border border-[#bad1c0]">
              <span aria-hidden="true" className="text-[17px]">
                {symbol}
              </span>
            </span>
            <p className="m-0 flex flex-col gap-1">
              <strong className="text-[15px]">{title}</strong>
              <span className="text-guide-muted text-[13px] leading-[1.7]">
                {body}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
