import type { FC } from "react"
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
} from "lucide-react"

import { StatusPill } from "@/components/status-pill"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { APP_CONFIG } from "@/config"
import type { ItineraryValidation, RuleMessage } from "@/features/itinerary"
import { cn } from "@/lib/utils"
import { formatMiles } from "@/utils"

interface RuleMessageRowProps {
  message: RuleMessage
}

const RuleMessageRow: FC<RuleMessageRowProps> = ({ message }) => {
  const Icon =
    message.kind === "violation"
      ? AlertCircle
      : message.kind === "warning"
        ? AlertTriangle
        : CircleDashed

  return (
    <li
      className={cn(
        "flex gap-2.5 border p-3",
        message.kind === "violation" && "border-red-200 bg-red-50/70",
        message.kind === "warning" && "border-amber-200 bg-amber-50/70",
        message.kind === "incomplete" && "border-border bg-muted/25"
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          "mt-0.5 size-4 shrink-0",
          message.kind === "violation" && "text-red-700",
          message.kind === "warning" && "text-amber-700",
          message.kind === "incomplete" && "text-muted-foreground"
        )}
      />
      <span>
        <span className="block text-xs font-medium text-foreground">
          {message.title}
        </span>
        <span className="mt-0.5 block text-[11px] leading-5 text-muted-foreground">
          {message.description}
        </span>
      </span>
    </li>
  )
}

interface ValidationPanelProps {
  validation: ItineraryValidation
}

export const ValidationPanel: FC<ValidationPanelProps> = ({ validation }) => {
  const { metrics } = validation
  const primaryMessages =
    validation.status === "invalid"
      ? validation.violations
      : validation.status === "incomplete"
        ? validation.incomplete
        : []
  const mileageProgress = metrics.selectedBand
    ? Math.min(100, (metrics.totalMiles / metrics.selectedBand) * 100)
    : 100

  return (
    <Card className="gap-0 py-0 [--card-spacing:--spacing(3)]">
      <CardHeader className="border-b p-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">Route validation</CardTitle>
          <StatusPill status={validation.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-3">
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
                Estimated mileage
              </p>
              <p className="mt-1 text-lg font-semibold tabular-nums">
                {formatMiles(metrics.totalMiles)} mi
              </p>
            </div>
            <p className="text-right text-[11px] text-muted-foreground tabular-nums">
              {metrics.remainingMiles === null
                ? "No compatible band"
                : `${formatMiles(Math.max(0, metrics.remainingMiles))} mi remaining`}
            </p>
          </div>
          <Progress aria-label="Mileage band usage" value={mileageProgress} />
          <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
            <span>Flights {formatMiles(metrics.flightMiles)}</span>
            <span>Open jaws {formatMiles(metrics.openJawMiles)}</span>
            <span className="text-right">
              Stopovers {metrics.stopoverCount}
            </span>
          </div>
        </div>

        {metrics.regionPath.length > 0 ? (
          <div>
            <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
              Region path
            </p>
            <p className="mt-2 text-xs leading-5 font-medium">
              {metrics.regionPath.join(" → ")}
            </p>
          </div>
        ) : null}

        {validation.status === "valid" ? (
          <div className="flex gap-2.5 border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            <div>
              <p className="text-xs font-medium">All route checks passed</p>
              <p className="mt-0.5 text-[11px] leading-5 text-emerald-800">
                The current plan passes the basic route-derived checks included
                in this planner.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {primaryMessages.map((message) => (
              <RuleMessageRow key={message.id} message={message} />
            ))}
          </ul>
        )}

        {validation.warnings.length > 0 ? (
          <ul className="space-y-2">
            {validation.warnings.map((message) => (
              <RuleMessageRow key={message.id} message={message} />
            ))}
          </ul>
        ) : null}
      </CardContent>
      <p className="border-t p-3 text-[11px] leading-5 text-muted-foreground">
        Basic planning checks only. This does not confirm pricing, inventory,
        booking class, ticketing agreements, or ticket issuance. Read the{" "}
        <a
          className="font-medium text-foreground underline underline-offset-3"
          href={APP_CONFIG.officialTermsUrl}
          rel="noreferrer"
          target="_blank"
        >
          official terms
        </a>
        .
      </p>
    </Card>
  )
}
