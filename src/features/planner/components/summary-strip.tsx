import type { FC } from "react"

import { StatusPill } from "@/components/status-pill"
import { Card } from "@/components/ui/card"

const SUMMARY_ITEMS = [
  { label: "Cabin", value: "Economy" },
  { label: "Mileage band", value: "Auto" },
  { label: "Estimated miles", value: "0 mi" },
  { label: "Segments", value: "0 / 16" },
]

export const SummaryStrip: FC = () => (
  <Card className="grid gap-0 overflow-hidden py-0 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
    {SUMMARY_ITEMS.map((item) => (
      <div
        className="border-b px-4 py-3 last:border-b-0 sm:border-r sm:border-b-0"
        key={item.label}
      >
        <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
          {item.label}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums">{item.value}</p>
      </div>
    ))}
    <div className="flex items-center px-4 py-3">
      <StatusPill status="incomplete" />
    </div>
  </Card>
)
