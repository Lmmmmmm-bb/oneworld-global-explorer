import { Fragment, type FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { FlightSegment } from "@/features/itinerary"
import { useItineraryValidation } from "@/hooks"
import { useItineraryStore } from "@/stores"

import { FlightCard } from "./flight-card"
import { ItineraryEmptyState } from "./itinerary-empty-state"
import { OpenJawCard } from "./open-jaw-card"
import { PlanSettings } from "./plan-settings"

interface ItineraryPanelProps {
  onAddFlight: () => void
  onEditFlight: (flight: FlightSegment) => void
}

export const ItineraryPanel: FC<ItineraryPanelProps> = ({
  onAddFlight,
  onEditFlight,
}) => {
  const itinerary = useItineraryStore((state) => state.itinerary)
  const deleteFlight = useItineraryStore((state) => state.deleteFlight)
  const setEndWithOpenJaw = useItineraryStore(
    (state) => state.setEndWithOpenJaw
  )
  const validation = useItineraryValidation()

  if (itinerary.flights.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="gap-0 overflow-hidden py-0">
          <PlanSettings />
        </Card>
        <ItineraryEmptyState onAddFlight={onAddFlight} />
      </div>
    )
  }

  const openJawsByPreviousFlight = new Map(
    validation.openJaws.map((openJaw) => [openJaw.afterFlightId, openJaw])
  )

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <PlanSettings />
      <div className="flex items-center justify-between gap-4 border-b px-3 py-2.5">
        <div>
          <h2 className="text-sm font-semibold">Flight sequence</h2>
          <p className="text-[11px] text-muted-foreground">
            Flights and open jaws stay in route order.
          </p>
        </div>
        <Button onClick={onAddFlight} size="sm" type="button">
          <Plus aria-hidden="true" />
          Add flight
        </Button>
      </div>
      <div className="px-3 py-2.5">
        <div className="divide-y border">
          {itinerary.flights.map((flight, index) => {
            const openJaw = openJawsByPreviousFlight.get(flight.id)
            return (
              <Fragment key={flight.id}>
                <FlightCard
                  flight={flight}
                  index={index}
                  onDelete={() => deleteFlight(flight.id)}
                  onEdit={() => onEditFlight(flight)}
                />
                {openJaw ? <OpenJawCard openJaw={openJaw} /> : null}
              </Fragment>
            )
          })}
        </div>
      </div>
      <div className="flex items-start justify-between gap-5 border-t bg-muted/20 p-3">
        <div className="space-y-1">
          <Label htmlFor="end-open-jaw">End itinerary with an open jaw</Label>
          <p className="max-w-lg text-[11px] leading-5 text-muted-foreground">
            Use this only when the final airport differs from the first. The
            closing surface distance counts toward mileage and segments.
          </p>
        </div>
        <Switch
          checked={itinerary.endWithOpenJaw}
          id="end-open-jaw"
          onCheckedChange={setEndWithOpenJaw}
        />
      </div>
    </Card>
  )
}
