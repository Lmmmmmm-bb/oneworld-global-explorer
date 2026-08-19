export const APP_CONFIG = {
  name: "Global Explorer Planner",
  description:
    "An unofficial planning and validation tool for oneworld Global Explorer itineraries.",
  officialTermsUrl:
    "https://assets.ctfassets.net/m9ph4qvas97u/2pqmhTK95sqIsn5UP02lz/a55a65324e4eff966e9d520216b6c307/Global_Explorer_27_FEB_26.pdf",
  storageKey: "global-explorer-planner.itinerary",
  schemaVersion: 1,
} as const

export const MILEAGE_BANDS = [26_000, 29_000, 34_000, 39_000] as const
