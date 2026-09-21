import type { FC } from "react"

import { PAGE_WIDTH } from "../styles.ts"

const SCOPE_ITEMS = [
  ["One fare product", "Distance-based Global Explorer"],
  ["One workspace", "Flights, mileage, and route checks"],
  ["One share link", "Read-only itinerary snapshot"],
] as const

export const ScopeStrip: FC = () => (
  <section
    aria-label="Planning scope"
    className="border-guide-line border-y bg-[#f0f5f1]"
  >
    <div className={`${PAGE_WIDTH} grid sm:grid-cols-3`}>
      {SCOPE_ITEMS.map(([label, value], index) => (
        <div
          className={`border-guide-line flex min-h-[82px] flex-col justify-center gap-1.5 py-[18px] sm:min-h-[98px] sm:px-6 ${
            index > 0 ? "border-t sm:border-t-0 sm:border-l" : ""
          } ${index === 0 ? "sm:pl-0" : ""}`}
          key={label}
        >
          <strong className="text-guide-green-dark text-[10px] tracking-[0.16em] uppercase">
            {label}
          </strong>
          <span className="text-[13px] font-semibold">{value}</span>
        </div>
      ))}
    </div>
  </section>
)
