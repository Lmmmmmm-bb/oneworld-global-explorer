import { haversineMiles } from "../../utils.ts"

export const JOURNEY_AIRPORTS = [
  {
    iata: "SFO",
    city: "San Francisco",
    country: "United States",
    latitude: 37.615215,
    longitude: -122.389881,
  },
  {
    iata: "LHR",
    city: "London",
    country: "United Kingdom",
    latitude: 51.469603,
    longitude: -0.453566,
  },
  {
    iata: "HND",
    city: "Tokyo",
    country: "Japan",
    latitude: 35.553476,
    longitude: 139.781206,
  },
  {
    iata: "SYD",
    city: "Sydney",
    country: "Australia",
    latitude: -33.932922,
    longitude: 151.179898,
  },
] as const

const CARRIERS = [
  { code: "BA", name: "British Airways" },
  { code: "JL", name: "Japan Airlines" },
  { code: "QF", name: "Qantas" },
  { code: "QF", name: "Qantas" },
] as const

export const JOURNEY_LEGS = JOURNEY_AIRPORTS.map((from, index) => {
  const to = JOURNEY_AIRPORTS[(index + 1) % JOURNEY_AIRPORTS.length]
  return { from, to, carrier: CARRIERS[index], miles: haversineMiles(from, to) }
})

export const JOURNEY_MILES = JOURNEY_LEGS.reduce(
  (total, leg) => total + leg.miles,
  0
)
export const JOURNEY_BAND = 26_000
export const JOURNEY_REMAINING = JOURNEY_BAND - JOURNEY_MILES

// The existing read-only example. Keep local so previews open the same build.
export const EXAMPLE_ROUTE_URL =
  "/#/share/v1/eJy1kUFLw0AQhf_LnOOh6ik3GymlFItWFBEPYzJJhm52l901WkL-u5MNWCkt5NLjzLw37xumgxbSWQI71gWkwIE1OXR7SKDAgJB24POaGnwh59noKM7xk3Wm0HuxUG60aQZDw4qwojnGVfgVjDRJF68c6o0lvcJvSEtUnhIoFVd1EP97BzzI6Qcbq-hqJp7SmUZa28VGCtmSwnr5NASg25EQVhk6x-RkML-TPvvMFORrdPQXYKzccUI7VC2q570VLfhgrGll2idHHNcHjjE8ciwf7k9zrNbTOaJ2KsfNgWMMjxzbtzMcj4vpHFE7leP2319i-MgRX3RJjo--_wVCe97h"

export const JOURNEY_ROUTE_LABEL = [...JOURNEY_AIRPORTS, JOURNEY_AIRPORTS[0]]
  .map(({ iata }) => iata)
  .join(" → ")
