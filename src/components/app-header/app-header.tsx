import type { FC } from "react"
import { Download, FilePlus2, FileUp, Globe2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/config"

import { HistoryControls, type HistoryControlsProps } from "./history-controls"

type AppHeaderProps = {
  onAddFlight: () => void
  onExport: () => void
  onImport: () => void
  onNew: () => void
  history: Omit<HistoryControlsProps, "variant">
}

export const AppHeader: FC<AppHeaderProps> = ({
  onAddFlight,
  onExport,
  onImport,
  onNew,
  history,
}) => (
  <header className="border-b bg-background/95 backdrop-blur">
    <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground">
          <Globe2 aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {APP_CONFIG.name}
          </p>
          <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
            Unofficial route planning tool
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="hidden sm:block">
          <HistoryControls {...history} variant="desktop" />
        </div>
        <div
          aria-hidden="true"
          className="mx-1 hidden h-6 w-px bg-border sm:block"
        />
        <Button
          aria-label="Start a new itinerary"
          className="size-10 sm:w-auto"
          onClick={onNew}
          variant="ghost"
        >
          <FilePlus2 aria-hidden="true" />
          <span className="hidden xl:inline">New</span>
        </Button>
        <Button
          aria-label="Import itinerary"
          className="size-10 sm:w-auto"
          onClick={onImport}
          variant="ghost"
        >
          <FileUp aria-hidden="true" />
          <span className="hidden xl:inline">Import</span>
        </Button>
        <Button
          aria-label="Export itinerary"
          className="size-10 sm:w-auto"
          onClick={onExport}
          variant="ghost"
        >
          <Download aria-hidden="true" />
          <span className="hidden xl:inline">Export</span>
        </Button>
        <Button className="hidden sm:flex" onClick={onAddFlight} size="lg">
          <Plus aria-hidden="true" />
          Add flight
        </Button>
      </div>
    </div>
    <div className="border-t px-4 py-1.5 sm:hidden">
      <HistoryControls {...history} variant="mobile" />
    </div>
  </header>
)
