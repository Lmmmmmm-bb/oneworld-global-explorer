import type { FC } from "react"
import { ArrowUpRight, Globe2 } from "lucide-react"

import { APP_CONFIG } from "../../config.ts"
import { FOCUS_LINK, PAGE_WIDTH } from "../styles.ts"

export const GuideHeader: FC = () => (
  <header className="border-guide-line border-b bg-white/95 backdrop-blur-sm">
    <div
      className={`${PAGE_WIDTH} flex h-16 items-center justify-between gap-4`}
    >
      <a
        aria-label="Open Global Explorer Planner"
        className={`${FOCUS_LINK} flex min-w-0 items-center gap-3 no-underline`}
        href="/"
      >
        <span className="bg-guide-green grid size-8 shrink-0 place-items-center text-[#effaf3]">
          <Globe2 aria-hidden="true" className="size-4" />
        </span>
        <span className="min-w-0">
          <strong className="block truncate text-sm leading-5 font-semibold tracking-[-0.025em]">
            {APP_CONFIG.name}
          </strong>
          <small className="text-guide-muted hidden truncate text-[11px] leading-4 sm:block">
            Unofficial route planning tool
          </small>
        </span>
      </a>
      <nav
        aria-label="Guide navigation"
        className="flex shrink-0 items-center gap-6 text-xs font-semibold"
      >
        <a
          className={`${FOCUS_LINK} hover:text-guide-green hidden no-underline transition-colors sm:block`}
          href="#how-it-works"
        >
          How it works
        </a>
        <a
          className={`${FOCUS_LINK} hover:text-guide-green hidden no-underline transition-colors sm:block`}
          href="#example"
        >
          Example route
        </a>
        <a
          className={`${FOCUS_LINK} border-guide-green text-guide-green-dark hover:bg-guide-mint inline-flex items-center gap-2 border px-3.5 py-2.5 no-underline transition-colors sm:px-4`}
          href="/"
        >
          Open planner <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </a>
      </nav>
    </div>
  </header>
)
