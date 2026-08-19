import type { FC } from "react"
import { AlertTriangle, CheckCircle2, CircleDashed } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AppStatus } from "@/types"

const STATUS_DETAILS = {
  incomplete: {
    label: "Incomplete",
    icon: CircleDashed,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  valid: {
    label: "Route valid",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  invalid: {
    label: "Route invalid",
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 text-red-800",
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
      className={cn("gap-1.5 rounded-full px-2.5 py-1", details.className)}
      role="status"
      variant="outline"
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {details.label}
    </Badge>
  )
}
