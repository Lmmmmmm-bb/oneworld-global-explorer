import type { FC } from "react"
import { ArrowRight, Pencil, Plane, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FlightSegment } from "@/features/itinerary"
import { airportByIata } from "@/features/route-data"
import { CARRIERS, OPERATING_CARRIERS } from "@/features/rules"
import { formatMiles, haversineMiles } from "@/utils"

interface FlightCardProps {
  flight: FlightSegment
  index: number
  onDelete: () => void
  onEdit: () => void
}

const carrierName = (code: string) =>
  CARRIERS.find((carrier) => carrier.code === code)?.name ?? code

const operatorName = (id: string) =>
  OPERATING_CARRIERS.find((carrier) => carrier.id === id)?.name ?? id

export const FlightCard: FC<FlightCardProps> = ({
  flight,
  index,
  onDelete,
  onEdit,
}) => {
  const from = airportByIata.get(flight.from)
  const to = airportByIata.get(flight.to)
  const distance = from && to ? haversineMiles(from, to) : null

  return (
    <article className="group bg-background px-3 py-2 transition-colors hover:bg-muted/20">
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-2.5">
        <div className="grid size-6 shrink-0 place-items-center bg-primary/10 text-[10px] font-semibold text-primary tabular-nums">
          {index + 1}
        </div>
        <div className="grid min-w-0 gap-x-4 gap-y-0.5 sm:grid-cols-[minmax(11rem,1.2fr)_minmax(9rem,1fr)_auto] sm:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5 text-sm font-semibold tracking-tight">
              <span>{flight.from}</span>
              <ArrowRight aria-hidden="true" className="size-3 text-primary" />
              <span>{flight.to}</span>
            </div>
            <span className="truncate text-[11px] text-muted-foreground">
              {from?.city ?? flight.from} · {to?.city ?? flight.to}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5 text-[11px]">
            <Plane
              aria-hidden="true"
              className="size-3 shrink-0 text-primary"
            />
            <span className="truncate">
              <span className="font-medium">{flight.marketingCarrier}</span>
              <span className="text-muted-foreground">
                {" "}
                · {carrierName(flight.marketingCarrier)}
              </span>
            </span>
            {flight.isCodeshare ? (
              <span
                className="hidden shrink-0 text-muted-foreground xl:inline"
                title={`Operated by ${operatorName(flight.operatingCarrier)}`}
              >
                · op. {operatorName(flight.operatingCarrier)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Badge
              className="h-4 rounded-sm px-1.5 text-[9px]"
              variant="secondary"
            >
              {flight.arrivalType === "stopover" ? "Stopover" : "Transfer"}
            </Badge>
            {distance !== null ? (
              <span className="text-[10px] whitespace-nowrap text-muted-foreground tabular-nums">
                {formatMiles(distance)} mi
              </span>
            ) : null}
          </div>
        </div>
        <div className="ml-1 flex shrink-0 gap-0.5">
          <Button
            aria-label={`Edit flight ${index + 1}: ${flight.from} to ${flight.to}`}
            onClick={onEdit}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            aria-label={`Delete flight ${index + 1}: ${flight.from} to ${flight.to}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  )
}
