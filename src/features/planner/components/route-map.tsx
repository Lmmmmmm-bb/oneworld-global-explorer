import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FC,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react"
import createGlobe, {
  type Arc,
  type COBEOptions,
  type Globe,
  type Marker,
} from "cobe"

import { Card, CardContent } from "@/components/ui/card"
import { airportByIata } from "@/features/route-data"
import { cn } from "@/lib/utils"
import { useItineraryStore } from "@/stores"

import { buildGlobeRouteData } from "../globe-data"

type GlobeAvailability = "checking" | "available" | "unavailable"

interface ActivePointer {
  pointerType: string
  x: number
  y: number
}

interface DragGesture {
  pointerId: number
  startPhi: number
  startTheta: number
  startX: number
  startY: number
}

interface PinchGesture {
  startDistance: number
  startScale: number
}

const INITIAL_SCALE = 0.9
const MIN_SCALE = 0.72
const MAX_SCALE = 1.08
const AUTO_ROTATE_RADIANS_PER_MS = 0.00006
const INTERACTION_PAUSE_MS = 1_800
const GLOBE_CONTEXT = {
  alpha: true,
  antialias: true,
  depth: false,
  preserveDrawingBuffer: false,
  stencil: false,
} satisfies WebGLContextAttributes

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value))

const getPointerDistance = (pointers: ActivePointer[]) => {
  if (pointers.length < 2) return 0
  return Math.hypot(
    pointers[0].x - pointers[1].x,
    pointers[0].y - pointers[1].y
  )
}

const getInitialView = (latitude: number, longitude: number) => ({
  phi: -Math.PI / 2 - (longitude * Math.PI) / 180,
  theta: clamp((latitude * Math.PI) / 180, -0.55, 0.55),
})

const getMarkerStyle = (id: string) =>
  ({
    opacity: `var(--cobe-visible-${id}, 0)`,
    positionAnchor: `--cobe-${id}`,
  }) as CSSProperties

