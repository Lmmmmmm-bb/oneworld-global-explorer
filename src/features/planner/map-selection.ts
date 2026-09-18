import { useState } from "react"

export interface MapSelection {
  flightId: string
}

export const useMapSelection = (
  isDesktop: boolean,
  showMobileMap: () => void
) => {
  const [selection, setSelection] = useState<MapSelection | null>(null)

  const clearSelection = () => setSelection(null)

  const toggleFlight = (flightId: string) => {
    setSelection((current) =>
      current?.flightId === flightId
        ? null
        : { flightId }
    )

    if (!isDesktop) {
      document
        .querySelector<HTMLButtonElement>(".planner-mobile-map-tab")
        ?.focus()
      showMobileMap()
    }
  }

  return { selection, clearSelection, toggleFlight }
}
