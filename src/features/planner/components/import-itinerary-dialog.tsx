import { forwardRef, useImperativeHandle, useRef, useState } from "react"
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

export interface ImportItineraryDialogHandle {
  chooseFile: () => void
}

interface ImportItineraryDialogProps {
  onImport: (itinerary: Itinerary) => void
}

export const ImportItineraryDialog = forwardRef<
  ImportItineraryDialogHandle,
  ImportItineraryDialogProps
>(({ onImport }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [candidate, setCandidate] = useState<Itinerary | null>(null)
  const [issues, setIssues] = useState<string[]>([])

  useImperativeHandle(ref, () => ({
    chooseFile: () => inputRef.current?.click(),
  }))

  const clear = () => {
    setCandidate(null)
    setIssues([])
    setFileName("")
    if (inputRef.current) inputRef.current.value = ""
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) clear()
  }

  const validation = candidate ? validateItinerary(candidate) : null

  return (
    <>
      <input
        accept="application/json,.json"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          if (!file) return
          const result = parseItineraryJson(await file.text())
          setFileName(file.name)
          setCandidate(result.success ? result.itinerary : null)
          setIssues(result.success ? [] : result.issues)
          setOpen(true)
        }}
        ref={inputRef}
        tabIndex={-1}
        type="file"
      />
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mb-2 grid size-9 place-items-center bg-primary/10 text-primary">
              <FileJson aria-hidden="true" className="size-4" />
            </div>
            <DialogTitle>Import itinerary</DialogTitle>
            <DialogDescription>
              Review {fileName || "the selected file"} before replacing the
              current locally saved plan. The import can be undone before the
              page is reloaded.
            </DialogDescription>
          </DialogHeader>

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
            <Button
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              {candidate ? "Cancel" : "Close"}
            </Button>
            {candidate ? (
              <Button
                onClick={() => {
                  onImport(candidate)
                  handleOpenChange(false)
                }}
                type="button"
              >
                Import and replace
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
})

ImportItineraryDialog.displayName = "ImportItineraryDialog"
