export const ROUTE_SOURCE = {
  repository: "https://github.com/Jonty/airline-route-data",
  rawAtCommit: (commit) =>
    `https://raw.githubusercontent.com/Jonty/airline-route-data/${commit}/airline_routes.json`,
}

export const ELIGIBLE_CARRIER_CODES = [
  "AA",
  "AS",
  "AT",
  "AY",
  "BA",
  "CX",
  "EI",
  "FJ",
  "GK",
  "IB",
  "JL",
  "JQ",
  "MH",
  "NU",
  "PG",
  "QF",
  "QR",
  "RJ",
  "UL",
  "WS",
  "WY",
]
