import type { FC } from "react"
import { ExternalLink } from "lucide-react"

import { PAGE_WIDTH } from "../styles.ts"

export const GuideFooter: FC = () => (
  <footer className="border-guide-line border-t bg-white">
    <div
      className={`${PAGE_WIDTH} text-guide-muted flex min-h-[84px] flex-wrap items-center justify-between gap-6 py-6 text-[11px]`}
    >
      <p className="m-0">
        Global Explorer Planner is an independent, unofficial planning tool.
      </p>
      <div className="flex items-center gap-6">
        <a className="hover:text-guide-green no-underline" href="/">
          Planner
        </a>
        <a
          className="hover:text-guide-green inline-flex items-center gap-1.5 no-underline"
          href="https://github.com/Lmmmmmm-bb/oneworld-global-explorer"
          rel="noopener noreferrer"
          target="_blank"
        >
          GitHub <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      </div>
    </div>
  </footer>
)
