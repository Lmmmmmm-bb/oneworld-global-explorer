import type { ComponentProps, FC, ReactNode } from "react"
import { motion } from "motion/react"

import { TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface AnimatedMobileTabProps extends ComponentProps<typeof TabsTrigger> {
  active: boolean
  children: ReactNode
}

export const AnimatedMobileTab: FC<AnimatedMobileTabProps> = ({
  active,
  children,
  className,
  ...props
}) => (
  <TabsTrigger
    className={cn(
      "isolate data-active:bg-transparent dark:data-active:bg-transparent",
      className
    )}
    {...props}
  >
    {active ? (
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 z-0 rounded-md border border-border bg-background shadow-xs dark:bg-input/30"
        layoutId="mobile-planner-tab"
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
      />
    ) : null}
    <span className="relative z-10 inline-flex items-center gap-1.5">
      {children}
    </span>
  </TabsTrigger>
)
