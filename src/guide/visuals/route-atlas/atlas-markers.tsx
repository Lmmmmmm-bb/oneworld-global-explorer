import { motion, useTransform, type MotionValue } from "motion/react"
import type { AtlasModel, AtlasPlayback } from "./atlas-model.ts"

type Marker = AtlasModel["markers"][number]
const Arrival = ({
  marker,
  elapsed,
}: {
  marker: Marker
  elapsed: MotionValue<number>
}) => {
  const opacity = useTransform(elapsed, (time) =>
    time + 1e-8 >= marker.arrival ? 1 : 0
  )
  return (
    <motion.circle
      className="atlas-arrival"
      cx={marker.x}
      cy={marker.y}
      r="9"
      style={{ opacity }}
    />
  )
}
export const AtlasMarkers = ({
  model,
  labels,
  playback,
}: {
  model: AtlasModel
  labels: boolean
  playback: AtlasPlayback
}) => (
  <>
    {model.markers.map((marker) => {
      const west = marker.longitude > 80
      const labelX = marker.x + (west ? -15 : 15)
      return (
        <g key={marker.iata}>
          {playback.mode === "draw" ? (
            <Arrival marker={marker} elapsed={playback.elapsed} />
          ) : (
            <circle
              className="atlas-arrival"
              cx={marker.x}
              cy={marker.y}
              r="9"
            />
          )}
          <circle className="atlas-stop" cx={marker.x} cy={marker.y} r="3.5" />
          {labels && (
            <g className="atlas-label" textAnchor={west ? "end" : "start"}>
              <text x={labelX} y={marker.y - 12} className="atlas-code">
                {marker.iata}
              </text>
              <text x={labelX} y={marker.y + 5} className="atlas-city">
                {marker.city}
              </text>
            </g>
          )}
        </g>
      )
    })}
  </>
)
