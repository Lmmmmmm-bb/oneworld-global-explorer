import { useMemo, useState, type FC, type FormEvent } from "react"
import { ArrowRight, Info, PlaneTakeoff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { createFlightSegment, type FlightSegment } from "@/features/itinerary"
import {
  airports,
  getDestinationAirports,
  getRoute,
  routesByOrigin,
} from "@/features/route-data"
import {
  getMarketingCarrierOptions,
  getOperatingCarrierOptions,
} from "@/features/rules"

import { AirportPicker } from "./airport-picker"

interface FlightEditorSheetProps {
  open: boolean
  flight: FlightSegment | null
  defaultOrigin: string
  onOpenChange: (open: boolean) => void
  onSave: (flight: FlightSegment) => void
}

type FlightEditorContentProps = Omit<FlightEditorSheetProps, "open">

const FlightEditorContent: FC<FlightEditorContentProps> = ({
  flight,
  defaultOrigin,
  onOpenChange,
  onSave,
}) => {
  const [draft, setDraft] = useState<FlightSegment>(() =>
    flight
      ? { ...flight }
      : createFlightSegment({ from: defaultOrigin, arrivalType: "stopover" })
  )

  const destinationAirports = useMemo(
    () => (draft.from ? getDestinationAirports(draft.from) : []),
    [draft.from]
  )
  const carrierCounts = useMemo(
    () =>
      new Map(
        (routesByOrigin.get(draft.from) ?? []).map((route) => [
          route.to,
          route.carrierCodes.length,
        ])
      ),
    [draft.from]
  )
  const selectedRoute = draft.to ? getRoute(draft.from, draft.to) : undefined
  const marketingCarriers = getMarketingCarrierOptions(
    selectedRoute?.carrierCodes ?? []
  )
  const operatingCarriers = getOperatingCarrierOptions(draft.marketingCarrier)
  const isReady = Boolean(
    draft.from &&
    draft.to &&
    draft.marketingCarrier &&
    (!draft.isCodeshare || draft.operatingCarrier)
  )

  const setOrigin = (iata: string) => {
    const currentRoute = draft.to ? getRoute(iata, draft.to) : undefined
    const preferredCarrier = currentRoute
      ? getMarketingCarrierOptions(currentRoute.carrierCodes)[0]?.code
      : ""

    setDraft((current) => ({
      ...current,
      from: iata,
      to: currentRoute ? current.to : "",
      marketingCarrier: currentRoute ? preferredCarrier : "",
      operatingCarrier: currentRoute ? preferredCarrier : "",
      isCodeshare: false,
    }))
  }

  const setDestination = (iata: string) => {
    const route = getRoute(draft.from, iata)
    const preferredCarrier = route
      ? getMarketingCarrierOptions(route.carrierCodes)[0]?.code
      : ""
    setDraft((current) => ({
      ...current,
      to: iata,
      marketingCarrier: preferredCarrier,
      operatingCarrier: preferredCarrier,
      isCodeshare: false,
    }))
  }

  const setMarketingCarrier = (marketingCarrier: string | null) => {
    if (!marketingCarrier) return
    const options = getOperatingCarrierOptions(marketingCarrier)
    setDraft((current) => ({
      ...current,
      marketingCarrier,
      operatingCarrier: options.some(
        ({ id }) => id === current.operatingCarrier
      )
        ? current.operatingCarrier
        : marketingCarrier,
    }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!isReady) return
    onSave({
      ...draft,
      operatingCarrier: draft.isCodeshare
        ? draft.operatingCarrier
        : draft.marketingCarrier,
    })
    onOpenChange(false)
  }

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent className="w-full! max-w-none! sm:max-w-xl!">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <SheetHeader className="border-b">
            <div className="mb-2 grid size-9 place-items-center bg-primary text-primary-foreground">
              <PlaneTakeoff aria-hidden="true" className="size-4" />
            </div>
            <SheetTitle className="text-base">
              {flight ? "Edit flight" : "Add flight"}
            </SheetTitle>
            <SheetDescription>
              Destinations are limited to eligible direct routes from the
              selected departure airport.
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-6">
            {defaultOrigin && draft.from !== defaultOrigin ? (
              <div className="flex gap-2 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                The previous flight ends at {defaultOrigin}. Saving this
                departure from {draft.from} will automatically create an open
                jaw between them.
              </div>
            ) : null}

            <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <AirportPicker
                candidates={airports}
                label="From"
                onChange={(airport) => setOrigin(airport.iata)}
                value={draft.from}
              />
              <ArrowRight
                aria-hidden="true"
                className="mb-3 hidden size-4 text-muted-foreground sm:block"
              />
              <AirportPicker
                candidates={destinationAirports}
                carrierCounts={carrierCounts}
                disabled={!draft.from}
                label="To"
                onChange={(airport) => setDestination(airport.iata)}
                placeholder={
                  draft.from ? "Choose a direct route" : "Choose From first"
                }
                value={draft.to}
              />
            </div>

            {draft.from && destinationAirports.length === 0 ? (
              <p className="text-xs text-destructive">
                No eligible outbound routes are available from {draft.from} in
                this snapshot.
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="marketing-carrier">Marketing carrier</Label>
              <Select
                disabled={!selectedRoute}
                onValueChange={setMarketingCarrier}
                value={draft.marketingCarrier || null}
              >
                <SelectTrigger className="h-11 w-full" id="marketing-carrier">
                  <SelectValue placeholder="Choose a carrier" />
                </SelectTrigger>
                <SelectContent>
                  {marketingCarriers.map((carrier) => (
                    <SelectItem key={carrier.code} value={carrier.code}>
                      {carrier.code} · {carrier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                A preferred member carrier is selected automatically; you can
                change it to another carrier listed on this route.
              </p>
            </div>

            <div className="flex min-h-12 items-center justify-between gap-4 border p-3">
              <div>
                <Label htmlFor="codeshare">Codeshare flight</Label>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Enable only when another airline operates the service.
                </p>
              </div>
              <Switch
                checked={draft.isCodeshare}
                id="codeshare"
                onCheckedChange={(checked) =>
                  setDraft((current) => ({
                    ...current,
                    isCodeshare: checked,
                    operatingCarrier: checked
                      ? current.operatingCarrier || current.marketingCarrier
                      : current.marketingCarrier,
                  }))
                }
              />
            </div>

            {draft.isCodeshare ? (
              <div className="space-y-2">
                <Label htmlFor="operating-carrier">Operating carrier</Label>
                <Select
                  onValueChange={(operatingCarrier) =>
                    operatingCarrier &&
                    setDraft((current) => ({
                      ...current,
                      operatingCarrier,
                    }))
                  }
                  value={draft.operatingCarrier || null}
                >
                  <SelectTrigger className="h-11 w-full" id="operating-carrier">
                    <SelectValue placeholder="Choose an operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operatingCarriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.id.includes(":") ? "Affiliate" : carrier.id} ·{" "}
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="arrival-type">After arrival</Label>
              <Select
                onValueChange={(arrivalType) =>
                  arrivalType &&
                  setDraft((current) => ({
                    ...current,
                    arrivalType: arrivalType as FlightSegment["arrivalType"],
                  }))
                }
                value={draft.arrivalType}
              >
                <SelectTrigger className="h-11 w-full" id="arrival-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stopover">Stopover</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Open jaws always count as stopovers and are handled
                automatically.
              </p>
            </div>
          </div>

          <SheetFooter className="border-t bg-background">
            <Button disabled={!isReady} size="lg" type="submit">
              {flight ? "Save changes" : "Add flight"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              size="lg"
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export const FlightEditorSheet: FC<FlightEditorSheetProps> = ({
  open,
  ...props
}) =>
  open ? (
    <FlightEditorContent
      key={props.flight?.id ?? `new:${props.defaultOrigin}`}
      {...props}
    />
  ) : null
