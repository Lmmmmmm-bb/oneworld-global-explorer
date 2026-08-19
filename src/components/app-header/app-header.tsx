import type { FC } from "react"
import { Download, FileUp, Globe2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/config"

type AppHeaderProps = {
  onAddFlight?: () => void
}

export const AppHeader: FC<AppHeaderProps> = ({ onAddFlight }) => (
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
        <Button aria-label="Import itinerary" variant="ghost">
          <FileUp aria-hidden="true" />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <Button aria-label="Export itinerary" variant="ghost">
          <Download aria-hidden="true" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button onClick={onAddFlight} size="lg">
          <Plus aria-hidden="true" />
          Add flight
        </Button>
      </div>
    </div>
  </header>
)
