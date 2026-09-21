import {
  motion,
  useTransform,
  type MotionValue,
  type MotionStyle,
} from "motion/react"
import { segmentProgress, type DrawSegment } from "../../lib/route-drawing.ts"
import type { AtlasModel, AtlasPlayback } from "./atlas-model.ts"

const AnimatedSegment = ({
  segment,
  elapsed,
}: {
  segment: DrawSegment
  elapsed: MotionValue<number>
}) => {
  const offset = useTransform(
    elapsed,
    (time) => 1 - segmentProgress(time, segment)
  )
  const opacity = useTransform(elapsed, (time) =>
    time > segment.delay ? 1 : 0
  )
  return (
    <motion.g
      className="atlas-segment"
      style={{ "--route-offset": offset, opacity } as MotionStyle}
    >
      <path
        d={segment.d}
        pathLength="1"
        className="atlas-route atlas-route-drawn"
      />
    </motion.g>
  )
}
export const AtlasRoute = ({
  model,
  playback,
}: {
  model: AtlasModel
  playback: AtlasPlayback
}) => (
  <g strokeWidth="1.8" strokeLinecap="round">
    {model.timeline.segments.map((piece, index) => (
      <path
        key={index}
        d={piece.d}
        className="atlas-route-track"
        strokeDasharray="2 6"
      />
    ))}
    {model.timeline.segments.map((segment, index) =>
      playback.mode === "draw" ? (
        <AnimatedSegment
          key={index}
          segment={segment}
          elapsed={playback.elapsed}
        />
      ) : (
        <path key={index} d={segment.d} className="atlas-route" />
      )
    )}
  </g>
)
