import type { FC } from "react"
import { ArrowRight } from "lucide-react"

import { PrimaryLink } from "../components/primary-link.tsx"
import { BODY_COPY, EYEBROW, PAGE_WIDTH, SECTION_TITLE } from "../styles.ts"

export const FinalCallToAction: FC = () => (
  <div
    className={`${PAGE_WIDTH} flex flex-col items-start justify-between gap-9 py-[72px] sm:flex-row sm:items-end sm:py-[90px]`}
  >
    <div>
      <p className={EYEBROW}>READY TO PLAN?</p>
      <h2 className={SECTION_TITLE}>Start with the route you have in mind.</h2>
      <p className={`mt-3 mb-0 ${BODY_COPY}`}>
        Build it one flight at a time, then use the checks to decide what to
        verify next.
      </p>
    </div>
    <div className="shrink-0">
      <PrimaryLink href="/">
        Open the planner <ArrowRight aria-hidden="true" className="size-4" />
      </PrimaryLink>
    </div>
  </div>
)
