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
    <article className="group relative border bg-background p-4 shadow-xs transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center bg-primary/10 text-xs font-semibold text-primary">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-lg font-semibold tracking-tight">
              {flight.from}
            </span>
            <ArrowRight aria-hidden="true" className="size-4 text-primary" />
            <span className="text-lg font-semibold tracking-tight">
              {flight.to}
            </span>
            <Badge className="rounded-full" variant="secondary">
              {flight.arrivalType === "stopover" ? "Stopover" : "Transfer"}
            </Badge>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {from?.city ?? flight.from} to {to?.city ?? flight.to}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <Plane aria-hidden="true" className="size-3.5 text-primary" />
              {flight.marketingCarrier} · {carrierName(flight.marketingCarrier)}
            </span>
            {flight.isCodeshare ? (
              <span className="text-muted-foreground">
                Operated by {operatorName(flight.operatingCarrier)}
              </span>
            ) : null}
            {distance !== null ? (
              <span className="text-muted-foreground tabular-nums">
                {formatMiles(distance)} mi
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            aria-label={`Edit flight ${index + 1}: ${flight.from} to ${flight.to}`}
            onClick={onEdit}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            aria-label={`Delete flight ${index + 1}: ${flight.from} to ${flight.to}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={onDelete}
            size="icon"
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
