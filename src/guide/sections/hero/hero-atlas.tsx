import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { RouteAtlas } from "../../visuals/route-atlas/route-atlas.tsx"
import { EXAMPLE_ATLAS } from "../../visuals/route-atlas/atlas-model.ts"
import { useRoutePlayback } from "../../visuals/route-atlas/use-route-playback.ts"
import { useMotionSettings } from "../../motion/use-motion-settings.ts"

export const HeroAtlas = () => {
  const ref = useRef<HTMLDivElement>(null)
  const elapsed = useRoutePlayback(ref, EXAMPLE_ATLAS.timeline.duration)
  const { motionEnabled } = useMotionSettings()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [-6, 6])
  return (
    <div className="hero-chart" ref={ref}>
      <div className="hero-chart-caption" aria-hidden="true">
        <span>THE WORLD, WITH A WAY THROUGH.</span>
        <span>FLIGHTPATH / 001</span>
      </div>
      <motion.div
        className="hero-map-layer"
        style={motionEnabled ? { y } : undefined}
      >
        <RouteAtlas tone="dark" playback={{ mode: "draw", elapsed }} />
      </motion.div>
      <div className="hero-chart-coordinates" aria-hidden="true">
        <span>180° W</span>
        <span>0° / PRIME MERIDIAN</span>
        <span>180° E</span>
      </div>
    </div>
  )
}
