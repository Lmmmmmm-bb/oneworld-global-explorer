import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import createGlobe, {
  type Arc,
  type COBEOptions,
  type Globe,
  type Marker,
} from "cobe"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FlightSegment } from "@/features/itinerary"
import { airportByIata } from "@/features/route-data"
import { cn } from "@/lib/utils"

import { buildGlobeRouteData } from "../globe-data"
import {
  resolveReleaseAngularVelocity,
  smoothAngularVelocity,
  stepAngularInertia,
} from "../globe-motion"
import type { MapSelection } from "../map-selection"

type GlobeAvailability = "checking" | "available" | "unavailable"

interface ActivePointer {
  x: number
  y: number
}

interface DragGesture {
  angularVelocity: number
  lastSampleAt: number
  lastX: number
  pointerId: number
  startPhi: number
  startTheta: number
  startX: number
  startY: number
}

interface FocusAnimation {
  duration: number
  fromPhi: number
  fromTheta: number
  startedAt: number | null
  toPhi: number
  toTheta: number
}

const INITIAL_SCALE = 0.9
const DEFAULT_MARKER_SIZE = 0.035
const MUTED_MARKER_SIZE = 0.016
const FOCUSED_ROUTE_COLOR: [number, number, number] = [0.02, 0.48, 0.32]
const MUTED_ROUTE_COLOR: [number, number, number] = [0.62, 0.74, 0.69]
const AUTO_ROTATE_RADIANS_PER_MS = 0.00006
const INTERACTION_PAUSE_MS = 1_800
const FOCUS_ANIMATION_MS = 650
const INERTIA_MAXIMUM_VELOCITY = 0.006
const INERTIA_MINIMUM_VELOCITY = 0.00002
const INERTIA_SAMPLE_MAXIMUM_AGE_MS = 80
const INERTIA_SMOOTHING = 0.25
const INERTIA_TIME_CONSTANT_MS = 325
const POST_INERTIA_PAUSE_MS = 250
const GLOBE_CONTEXT = {
  alpha: true,
  antialias: true,
  depth: false,
  preserveDrawingBuffer: false,
  stencil: false,
} satisfies WebGLContextAttributes

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

const getShortestRotation = (from: number, to: number) =>
  from + Math.atan2(Math.sin(to - from), Math.cos(to - from))

const getInitialView = (latitude: number, longitude: number) => ({
  phi: -Math.PI / 2 - (longitude * Math.PI) / 180,
  theta: clamp((latitude * Math.PI) / 180, -0.55, 0.55),
})

const getMarkerStyle = (id: string) =>
  ({
    opacity: `var(--cobe-visible-${id}, 0)`,
    positionAnchor: `--cobe-${id}`,
  }) as CSSProperties

interface RouteMapProps {
  flights: FlightSegment[]
  onClearSelection: () => void
  selection?: MapSelection | null
}

