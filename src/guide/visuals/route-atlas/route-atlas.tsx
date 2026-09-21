import { useId } from "react"
import { AtlasBackground } from "./atlas-background.tsx"
import { AtlasMarkers } from "./atlas-markers.tsx"
import { AtlasRoute } from "./atlas-route.tsx"
import {
  EXAMPLE_ATLAS,
  type AtlasModel,
  type AtlasPlayback,
} from "./atlas-model.ts"

export const RouteAtlas = ({
  model = EXAMPLE_ATLAS,
  className = "",
  tone = "light",
  labels = true,
  playback = { mode: "static" },
}: {
  model?: AtlasModel
  className?: string
  tone?: "light" | "dark"
  labels?: boolean
  playback?: AtlasPlayback
}) => {
  const id = useId().replaceAll(":", "")
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`route-atlas ${className}`}
      data-tone={tone}
      data-playback={playback.mode}
      viewBox="0 0 1000 440"
      fill="none"
    >
      <AtlasBackground id={id} />
      <g clipPath={`url(#${id}-clip)`}>
        <AtlasRoute model={model} playback={playback} />
        <AtlasMarkers model={model} labels={labels} playback={playback} />
      </g>
    </svg>
  )
}
