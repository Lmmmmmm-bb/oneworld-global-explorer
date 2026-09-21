import type { PropsWithChildren } from "react"
import { motion } from "motion/react"
import { GUIDE_MOTION } from "./transitions.ts"
import { useMotionSettings } from "./use-motion-settings.ts"

export const Reveal = ({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) => {
  const { motionEnabled } = useMotionSettings()
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={
        motionEnabled ? { y: [8, 0], opacity: [0.85, 1] } : { y: 0, opacity: 1 }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={motionEnabled ? GUIDE_MOTION.reveal : { duration: 0 }}
    >
      {children}
    </motion.div>
  )
}
