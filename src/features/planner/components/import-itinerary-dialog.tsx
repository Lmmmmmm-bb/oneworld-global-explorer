import { useEffect, useState, type FC } from "react"
import { FileJson, TriangleAlert } from "lucide-react"

import { StatusPill } from "@/components/status-pill"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { parseItineraryJson, type Itinerary } from "@/features/itinerary"
import { validateItinerary } from "@/features/rules"
import { formatMiles } from "@/utils"

interface ImportItineraryDialogProps {
  file: File
  onClose: () => void
  onImport: (itinerary: Itinerary) => void
}

export const ImportItineraryDialog: FC<ImportItineraryDialogProps> = ({
  file,
  onClose,
  onImport,
}) => {
  const [candidate, setCandidate] = useState<Itinerary | null>(null)
  const [issues, setIssues] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    void file.text().then(
      (source) => {
        if (!active) return
        const result = parseItineraryJson(source)
        setCandidate(result.success ? result.itinerary : null)
        setIssues(result.success ? [] : result.issues)
        setLoading(false)
      },
      () => {
        if (!active) return
        setIssues(["The selected file could not be read."])
        setLoading(false)
      }
    )

    return () => {
      active = false
    }
  }, [file])

  const validation = candidate ? validateItinerary(candidate) : null

  return (
    <Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mb-2 grid size-9 place-items-center bg-primary/10 text-primary">
            <FileJson aria-hidden="true" className="size-4" />
          </div>
          <DialogTitle>Import itinerary</DialogTitle>
          <DialogDescription>
            Review {file.name} before replacing the current locally saved plan.
            The import can be undone before the page is reloaded.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="border bg-muted/20 p-4 text-xs text-muted-foreground">
            Reading and validating the selected file…
          </p>
        ) : null}

        {issues.length > 0 ? (
          <div className="border border-red-200 bg-red-50 p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-red-900">
              <TriangleAlert aria-hidden="true" className="size-4" />
              This file cannot be imported
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[11px] text-red-800">
              {issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {candidate && validation ? (
          <div className="space-y-4 border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium">Import preview</p>
                <p className="text-[11px] text-muted-foreground">
                  Rule checks are recalculated from the current app data.
                </p>
              </div>
              <StatusPill status={validation.status} />
            </div>
            <dl className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  Flights
                </dt>
                <dd className="mt-1 font-semibold">
                  {validation.metrics.flightCount}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  Segments
                </dt>
                <dd className="mt-1 font-semibold">
                  {validation.metrics.segmentCount}/16
                </dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-wide text-muted-foreground uppercase">
                  Miles
                </dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {formatMiles(validation.metrics.totalMiles)}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        <DialogFooter>
          <Button onClick={onClose} type="button" variant="outline">
            {candidate ? "Cancel" : "Close"}
          </Button>
          {candidate ? (
            <Button
              onClick={() => {
                onImport(candidate)
                onClose()
              }}
              type="button"
            >
              Import and replace
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
