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
    <div className="bg-muted/15 p-3">
      <article className="relative overflow-hidden border border-dashed border-primary/35 bg-primary/[0.04] p-4 text-xs text-muted-foreground before:absolute before:top-0 before:bottom-0 before:left-[31px] before:border-l before:border-dashed before:border-primary/35">
        <div className="flex items-start gap-3">
          <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-primary/40 bg-background text-primary">
            <CarFront aria-hidden="true" className="size-3.5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                className="border-dashed border-primary/30 bg-background/80 text-primary"
                variant="outline"
              >
                {openJaw.isOriginDestination ? "End open jaw" : "Open jaw"}
              </Badge>
              <span className="text-[10px] font-medium tracking-[0.12em] uppercase">
                Surface segment
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
              <span>{openJaw.from}</span>
              <ArrowRight aria-hidden="true" className="size-4 text-primary" />
              <span>{openJaw.to}</span>
            </div>
            <p className="mt-1 text-xs">
              {from?.city ?? openJaw.from} to {to?.city ?? openJaw.to}
            </p>
            <p className="mt-3 tabular-nums">
              {formatMiles(openJaw.distanceMiles)} mi · counts as 1 segment and
              1 stopover
            </p>
          </div>
        </div>
      </article>
    </div>
  )
}
