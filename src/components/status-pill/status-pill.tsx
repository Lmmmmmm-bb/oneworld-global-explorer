import type { FC } from "react"
import { AlertTriangle, Check, CircleDashed } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppStatus } from "@/types"

const STATUS_DETAILS = {
  incomplete: {
    label: "Incomplete",
    icon: CircleDashed,
    className: "border-amber-300 bg-amber-50 text-amber-950",
    iconClassName: "bg-amber-500 text-white",
  },
  valid: {
    label: "Route valid",
    icon: Check,
    className: "border-emerald-300 bg-emerald-50 text-emerald-950",
    iconClassName: "bg-emerald-600 text-white",
  },
  invalid: {
    label: "Route invalid",
    icon: AlertTriangle,
    className: "border-red-300 bg-red-50 text-red-950",
    iconClassName: "bg-red-600 text-white",
  },
} as const

type StatusPillProps = {
  status: AppStatus
}

export const StatusPill: FC<StatusPillProps> = ({ status }) => {
  const details = STATUS_DETAILS[status]
  const Icon = details.icon

  return (
    <Badge
      aria-live="polite"
      className={cn(
        "h-7 gap-1.5 rounded-none px-1.5 pr-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-[0.01em]",
        details.className
      )}
      role="status"
      variant="outline"
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-4 shrink-0 place-items-center",
          details.iconClassName
        )}
      >
        <Icon className="size-2.5" strokeWidth={2.5} />
      </span>
      <span>{details.label}</span>
    </Badge>
  )
}
