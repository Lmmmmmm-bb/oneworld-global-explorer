import { useEffect, useRef, useState, type FC } from "react"
import { Globe2, MapPinned, TriangleAlert } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { airportByIata } from "@/features/route-data"
import { useItineraryStore } from "@/stores"

import { buildRouteGeoJson, buildRoutePoints } from "../map-geometry"

type MapStatus = "loading" | "ready" | "error"

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY?.trim()

interface MapFallbackProps {
  kind: "missing-key" | "error"
}

const MapFallback: FC<MapFallbackProps> = ({ kind }) => (
  <div className="page-grid grid aspect-[16/9] min-h-64 place-items-center bg-muted/25 p-6 text-center">
    <div>
      {kind === "missing-key" ? (
        <MapPinned
          aria-hidden="true"
          className="mx-auto size-10 text-primary/60"
        />
      ) : (
        <TriangleAlert
          aria-hidden="true"
          className="mx-auto size-10 text-amber-600"
        />
      )}
      <p className="mt-3 text-xs font-medium">
        {kind === "missing-key" ? "Map key not configured" : "Map unavailable"}
      </p>
      <p className="mx-auto mt-1 max-w-xs text-[11px] leading-5 text-muted-foreground">
        {kind === "missing-key"
          ? "Add VITE_MAPTILER_KEY locally to enable the optional route overview. Planning and validation still work without it."
          : "The base map could not be loaded. Your itinerary and validation remain available."}
      </p>
    </div>
  </div>
)

export const RouteMap: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const flights = useItineraryStore((state) => state.itinerary.flights)
  const [status, setStatus] = useState<MapStatus>("loading")

  useEffect(() => {
    if (!MAPTILER_KEY || !containerRef.current) return
    let cancelled = false
    let mapInstance: import("maplibre-gl").Map | null = null

    const initializeMap = async () => {
      try {
        const maplibre = await import("maplibre-gl")
        if (cancelled || !containerRef.current) return

        const routeData = buildRouteGeoJson(flights, airportByIata)
        const routePoints = buildRoutePoints(flights, airportByIata)
        const map = new maplibre.Map({
          container: containerRef.current,
          style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${encodeURIComponent(MAPTILER_KEY)}`,
          center: [10, 15],
          zoom: 0.6,
          interactive: false,
          attributionControl: false,
          renderWorldCopies: false,
          fadeDuration: 0,
        })
        mapInstance = map
        map.getCanvas().setAttribute("tabindex", "-1")
        map.getCanvas().setAttribute("aria-hidden", "true")
        map.addControl(new maplibre.AttributionControl({ compact: true }))

        map.on("load", () => {
          if (cancelled) return
          map.addSource("flight-routes", {
            type: "geojson",
            data: routeData,
          })
          map.addLayer({
            id: "flight-route-casing",
            type: "line",
            source: "flight-routes",
            paint: {
              "line-color": "#ffffff",
              "line-opacity": 0.9,
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 3, 5, 5],
            },
          })
          map.addLayer({
            id: "flight-routes",
            type: "line",
            source: "flight-routes",
            paint: {
              "line-color": "#168368",
              "line-opacity": 0.92,
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                1.5,
                5,
                2.5,
              ],
            },
          })

          for (const point of routePoints) {
            const marker = document.createElement("div")
            marker.className = "route-map-marker"
            marker.textContent = point.sequence
            marker.title = `${point.sequence}. ${point.airport.city} (${point.airport.iata})`
            marker.setAttribute("aria-hidden", "true")
            new maplibre.Marker({ element: marker, anchor: "center" })
              .setLngLat([point.airport.longitude, point.airport.latitude])
              .addTo(map)
          }

          if (routePoints.length === 1) {
            map.jumpTo({
              center: [
                routePoints[0].airport.longitude,
                routePoints[0].airport.latitude,
              ],
              zoom: 2.5,
            })
          } else if (routePoints.length > 1) {
            const longitudes = routePoints.map(
              ({ airport }) => airport.longitude
            )
            const crossesDateLine =
              Math.max(...longitudes) - Math.min(...longitudes) > 180
            const bounds = new maplibre.LngLatBounds()
            routePoints.forEach(({ airport }) => {
              const longitude =
                crossesDateLine && airport.longitude < 0
                  ? airport.longitude + 360
                  : airport.longitude
              bounds.extend([longitude, airport.latitude])
            })
            map.fitBounds(bounds, {
              padding: 52,
              maxZoom: 3.2,
              duration: 0,
            })
          }

          setStatus("ready")
        })

        map.on("error", () => {
          if (!cancelled && !map.loaded()) setStatus("error")
        })
      } catch {
        if (!cancelled) setStatus("error")
      }
    }

    void initializeMap()
    return () => {
      cancelled = true
      mapInstance?.remove()
    }
  }, [flights])

  return (
    <Card className="overflow-hidden py-0">
      {!MAPTILER_KEY ? <MapFallback kind="missing-key" /> : null}
      {MAPTILER_KEY ? (
        <div
          aria-label="Non-interactive map of the planned flight segments"
          className="relative aspect-[16/9] min-h-64 overflow-hidden bg-muted/30"
          role="img"
        >
          <div className="absolute inset-0" ref={containerRef} />
          {status === "loading" ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center bg-muted/70 backdrop-blur-xs">
              <div className="text-center">
                <Globe2
                  aria-hidden="true"
                  className="mx-auto size-9 text-primary/60"
                />
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Loading route overview…
                </p>
              </div>
            </div>
          ) : null}
          {status === "error" ? (
            <div className="absolute inset-0 bg-background">
              <MapFallback kind="error" />
            </div>
          ) : null}
        </div>
      ) : null}
      <CardContent className="flex items-start justify-between gap-4 border-t py-3 text-[11px] text-muted-foreground">
        <span>
          Flight paths only · open jaws intentionally omitted · interaction
          disabled
        </span>
        <span className="shrink-0 tabular-nums">
          {flights.length} {flights.length === 1 ? "flight" : "flights"}
        </span>
      </CardContent>
    </Card>
  )
}
