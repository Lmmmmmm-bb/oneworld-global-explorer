import type {
  CabinClass,
  MileageBand,
  MileageBandPreference,
} from "@/features/itinerary"

import { BAND_RULES } from "./config"

const BANDS = [26_000, 29_000, 34_000, 39_000] as const

export const getCompatibleBands = (cabinClass: CabinClass) =>
  BANDS.filter((band) => BAND_RULES[band].compatibleCabins.includes(cabinClass))

export const resolveMileageBand = (
  preference: MileageBandPreference,
  cabinClass: CabinClass,
  totalMiles: number
): MileageBand | null => {
  if (preference !== "auto") return preference

  return (
    getCompatibleBands(cabinClass).find((band) => totalMiles <= band) ?? null
  )
}