export const RouteMap: FC = () => {
  const flights = useItineraryStore((state) => state.itinerary.flights)
  const routeData = useMemo(
    () => buildGlobeRouteData(flights, airportByIata),
    [flights]
  )
  const globeMarkers = useMemo<Marker[]>(
    () =>
      routeData.markers.map(({ id, location }) => ({
        id,
        location,
        size: 0.035,
      })),
    [routeData.markers]
  )
  const globeArcs = useMemo<Arc[]>(
    () =>
      routeData.arcs.map(({ from, id, to }) => ({
        from,
        id,
        to,
      })),
    [routeData.arcs]
  )

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasMountRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<Globe | null>(null)
  const phiRef = useRef(0)
  const thetaRef = useRef(0.18)
  const scaleRef = useRef(INITIAL_SCALE)
  const activePointersRef = useRef(new Map<number, ActivePointer>())
  const dragGestureRef = useRef<DragGesture | null>(null)
  const pinchGestureRef = useRef<PinchGesture | null>(null)
  const resumeRotationAtRef = useRef(0)
  const hasCenteredRouteRef = useRef(false)
  const [availability, setAvailability] =
    useState<GlobeAvailability>("checking")
  const [isDragging, setIsDragging] = useState(false)

  const updateView = () => {
    globeRef.current?.update({
      phi: phiRef.current,
      scale: scaleRef.current,
      theta: thetaRef.current,
    })
  }

  const pauseAutoRotation = () => {
    resumeRotationAtRef.current = performance.now() + INTERACTION_PAUSE_MS
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const canvasMount = canvasMountRef.current
    if (!canvas || !canvasMount) return

    const webGlContext =
      canvas.getContext("webgl2", GLOBE_CONTEXT) ??
      canvas.getContext("webgl", GLOBE_CONTEXT)
    if (!webGlContext) {
      setAvailability("unavailable")
      return
    }

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
      scale: scaleRef.current,
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
    let animationFrame = 0
    let previousFrame = performance.now()
    const animate = (timestamp: number) => {
      const elapsed = Math.min(timestamp - previousFrame, 32)
      previousFrame = timestamp
      if (
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
      scale: scaleRef.current,
      theta: thetaRef.current,
    })
  }, [globeArcs, globeMarkers, routeData.markers])

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    activePointersRef.current.set(event.pointerId, {
      pointerType: event.pointerType,
      x: event.clientX,
      y: event.clientY,
    })

    const pointers = [...activePointersRef.current.values()]
    if (pointers.length === 1) {
      dragGestureRef.current = {
        pointerId: event.pointerId,
        startPhi: phiRef.current,
        startTheta: thetaRef.current,
        startX: event.clientX,
        startY: event.clientY,
      }
    } else {
      pinchGestureRef.current = {
        startDistance: getPointerDistance(pointers),
        startScale: scaleRef.current,
      }
    }
    resumeRotationAtRef.current = Number.POSITIVE_INFINITY
    setIsDragging(true)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!activePointersRef.current.has(event.pointerId)) return
    activePointersRef.current.set(event.pointerId, {
      pointerType: event.pointerType,
      x: event.clientX,
      y: event.clientY,
    })

    const pointers = [...activePointersRef.current.values()]
    if (pointers.length >= 2) {
      const distance = getPointerDistance(pointers)
      const pinch = pinchGestureRef.current
      if (pinch?.startDistance) {
        scaleRef.current = clamp(
          pinch.startScale * (distance / pinch.startDistance),
          MIN_SCALE,
          MAX_SCALE
        )
        updateView()
      }
      return
    }

    const drag = dragGestureRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const sensitivity = Math.PI / Math.max(event.currentTarget.clientWidth, 320)
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
    activePointersRef.current.delete(event.pointerId)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const [remainingPointer] = activePointersRef.current.entries()
    if (remainingPointer) {
      const [pointerId, pointer] = remainingPointer
      dragGestureRef.current = {
        pointerId,
        startPhi: phiRef.current,
        startTheta: thetaRef.current,
        startX: pointer.x,
        startY: pointer.y,
      }
      pinchGestureRef.current = null
      return
    }

    dragGestureRef.current = null
    pinchGestureRef.current = null
    pauseAutoRotation()
    setIsDragging(false)
  }

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    scaleRef.current = clamp(
      scaleRef.current - event.deltaY * 0.0007,
      MIN_SCALE,
      MAX_SCALE
    )
    pauseAutoRotation()
    updateView()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rotationStep = 0.12
    const scaleStep = 0.06
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
      case "+":
      case "=":
        scaleRef.current = clamp(
          scaleRef.current + scaleStep,
          MIN_SCALE,
          MAX_SCALE
        )
        break
      case "-":
      case "_":
        scaleRef.current = clamp(
          scaleRef.current - scaleStep,
          MIN_SCALE,
          MAX_SCALE
        )
        break
      default:
        handled = false
    }

    if (!handled) return
    event.preventDefault()
    pauseAutoRotation()
    updateView()
  }

  if (availability === "unavailable") return null

  return (
    <Card
      className="overflow-hidden py-0"
      hidden={availability !== "available"}
    >
      <div
        aria-label="Interactive globe of the planned flight segments. Drag to rotate and use the wheel or pinch gesture to zoom."
        className={cn(
          "page-grid relative aspect-square min-h-64 touch-pan-y overflow-hidden bg-muted/20 outline-none select-none sm:aspect-[16/10] lg:aspect-square 2xl:aspect-[16/10]",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onKeyDown={handleKeyDown}
        onPointerCancel={handlePointerEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onWheel={handleWheel}
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

        {routeData.markers.map(({ airport, id, sequence }) => (
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
        <div className="border-t px-3 py-2.5">
          <div className="overflow-x-auto pb-0.5">
            <ul
              aria-label="Airports shown on the globe"
              className="flex w-max min-w-full gap-1.5"
            >
              {routeData.markers.map(({ airport, id }) => (
                <li
                  className="flex max-w-56 shrink-0 items-center gap-1.5 border bg-background px-2 py-1 text-[10px]"
                  key={id}
                  title={`${airport.iata} · ${airport.name}, ${airport.city}`}
                >
                  <span className="font-bold text-primary">{airport.iata}</span>
                  <span className="truncate text-muted-foreground">
                    {airport.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <CardContent className="flex items-start justify-between gap-4 border-t py-3 text-[11px] text-muted-foreground">
        <span>Interactive globe · flight paths only · open jaws omitted</span>
        <span className="shrink-0 tabular-nums">
          {flights.length} {flights.length === 1 ? "flight" : "flights"}
        </span>
      </CardContent>
    </Card>
  )
}
