import type { FC } from "react"
import { ArrowRight, CarFront } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { OpenJawSegment } from "@/features/itinerary"
import { airportByIata } from "@/features/route-data"
import { formatMiles } from "@/utils"

interface OpenJawCardProps {
  openJaw: OpenJawSegment
}

export const OpenJawCard: FC<OpenJawCardProps> = ({ openJaw }) => {
  const from = airportByIata.get(openJaw.from)
  const to = airportByIata.get(openJaw.to)

  return (
    <article className="bg-primary/[0.035] px-3 py-2 text-muted-foreground">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2.5">
        <span className="grid size-6 shrink-0 place-items-center border border-dashed border-primary/40 bg-background text-primary">
          <CarFront aria-hidden="true" className="size-3" />
        </span>

        <div className="grid min-w-0 gap-x-4 gap-y-0.5 sm:grid-cols-[minmax(11rem,1.2fr)_minmax(9rem,1fr)_9rem] sm:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-foreground">
              <span>{openJaw.from}</span>
              <ArrowRight aria-hidden="true" className="size-3 text-primary" />
              <span>{openJaw.to}</span>
            </div>
            <span className="truncate text-[11px]">
              {from?.city ?? openJaw.from} · {to?.city ?? openJaw.to}
            </span>
          </div>
          <span className="text-[10px] font-medium tracking-[0.1em] uppercase">
            Surface segment
          </span>
          <div className="flex items-center gap-2 sm:justify-end">
            <Badge
              className="h-4 rounded-sm border-dashed border-primary/30 bg-background/80 px-1.5 text-[9px] text-primary"
              variant="outline"
            >
              {openJaw.isOriginDestination ? "End open jaw" : "Open jaw"}
            </Badge>
            <span className="text-[10px] whitespace-nowrap tabular-nums">
              {formatMiles(openJaw.distanceMiles)} mi · 1 segment
            </span>
          </div>
        </div>
        <span aria-hidden="true" className="ml-1 w-[3.125rem]" />
      </div>
    </article>
  )
}
