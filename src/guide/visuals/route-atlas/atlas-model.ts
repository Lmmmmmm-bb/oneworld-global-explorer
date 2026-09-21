import type { MotionValue } from "motion/react"
import { JOURNEY_AIRPORTS, JOURNEY_LEGS } from "../../data/journey.ts"
import {
  greatCircleSegments,
  projectLocation,
} from "../../lib/map-projection.ts"
import { createRouteTimeline } from "../../lib/route-drawing.ts"
import { GUIDE_MOTION } from "../../motion/transitions.ts"

const timeline = createRouteTimeline(
  JOURNEY_LEGS.map(({ from, to }) => greatCircleSegments(from, to)),
  GUIDE_MOTION.route.duration
)
export const EXAMPLE_ATLAS = {
  timeline,
  markers: JOURNEY_AIRPORTS.map((airport, index) => ({
    ...airport,
    ...projectLocation(airport),
    arrival:
      timeline.arrivals.find(
        ({ legIndex }) =>
          legIndex === (index + JOURNEY_LEGS.length - 1) % JOURNEY_LEGS.length
      )?.at ?? 0,
  })),
}
export type AtlasModel = typeof EXAMPLE_ATLAS
export type AtlasPlayback =
  { mode: "static" } | { mode: "draw"; elapsed: MotionValue<number> }
