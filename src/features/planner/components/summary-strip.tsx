import type { FC } from "react"

import { StatusPill } from "@/components/status-pill"
import { Card } from "@/components/ui/card"
import { useItineraryValidation } from "@/hooks"
import { useItineraryStore } from "@/stores"
import { formatMiles } from "@/utils"

import { CABIN_LABELS } from "./plan-settings"

export const SummaryStrip: FC = () => {
  const itinerary = useItineraryStore((state) => state.itinerary)
  const validation = useItineraryValidation()
  const { metrics } = validation
  const bandLabel =
    itinerary.mileageBand === "auto"
      ? metrics.selectedBand
        ? `Auto · ${metrics.selectedBand / 1_000}K`
        : "Auto"
      : `${itinerary.mileageBand / 1_000}K`
  const segmentLabel = `${metrics.flightCount} flight${metrics.flightCount === 1 ? "" : "s"} + ${metrics.openJawCount} open jaw${metrics.openJawCount === 1 ? "" : "s"} = ${metrics.segmentCount}/16`
  const items = [
    { label: "Cabin", value: CABIN_LABELS[itinerary.cabinClass] },
    { label: "Mileage band", value: bandLabel },
    {
      label: "Estimated miles",
      value: `${formatMiles(metrics.totalMiles)} mi`,
    },
    { label: "Segments", value: segmentLabel },
  ]

  return (
    <Card className="grid gap-0 overflow-hidden py-0 sm:grid-cols-[repeat(2,minmax(0,1fr))_auto] xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
      {items.map((item) => (
        <div
          className="border-b px-4 py-3 last:border-b-0 sm:border-r xl:border-b-0"
          key={item.label}
        >
          <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {item.value}
          </p>
        </div>
      ))}
      <div className="flex items-center px-4 py-3 sm:col-span-2 xl:col-span-1">
        <StatusPill status={validation.status} />
      </div>
    </Card>
  )
}
