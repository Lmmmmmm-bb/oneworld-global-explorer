export const formatMiles = (miles: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(miles)

export const createId = (): string => crypto.randomUUID()

export const haversineMiles = (
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
) => {
  const earthRadiusMiles = 3_958.8
  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const fromLatitude = toRadians(from.latitude)
  const toLatitude = toRadians(to.latitude)
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return Math.round(
    earthRadiusMiles *
      2 *
      Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}
