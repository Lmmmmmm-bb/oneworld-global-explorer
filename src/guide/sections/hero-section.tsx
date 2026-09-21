import type { FC } from "react"
import { ArrowDown, ArrowRight } from "lucide-react"

import { PrimaryLink } from "../components/primary-link.tsx"
import { RouteTicket } from "../components/route-ticket.tsx"
import { EYEBROW, FOCUS_LINK, PAGE_WIDTH } from "../styles.ts"

export const HeroSection: FC = () => (
  <section
    aria-labelledby="hero-title"
    className={`${PAGE_WIDTH} grid items-start gap-11 pt-7 pb-16 min-[1041px]:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] min-[1041px]:gap-[clamp(2.75rem,6vw,6.25rem)] min-[1041px]:pb-[86px]`}
  >
    <div className="pt-1">
      <p className={EYEBROW}>ROUTE PLANNING / GLOBAL EXPLORER</p>
      <h1
        className="max-w-[680px] text-[clamp(2.625rem,4.5vw,4.5rem)] leading-[1.04] font-[730] tracking-[-0.065em] text-balance"
        id="hero-title"
      >
        Plan your oneworld{" "}
        <em className="text-guide-green not-italic">Global Explorer</em>{" "}
        itinerary.
      </h1>
      <p className="mt-[22px] max-w-[570px] text-[clamp(1rem,1.3vw,1.125rem)] leading-[1.66] text-[#3f5148]">
        Build a round-the-world route, estimate its mileage, and catch common
        rule issues before asking an airline or travel agent to price it.
      </p>
      <div className="mt-[30px] flex flex-wrap gap-2.5">
        <PrimaryLink href="/">
          Open the planner <ArrowRight aria-hidden="true" className="size-4" />
        </PrimaryLink>
        <a
          className={`${FOCUS_LINK} hover:border-guide-green hover:text-guide-green-dark inline-flex min-h-12 items-center justify-center gap-5 border border-[#bccdc1] bg-white px-[18px] py-3 text-[13px] font-bold no-underline transition-colors`}
          href="#example"
        >
          See a checked example{" "}
          <ArrowDown aria-hidden="true" className="size-4" />
        </a>
      </div>
      <p className="text-guide-muted mt-4 mb-0 text-xs leading-6">
        Free, unofficial, and browser-based. The planner does not sell tickets.
      </p>
    </div>
    <div>
      <RouteTicket />
    </div>
  </section>
)
