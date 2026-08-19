import { useEffect, useState } from "react"

import { validateItinerary } from "@/features/rules"
import { useItineraryStore } from "@/stores"

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const syncMatches = () => setMatches(mediaQuery.matches)

    syncMatches()
    mediaQuery.addEventListener("change", syncMatches)

    return () => mediaQuery.removeEventListener("change", syncMatches)
  }, [query])

  return matches
}

export const useItineraryValidation = () => {
  const itinerary = useItineraryStore((state) => state.itinerary)
  return validateItinerary(itinerary)
}
