import { useEffect, useState } from "react"

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const syncMatches = () => setMatches(mediaQuery.matches)

    syncMatches()
    mediaQuery.addEventListener("change", syncMatches)

    return () => mediaQuery.removeEventListener("change", syncMatches)
  }, [query])

  return matches
}
