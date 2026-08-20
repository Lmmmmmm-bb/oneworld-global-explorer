import type { FC } from "react"
import { CarFront } from "lucide-react"

import type { OpenJawSegment } from "@/features/itinerary"
import { airportByIata } from "@/features/route-data"
import { formatMiles } from "@/utils"

interface OpenJawLabelProps {
  openJaw: OpenJawSegment
}

export const OpenJawLabel: FC<OpenJawLabelProps> = ({ openJaw }) => {
  const from = airportByIata.get(openJaw.from)
  const to = airportByIata.get(openJaw.to)

  return (
    <div className="relative flex items-center gap-3 py-2 pl-5 text-xs text-muted-foreground before:absolute before:top-0 before:bottom-0 before:left-[33px] before:border-l before:border-dashed">
      <span className="relative z-10 grid size-7 shrink-0 place-items-center rounded-full border border-dashed bg-background text-primary">
        <CarFront aria-hidden="true" className="size-3.5" />
      </span>
      <span className="min-w-0 border border-dashed bg-muted/30 px-3 py-2">
        <span className="font-medium text-foreground">
          {openJaw.isOriginDestination ? "End open jaw" : "Open jaw"} ·{" "}
          {from?.city ?? openJaw.from} ({openJaw.from}) to{" "}
          {to?.city ?? openJaw.to} ({openJaw.to})
        </span>
        <span className="ml-2 tabular-nums">
          {formatMiles(openJaw.distanceMiles)} mi · counts as 1 segment and 1
          stopover
        </span>
      </span>
    </div>
  )
}
