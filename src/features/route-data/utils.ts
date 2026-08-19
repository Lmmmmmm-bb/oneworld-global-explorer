import type { Airport } from "./types"

const normalize = (value: string) => value.trim().toLocaleLowerCase()

const getSearchScore = (airport: Airport, query: string) => {
  const iata = airport.iata.toLocaleLowerCase()
  const city = airport.city.toLocaleLowerCase()
  const name = airport.name.toLocaleLowerCase()
  const country = airport.country.toLocaleLowerCase()

  if (iata.startsWith(query)) return 0
  if (city.startsWith(query)) return 1
  if (name.startsWith(query)) return 2
  if (country.startsWith(query)) return 3
  if (`${city} ${name} ${country} ${iata}`.includes(query)) return 4
  return Number.POSITIVE_INFINITY
}

export const sortAirportsByCity = (airports: Airport[]) =>
  [...airports].sort(
    (left, right) =>
      left.city.localeCompare(right.city) || left.iata.localeCompare(right.iata)
  )

export const searchAirports = (
  candidates: Airport[],
  rawQuery: string,
  limit = 80
) => {
  const query = normalize(rawQuery)

  if (!query) return sortAirportsByCity(candidates).slice(0, limit)

  return candidates
    .map((airport) => ({ airport, score: getSearchScore(airport, query) }))
    .filter(({ score }) => Number.isFinite(score))
    .sort(
      (left, right) =>
        left.score - right.score ||
        left.airport.city.localeCompare(right.airport.city) ||
        left.airport.iata.localeCompare(right.airport.iata)
    )
    .slice(0, limit)
    .map(({ airport }) => airport)
}
