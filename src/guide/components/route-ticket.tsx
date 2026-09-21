import type { FC } from "react"

const ROUTE_STOPS = [
  ["SFO", "San Francisco"],
  ["LHR", "London"],
  ["HND", "Tokyo"],
  ["SYD", "Sydney"],
  ["SFO", "Return"],
] as const

const ROUTE_METRICS = [
  ["Estimated distance", "23,596", "mi"],
  ["Auto-selected band", "26,000", "mi"],
  ["Flight segments", "4", "of 16"],
] as const

export const RouteTicket: FC = () => (
  <div
    aria-label="Sample route from San Francisco through London, Tokyo and Sydney, returning to San Francisco"
    className="guide-grid relative overflow-hidden border border-[#cbded1] bg-white p-[clamp(1.375rem,3.5vw,2.75rem)] shadow-[0_28px_72px_rgba(39,83,61,0.09)]"
  >
    <div className="bg-guide-green absolute inset-y-0 left-0 w-[5px]" />
    <div className="flex justify-between gap-4 text-[10px] font-[750] tracking-[0.14em]">
      <span className="text-guide-muted">EXAMPLE ITINERARY</span>
      <span className="text-guide-green-dark inline-flex items-center gap-1.5 text-right tracking-[0.02em] normal-case">
        <span aria-hidden="true" className="text-[8px]">
          ●
        </span>
        Route checks passed
      </span>
    </div>

    <ol
      aria-label="Airport sequence"
      className="my-12 grid list-none grid-cols-5 gap-1 p-0 min-[701px]:mt-[72px] min-[701px]:mb-[68px] min-[701px]:gap-[7px]"
    >
      {ROUTE_STOPS.map(([code, city], index) => (
        <li
          className={`relative min-w-0 ${
            index < ROUTE_STOPS.length - 1
              ? "after:bg-guide-green after:absolute after:top-3.5 after:-right-1 after:hidden after:h-px after:w-2 min-[421px]:after:block min-[701px]:after:top-[22px] min-[701px]:after:-right-0.5 min-[701px]:after:w-3.5"
              : ""
          }`}
          key={`${code}-${index}`}
        >
          <b className="block truncate font-mono text-[clamp(1.125rem,2.2vw,1.95rem)] leading-none font-bold tracking-[-0.08em]">
            {code}
          </b>
          <span className="text-guide-muted mt-1.5 hidden truncate text-[10px] min-[421px]:block">
            {city}
          </span>
        </li>
      ))}
    </ol>

    <div className="mb-6 border-t border-dashed border-[#a9c3b2]" />
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-5">
      {ROUTE_METRICS.map(([label, value, unit]) => (
        <div className="flex flex-col gap-1.5" key={label}>
          <span className="text-guide-muted text-[9px] font-[750] tracking-[0.14em] uppercase sm:text-[10px]">
            {label}
          </span>
          <strong className="text-[clamp(1.0625rem,1.8vw,1.4375rem)] leading-none tracking-[-0.055em] whitespace-nowrap">
            {value}{" "}
            <small className="text-[11px] font-medium tracking-normal">
              {unit}
            </small>
          </strong>
        </div>
      ))}
    </div>
    <p className="text-guide-muted mt-8 mb-0 text-[11px] leading-6">
      Snapshot-based checks only. Route validity does not confirm ticket
      availability.
    </p>
  </div>
)
