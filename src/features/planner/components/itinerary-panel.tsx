import { Fragment, type FC } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type {
  CabinClass,
  FlightSegment,
  Itinerary,
  ItineraryValidation,
  MileageBandPreference,
} from "@/features/itinerary"

import { FlightCard } from "./flight-card"
import { ItineraryEmptyState } from "./itinerary-empty-state"
import { OpenJawCard } from "./open-jaw-card"
import { PlanSettings } from "./plan-settings"

interface ItineraryPanelProps {
  itinerary: Itinerary
  validation: ItineraryValidation
  readOnly?: boolean
  onAddFlight?: () => void
  onCabinClassChange?: (cabinClass: CabinClass) => void
  onDeleteFlight?: (id: string) => void
  onEditFlight?: (flight: FlightSegment) => void
  onEndWithOpenJawChange?: (enabled: boolean) => void
  onMileageBandChange?: (mileageBand: MileageBandPreference) => void
}

export const ItineraryPanel: FC<ItineraryPanelProps> = ({
  itinerary,
  onAddFlight,
  onCabinClassChange,
  onDeleteFlight,
  onEditFlight,
  onEndWithOpenJawChange,
  onMileageBandChange,
  readOnly = false,
  validation,
}) => {
  if (itinerary.flights.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="gap-0 overflow-hidden py-0">
          <PlanSettings
            itinerary={itinerary}
            onCabinClassChange={onCabinClassChange}
            onMileageBandChange={onMileageBandChange}
            readOnly={readOnly}
          />
        </Card>
        {readOnly || !onAddFlight ? (
          <Card className="grid min-h-48 place-items-center p-6 text-center">
            <div>
              <p className="text-sm font-semibold">No flights in this plan</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This shared itinerary is currently empty.
              </p>
            </div>
          </Card>
        ) : (
          <ItineraryEmptyState onAddFlight={onAddFlight} />
        )}
      </div>
    )
  }

  const openJawsByPreviousFlight = new Map(
    validation.openJaws.map((openJaw) => [openJaw.afterFlightId, openJaw])
  )

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <PlanSettings
        itinerary={itinerary}
        onCabinClassChange={onCabinClassChange}
        onMileageBandChange={onMileageBandChange}
        readOnly={readOnly}
      />
      <div className="flex items-center justify-between gap-4 border-b p-3">
        <div>
          <h2 className="text-sm font-semibold">Flight sequence</h2>
          <p className="text-[11px] text-muted-foreground">
            Flights and open jaws stay in route order.
          </p>
        </div>
        {onAddFlight ? (
          <Button onClick={onAddFlight} size="sm" type="button">
            <Plus aria-hidden="true" />
            Add flight
          </Button>
        ) : null}
      </div>
      <div className="p-3">
        <div className="divide-y border">
          {itinerary.flights.map((flight, index) => {
            const openJaw = openJawsByPreviousFlight.get(flight.id)
            return (
              <Fragment key={flight.id}>
                <FlightCard
                  flight={flight}
                  index={index}
                  onDelete={
                    onDeleteFlight ? () => onDeleteFlight(flight.id) : undefined
                  }
                  onEdit={onEditFlight ? () => onEditFlight(flight) : undefined}
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
        {readOnly ? (
          <span className="shrink-0 text-xs font-medium">
            {itinerary.endWithOpenJaw ? "Yes" : "No"}
          </span>
        ) : (
          <Switch
            checked={itinerary.endWithOpenJaw}
            id="end-open-jaw"
            onCheckedChange={onEndWithOpenJawChange}
          />
        )}
      </div>
    </Card>
  )
}
