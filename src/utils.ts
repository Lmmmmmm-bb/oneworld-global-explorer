export const formatMiles = (miles: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(miles)

export const createId = (): string => crypto.randomUUID()
