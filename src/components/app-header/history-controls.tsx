import type { FC } from "react"
import { Redo2, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export interface HistoryControlsProps {
  canUndo: boolean
  canRedo: boolean
  undoLabel?: string
  redoLabel?: string
  onUndo: () => void
  onRedo: () => void
  variant: "desktop" | "mobile"
}

interface HistoryButtonProps {
  action: "Undo" | "Redo"
  enabled: boolean
  label?: string
  onClick: () => void
  shortcut: string
  variant: HistoryControlsProps["variant"]
}

const HistoryButton: FC<HistoryButtonProps> = ({
  action,
  enabled,
  label,
  onClick,
  shortcut,
  variant,
}) => {
  const accessibleLabel = enabled && label ? `${action}: ${label}` : action
  const Icon = action === "Undo" ? Undo2 : Redo2

  return (
    <Tooltip>
      <TooltipTrigger
        disabled={!enabled}
        render={
          <Button
            aria-label={accessibleLabel}
            className={cn(
              variant === "desktop" ? "size-10" : "h-9 flex-1 gap-2"
            )}
            disabled={!enabled}
            onClick={onClick}
            type="button"
            variant="ghost"
          />
        }
      >
        <Icon aria-hidden="true" />
        {variant === "mobile" ? <span>{action}</span> : null}
      </TooltipTrigger>
      <TooltipContent>
        <span>{enabled && label ? `${action}: ${label}` : action}</span>
        <span className="text-background/60">{shortcut}</span>
      </TooltipContent>
    </Tooltip>
  )
}

export const HistoryControls: FC<HistoryControlsProps> = ({
  canUndo,
  canRedo,
  undoLabel,
  redoLabel,
  onUndo,
  onRedo,
  variant,
}) => (
  <div
    aria-label="Itinerary history"
    className={cn(
      "flex items-center",
      variant === "mobile" ? "w-full gap-1" : "gap-0.5"
    )}
    role="group"
  >
    <HistoryButton
      action="Undo"
      enabled={canUndo}
      label={undoLabel}
      onClick={onUndo}
      shortcut="⌘/Ctrl Z"
      variant={variant}
    />
    <HistoryButton
      action="Redo"
      enabled={canRedo}
      label={redoLabel}
      onClick={onRedo}
      shortcut="⌘/Ctrl Shift Z"
      variant={variant}
    />
  </div>
)
