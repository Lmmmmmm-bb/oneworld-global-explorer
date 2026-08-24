import type { FC } from "react"
import { Gauge, Plane } from "lucide-react"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CabinClass,
  Itinerary,
  MileageBand,
  MileageBandPreference,
} from "@/features/itinerary"
import { getCompatibleBands } from "@/features/rules"

const CABIN_LABELS: Record<CabinClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First",
}

const getMileageBandLabel = (band: MileageBandPreference) =>
  band === "auto"
    ? "Auto · smallest compatible band"
    : `${(band / 1_000).toFixed(0)}K miles`

interface PlanSettingsProps {
  itinerary: Itinerary
  readOnly?: boolean
  onCabinClassChange?: (cabinClass: CabinClass) => void
  onMileageBandChange?: (mileageBand: MileageBandPreference) => void
}

export const PlanSettings: FC<PlanSettingsProps> = ({
  itinerary,
  onCabinClassChange,
  onMileageBandChange,
  readOnly = false,
}) => {
  const compatibleBands = getCompatibleBands(itinerary.cabinClass)

  return (
    <div className="grid gap-2.5 border-b bg-muted/20 p-3 sm:grid-cols-2">
      <div>
        <Label
          className="mb-1.5 flex items-center gap-1.5"
          htmlFor="cabin-class"
        >
          <Plane aria-hidden="true" className="size-3.5 text-primary" />
          Cabin
        </Label>
        {readOnly ? (
          <div className="flex h-10 items-center border bg-background px-3 text-xs font-medium">
            {CABIN_LABELS[itinerary.cabinClass]}
          </div>
        ) : (
          <Select
            onValueChange={(value) =>
              value && onCabinClassChange?.(value as CabinClass)
            }
            value={itinerary.cabinClass}
          >
            <SelectTrigger className="h-10 w-full" id="cabin-class">
              <SelectValue>{CABIN_LABELS[itinerary.cabinClass]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CABIN_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label
          className="mb-1.5 flex items-center gap-1.5"
          htmlFor="mileage-band"
        >
          <Gauge aria-hidden="true" className="size-3.5 text-primary" />
          Mileage band
        </Label>
        {readOnly ? (
          <div className="flex h-10 items-center border bg-background px-3 text-xs font-medium">
            {getMileageBandLabel(itinerary.mileageBand)}
          </div>
        ) : (
          <Select
            onValueChange={(value) => {
              if (!value) return
              onMileageBandChange?.(
                value === "auto"
                  ? "auto"
                  : (Number(value) as MileageBandPreference)
              )
            }}
            value={String(itinerary.mileageBand)}
          >
            <SelectTrigger className="h-10 w-full" id="mileage-band">
              <SelectValue>
                {getMileageBandLabel(itinerary.mileageBand)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">
                {getMileageBandLabel("auto")}
              </SelectItem>
              {compatibleBands.map((band: MileageBand) => (
                <SelectItem key={band} value={String(band)}>
                  {getMileageBandLabel(band)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

export { CABIN_LABELS }