export const RouteMap: FC<RouteMapProps> = ({
  flights,
  onClearSelection,
  selection,
}) => {
  const selectedFlightId = selection?.flightId
  const selectedFlight = flights.find(({ id }) => id === selectedFlightId)
  const focusedFrom = selectedFlight?.from
  const focusedTo = selectedFlight?.to
  const hasFocus = focusedFrom !== undefined && focusedTo !== undefined
  const routeData = useMemo(
    () => buildGlobeRouteData(flights, airportByIata),
    [flights]
  )
  const visibleMarkers = hasFocus
    ? routeData.markers.filter(
        ({ airport }) =>
          airport.iata === focusedFrom || airport.iata === focusedTo
      )
    : routeData.markers
  const globeMarkers = useMemo<Marker[]>(() => {
    const focusedFlight = flights.find(({ id }) => id === selectedFlightId)
    return routeData.markers.map(({ airport, id, location }) => {
      const isFocusedAirport =
        airport.iata === focusedFlight?.from ||
        airport.iata === focusedFlight?.to
      const isMuted = Boolean(focusedFlight) && !isFocusedAirport

      return {
        id,
        location,
        size: isMuted ? MUTED_MARKER_SIZE : DEFAULT_MARKER_SIZE,
        color: focusedFlight
          ? isFocusedAirport
            ? FOCUSED_ROUTE_COLOR
            : MUTED_ROUTE_COLOR
          : undefined,
      }
    })
  }, [flights, routeData.markers, selectedFlightId])
  const globeArcs = useMemo<Arc[]>(() => {
    const hasSelectedArc = routeData.arcs.some(
      ({ flightId }) => flightId === selectedFlightId
    )
    return routeData.arcs.map(({ flightId, from, id, to }) => ({
      color: hasSelectedArc
        ? flightId === selectedFlightId
          ? FOCUSED_ROUTE_COLOR
          : MUTED_ROUTE_COLOR
        : undefined,
      from,
      id,
      to,
    }))
  }, [routeData.arcs, selectedFlightId])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasMountRef = useRef<HTMLDivElement>(null)
  const interactionSurfaceRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(0)
  const thetaRef = useRef(0.18)
  const activePointersRef = useRef(new Map<number, ActivePointer>())
  const dragGestureRef = useRef<DragGesture | null>(null)
  const inertiaVelocityRef = useRef(0)
  const focusAnimationRef = useRef<FocusAnimation | null>(null)
  const animationTimestampRef = useRef(0)
  const resumeRotationAtRef = useRef(0)
  const hasCenteredRouteRef = useRef(false)
  const lastSelectionRef = useRef<MapSelection | null>(null)
  const reducedMotionRef = useRef(false)
  const [availability, setAvailability] =
    useState<GlobeAvailability>("checking")
  const [isDragging, setIsDragging] = useState(false)

  const updateView = useCallback(() => {
    globeRef.current?.update({
      phi: phiRef.current,
      theta: thetaRef.current,
    })
  }, [])

  const pauseAutoRotation = useCallback(() => {
    resumeRotationAtRef.current =
      animationTimestampRef.current + INTERACTION_PAUSE_MS
  }, [])

  const focusAirport = useCallback(
    (latitude: number, longitude: number) => {
      inertiaVelocityRef.current = 0
      const target = getInitialView(latitude, longitude)
      const targetPhi = getShortestRotation(phiRef.current, target.phi)

      if (reducedMotionRef.current) {
        focusAnimationRef.current = null
        phiRef.current = targetPhi
        thetaRef.current = target.theta
        pauseAutoRotation()
        updateView()
        return
      }

      focusAnimationRef.current = {
        duration: FOCUS_ANIMATION_MS,
        fromPhi: phiRef.current,
        fromTheta: thetaRef.current,
        startedAt: null,
        toPhi: targetPhi,
        toTheta: target.theta,
      }
      resumeRotationAtRef.current = Number.POSITIVE_INFINITY
    },
    [pauseAutoRotation, updateView]
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasMount = canvasMountRef.current
    const interactionSurface = interactionSurfaceRef.current
    if (!canvas || !canvasMount || !interactionSurface) return

    const webGlContext =
      canvas.getContext("webgl2", GLOBE_CONTEXT) ??
      canvas.getContext("webgl", GLOBE_CONTEXT)
    if (!webGlContext) {
      setAvailability("unavailable")
      return
    }

    const preventMultiTouchZoom = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault()
    }
    const preventGestureZoom = (event: Event) => event.preventDefault()
    interactionSurface.addEventListener("touchstart", preventMultiTouchZoom, {
      passive: false,
    })
    interactionSurface.addEventListener("touchmove", preventMultiTouchZoom, {
      passive: false,
    })
    interactionSurface.addEventListener("gesturestart", preventGestureZoom, {
      passive: false,
    })
    interactionSurface.addEventListener("gesturechange", preventGestureZoom, {
      passive: false,
    })

    const bounds = canvasMount.getBoundingClientRect()
    const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const options: COBEOptions = {
      arcColor: [0.04, 0.55, 0.39],
      arcHeight: 0.22,
      arcs: [],
      arcWidth: 0.7,
      baseColor: [0.78, 0.86, 0.83],
      dark: 0,
      devicePixelRatio,
      diffuse: 1.15,
      glowColor: [0.93, 0.98, 0.96],
      height: Math.max(1, Math.round(bounds.height)),
      mapBaseBrightness: 0.02,
      mapBrightness: 4.6,
      mapSamples: 16_000,
      markerColor: [0.04, 0.55, 0.39],
      markerElevation: 0.025,
      markers: [],
      opacity: 1,
      phi: phiRef.current,
      scale: INITIAL_SCALE,
      theta: thetaRef.current,
      width: Math.max(1, Math.round(bounds.width)),
    }
    const globe = createGlobe(canvas, options)
    const cobeWrapper = canvas.parentElement
    globeRef.current = globe
    setAvailability("available")

    const resizeObserver = new ResizeObserver(([entry]) => {
      globe.update({
        height: Math.max(1, Math.round(entry.contentRect.height)),
        width: Math.max(1, Math.round(entry.contentRect.width)),
      })
    })
    resizeObserver.observe(canvasMount)

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    reducedMotionRef.current = reducedMotion.matches
    const handleReducedMotionChange = () => {
      reducedMotionRef.current = reducedMotion.matches
      if (reducedMotion.matches) inertiaVelocityRef.current = 0
    }
    reducedMotion.addEventListener("change", handleReducedMotionChange)
    let animationFrame = 0
    let previousFrame: number | null = null
    const animate = (timestamp: number) => {
      const elapsed = Math.min(
        previousFrame === null ? 0 : timestamp - previousFrame,
        32
      )
      previousFrame = timestamp
      animationTimestampRef.current = timestamp
      const focusAnimation = focusAnimationRef.current

      if (focusAnimation) {
        const startedAt = focusAnimation.startedAt ?? timestamp
        focusAnimation.startedAt = startedAt
        const progress = clamp(
          (timestamp - startedAt) / focusAnimation.duration,
          0,
          1
        )
        const easedProgress = easeOutCubic(progress)
        phiRef.current =
          focusAnimation.fromPhi +
          (focusAnimation.toPhi - focusAnimation.fromPhi) * easedProgress
        thetaRef.current =
          focusAnimation.fromTheta +
          (focusAnimation.toTheta - focusAnimation.fromTheta) * easedProgress
        globe.update({ phi: phiRef.current, theta: thetaRef.current })

        if (progress === 1) {
          focusAnimationRef.current = null
          resumeRotationAtRef.current = timestamp + INTERACTION_PAUSE_MS
        }
      } else if (
        !reducedMotion.matches &&
        activePointersRef.current.size === 0 &&
        inertiaVelocityRef.current !== 0
      ) {
        const inertia = stepAngularInertia({
          elapsedMs: elapsed,
          minimumVelocity: INERTIA_MINIMUM_VELOCITY,
          timeConstantMs: INERTIA_TIME_CONSTANT_MS,
          velocity: inertiaVelocityRef.current,
        })
        phiRef.current += inertia.rotation
        inertiaVelocityRef.current = inertia.velocity
        globe.update({ phi: phiRef.current })

        if (!inertia.active) {
          resumeRotationAtRef.current = Math.max(
            resumeRotationAtRef.current,
            timestamp + POST_INERTIA_PAUSE_MS
          )
        }
      } else if (
        !reducedMotion.matches &&
        activePointersRef.current.size === 0 &&
        timestamp >= resumeRotationAtRef.current
      ) {
        phiRef.current += elapsed * AUTO_ROTATE_RADIANS_PER_MS
        globe.update({ phi: phiRef.current })
      }
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      reducedMotion.removeEventListener("change", handleReducedMotionChange)
      interactionSurface.removeEventListener(
        "touchstart",
        preventMultiTouchZoom
      )
      interactionSurface.removeEventListener("touchmove", preventMultiTouchZoom)
      interactionSurface.removeEventListener("gesturestart", preventGestureZoom)
      interactionSurface.removeEventListener(
        "gesturechange",
        preventGestureZoom
      )
      globe.destroy()
      globeRef.current = null
      if (
        cobeWrapper &&
        cobeWrapper !== canvasMount &&
        canvas.parentElement === cobeWrapper
      ) {
        canvasMount.insertBefore(canvas, cobeWrapper)
        cobeWrapper.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (!globeRef.current) return

    if (routeData.markers.length === 0) {
      hasCenteredRouteRef.current = false
    } else if (!hasCenteredRouteRef.current) {
      const { latitude, longitude } = routeData.markers[0].airport
      const initialView = getInitialView(latitude, longitude)
      phiRef.current = initialView.phi
      thetaRef.current = initialView.theta
      hasCenteredRouteRef.current = true
    }

    globeRef.current.update({
      arcs: globeArcs,
      markers: globeMarkers,
      phi: phiRef.current,
      scale: INITIAL_SCALE,
      theta: thetaRef.current,
    })
  }, [globeArcs, globeMarkers, routeData.markers])

  useEffect(() => {
    if (availability !== "available") return
    if (!selection) {
      if (lastSelectionRef.current) {
        focusAnimationRef.current = null
        pauseAutoRotation()
      }
      lastSelectionRef.current = null
      return
    }
    lastSelectionRef.current = selection
    const flight = flights.find(({ id }) => id === selection.flightId)
    const destination = flight && airportByIata.get(flight.to)
    if (destination) focusAirport(destination.latitude, destination.longitude)
  }, [availability, flights, focusAirport, pauseAutoRotation, selection])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    focusAnimationRef.current = null
    inertiaVelocityRef.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const pointers = [...activePointersRef.current.values()]
    if (pointers.length === 1) {
      dragGestureRef.current = {
        angularVelocity: 0,
        lastSampleAt: event.timeStamp,
        lastX: event.clientX,
        pointerId: event.pointerId,
        startPhi: phiRef.current,
        startTheta: thetaRef.current,
        startX: event.clientX,
        startY: event.clientY,
      }
    } else {
      dragGestureRef.current = null
    }
    resumeRotationAtRef.current = Number.POSITIVE_INFINITY
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return
    activePointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    })

    const pointers = [...activePointersRef.current.values()]
    if (pointers.length !== 1) return

    const drag = dragGestureRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const sensitivity = Math.PI / Math.max(event.currentTarget.clientWidth, 320)
    drag.angularVelocity = smoothAngularVelocity({
      elapsedMs: event.timeStamp - drag.lastSampleAt,
      maximumVelocity: INERTIA_MAXIMUM_VELOCITY,
      movement: event.clientX - drag.lastX,
      previousVelocity: drag.angularVelocity,
      sensitivity,
      smoothing: INERTIA_SMOOTHING,
    })
    drag.lastSampleAt = event.timeStamp
    drag.lastX = event.clientX
    phiRef.current = drag.startPhi + (event.clientX - drag.startX) * sensitivity
    if (event.pointerType !== "touch") {
      thetaRef.current = clamp(
        drag.startTheta + (event.clientY - drag.startY) * sensitivity,
        -1.05,
        1.05
      )
    }
    updateView()
  }

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const endedDrag = dragGestureRef.current
    activePointersRef.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const remainingPointers = [...activePointersRef.current.entries()]
    if (remainingPointers.length === 1) {
      const [remainingPointer] = remainingPointers
      const [pointerId, pointer] = remainingPointer
      dragGestureRef.current = {
        angularVelocity: 0,
        lastSampleAt: event.timeStamp,
        lastX: pointer.x,
        pointerId,
        startPhi: phiRef.current,
        startTheta: thetaRef.current,
        startX: pointer.x,
        startY: pointer.y,
      }
      return
    }

    if (remainingPointers.length > 1) {
      dragGestureRef.current = null
      return
    }

    dragGestureRef.current = null
    inertiaVelocityRef.current = resolveReleaseAngularVelocity({
      cancelled: event.type === "pointercancel",
      maximumSampleAgeMs: INERTIA_SAMPLE_MAXIMUM_AGE_MS,
      minimumVelocity: INERTIA_MINIMUM_VELOCITY,
      reducedMotion: reducedMotionRef.current,
      sampleAgeMs:
        endedDrag && endedDrag.pointerId === event.pointerId
          ? Math.max(0, event.timeStamp - endedDrag.lastSampleAt)
          : Number.POSITIVE_INFINITY,
      velocity:
        endedDrag && endedDrag.pointerId === event.pointerId
          ? endedDrag.angularVelocity
          : 0,
    })
    pauseAutoRotation()
    setIsDragging(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rotationStep = 0.12
    let handled = true

    switch (event.key) {
      case "ArrowLeft":
        phiRef.current -= rotationStep
        break
      case "ArrowRight":
        phiRef.current += rotationStep
        break
      case "ArrowUp":
        thetaRef.current = clamp(thetaRef.current - rotationStep, -1.05, 1.05)
        break
      case "ArrowDown":
        thetaRef.current = clamp(thetaRef.current + rotationStep, -1.05, 1.05)
        break
      default:
        handled = false
    }

    if (!handled) return
    event.preventDefault()
    focusAnimationRef.current = null
    inertiaVelocityRef.current = 0
    pauseAutoRotation()
    updateView()
  }

  if (availability === "unavailable") return null

  return (
    <Card
      className="gap-0 overflow-hidden py-0"
      hidden={availability !== "available"}
    >
      <div
        aria-label="Interactive globe of the planned flight segments. Drag or use the arrow keys to rotate."
        className={cn(
          "page-grid relative aspect-square min-h-64 touch-pan-y overflow-hidden bg-muted/20 outline-none select-none sm:aspect-[16/10] lg:aspect-square 2xl:aspect-[16/10]",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        ref={interactionSurfaceRef}
        role="region"
        tabIndex={0}
      >
        <div className="absolute inset-0" ref={canvasMountRef}>
          <canvas
            aria-hidden="true"
            className="block size-full"
            ref={canvasRef}
          />
        </div>

        {visibleMarkers.map(({ airport, id, sequence }) => (
          <span
            aria-hidden="true"
            className="airport-globe-label"
            key={id}
            style={getMarkerStyle(id)}
            title={`${sequence}. ${airport.iata} · ${airport.name}`}
          >
            {airport.iata}
          </span>
        ))}

        {routeData.markers.length === 0 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[11px] text-muted-foreground">
            Add a flight to plot your route
          </div>
        ) : null}
      </div>

      {routeData.markers.length > 0 ? (
        <div className="border-t p-3">
          {selectedFlight ? (
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[11px] font-medium text-foreground">
                Focused flight · {selectedFlight.from} → {selectedFlight.to}
              </p>
              <Button
                className="shrink-0"
                onClick={() => {
                  interactionSurfaceRef.current?.focus()
                  onClearSelection()
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                Clear focus
              </Button>
            </div>
          ) : null}
          <ul
            aria-label="Airports shown on the globe"
            className="relative flex flex-wrap gap-1.5"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {visibleMarkers.map(({ airport, id }) => (
                <motion.li
                  animate={{ opacity: 1, y: 0 }}
                  className="relative max-w-full min-w-0"
                  exit={{ opacity: 0, y: -4 }}
                  initial={{ opacity: 0, y: 4 }}
                  key={id}
                  layout="position"
                  transition={{ duration: 0.18 }}
                >
                  <button
                    aria-label={`Focus globe on ${airport.iata}, ${airport.name}`}
                    className={cn(
                      "flex max-w-full min-w-0 items-center gap-1.5 border bg-background px-2 py-1 text-left text-[10px] transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
                      selectedFlight &&
                        (selectedFlight.from === airport.iata ||
                          selectedFlight.to === airport.iata) &&
                        "border-primary bg-primary/10"
                    )}
                    onClick={() =>
                      focusAirport(airport.latitude, airport.longitude)
                    }
                    title={`${airport.iata} · ${airport.name}, ${airport.city}`}
                    type="button"
                  >
                    <span className="font-bold text-primary">
                      {airport.iata}
                    </span>
                    <span className="min-w-0 truncate text-muted-foreground">
                      {airport.name}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      ) : null}

      <CardContent className="flex items-start justify-between gap-4 border-t p-3 text-[11px] text-muted-foreground">
        <span>Interactive globe · flight paths only · open jaws omitted</span>
        <span className="shrink-0 tabular-nums">
          {flights.length} {flights.length === 1 ? "flight" : "flights"}
        </span>
      </CardContent>
    </Card>
  )
}
