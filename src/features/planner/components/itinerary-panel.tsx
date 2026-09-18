import { useRef, type FC } from "react"
import { Plus } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

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
  OpenJawSegment,
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
  onShowFlightOnMap?: (id: string) => void
  selectedFlightId?: string
  onEndWithOpenJawChange?: (enabled: boolean) => void
  onMileageBandChange?: (mileageBand: MileageBandPreference) => void
}

type SequenceRow =
  | { kind: "flight"; key: string; flight: FlightSegment; index: number }
  | { kind: "open-jaw"; key: string; openJaw: OpenJawSegment }

export const ItineraryPanel: FC<ItineraryPanelProps> = ({
  itinerary,
  onAddFlight,
  onCabinClassChange,
  onDeleteFlight,
  onEditFlight,
  onShowFlightOnMap,
  selectedFlightId,
  onEndWithOpenJawChange,
  onMileageBandChange,
  readOnly = false,
  validation,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  const openJawsByPreviousFlight = new Map(
    validation.openJaws.map((openJaw) => [openJaw.afterFlightId, openJaw])
  )
  const rows: SequenceRow[] = itinerary.flights.flatMap(
    (flight, index): SequenceRow[] => {
      const openJaw = openJawsByPreviousFlight.get(flight.id)
      return [
        { kind: "flight", key: `flight:${flight.id}`, flight, index },
        ...(openJaw
          ? [{ kind: "open-jaw" as const, key: `jaw:${openJaw.id}`, openJaw }]
          : []),
      ]
    }
  )

  const removeFlight = (flight: FlightSegment, index: number) => {
    const nextFlight =
      itinerary.flights[index + 1] ?? itinerary.flights[index - 1]
    onDeleteFlight?.(flight.id)

    // The focused delete button exits with its row. Move focus to a stable action.
    requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const editButtons = panel.querySelectorAll<HTMLButtonElement>(
        "[data-flight-edit-id]"
      )
      const nextButton = Array.from(editButtons).find(
        (button) => button.dataset.flightEditId === nextFlight?.id
      )
      const addButtons =
        panel.querySelectorAll<HTMLButtonElement>("[data-flight-add]")
      const buttonToFocus = nextButton ?? addButtons.item(addButtons.length - 1)
      buttonToFocus?.focus()
    })
  }

  return (
    <div className="relative" ref={panelRef}>
      <AnimatePresence initial={false} mode="popLayout">
        {itinerary.flights.length === 0 ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative space-y-4"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 8 }}
            key="empty"
            transition={{ duration: 0.18 }}
          >
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
                  <p className="text-sm font-semibold">
                    No flights in this plan
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This shared itinerary is currently empty.
                  </p>
                </div>
              </Card>
            ) : (
              <ItineraryEmptyState onAddFlight={onAddFlight} />
            )}
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            exit={{ opacity: 0, y: -6 }}
            initial={{ opacity: 0, y: 8 }}
            key="filled"
            transition={{ duration: 0.18 }}
          >
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
                  <Button
                    data-flight-add
                    onClick={onAddFlight}
                    size="sm"
                    type="button"
                  >
                    <Plus aria-hidden="true" />
                    Add flight
                  </Button>
                ) : null}
              </div>
              <div className="p-3">
                <div className="relative border">
                  <AnimatePresence initial={false} mode="popLayout">
                    {rows.map((row) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className="relative border-b last:border-b-0"
                        exit={{ opacity: 0, y: -6 }}
                        initial={{ opacity: 0, y: 8 }}
                        key={row.key}
                        layout="position"
                        transition={{
                          layout: {
                            type: "spring",
                            stiffness: 420,
                            damping: 38,
                          },
                          opacity: { duration: 0.16 },
                          y: { duration: 0.2 },
                        }}
                      >
                        {row.kind === "flight" ? (
                          <FlightCard
                            flight={row.flight}
                            index={row.index}
                            selectedOnMap={selectedFlightId === row.flight.id}
                            onDelete={
                              onDeleteFlight
                                ? () => removeFlight(row.flight, row.index)
                                : undefined
                            }
                            onEdit={
                              onEditFlight
                                ? () => onEditFlight(row.flight)
                                : undefined
                            }
                            onShowOnMap={
                              onShowFlightOnMap
                                ? () => onShowFlightOnMap(row.flight.id)
                                : undefined
                            }
                          />
                        ) : (
                          <OpenJawCard openJaw={row.openJaw} />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="flex items-start justify-between gap-5 border-t bg-muted/20 p-3">
                <div className="space-y-1">
                  <Label htmlFor="end-open-jaw">
                    End itinerary with an open jaw
                  </Label>
                  <p className="max-w-lg text-[11px] leading-5 text-muted-foreground">
                    Use this only when the final airport differs from the first.
                    The closing surface distance counts toward mileage and
                    segments.
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
