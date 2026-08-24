import { useRef, useState, type FC } from "react"
import { Copy, PencilLine } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Itinerary } from "@/features/itinerary"

import { copyTextToClipboard } from "../clipboard"
import { createBrowserShareUrl } from "../url"

interface CopySharedItineraryDialogProps {
  hasLocalItinerary: boolean
  localItinerary: Itinerary
  open: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export const CopySharedItineraryDialog: FC<CopySharedItineraryDialogProps> = ({
  hasLocalItinerary,
  localItinerary,
  onConfirm,
  onOpenChange,
  open,
}) => {
  const [backupUrl, setBackupUrl] = useState("")
  const [backupMessage, setBackupMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const copyBackup = async () => {
    const result = createBrowserShareUrl(localItinerary)

    if (!result.success) {
      setBackupMessage("A backup link could not be created for the local plan.")
      return
    }

    setBackupUrl(result.url)
    const copied = await copyTextToClipboard(result.url)
    setBackupMessage(
      copied
        ? "Current local itinerary link copied."
        : "Clipboard access was unavailable. The link is selected for manual copy."
    )

    if (!copied) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <PencilLine aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            Copy this itinerary to your planner?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasLocalItinerary
              ? "This replaces the itinerary saved in this browser. You can copy a backup link first, and the replacement can be undone during this session."
              : "This creates an editable local copy in this browser. The original shared link stays unchanged."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasLocalItinerary ? (
          <div className="space-y-2">
            {backupUrl ? (
              <Input
                aria-label="Current itinerary backup link"
                onFocus={(event) => event.currentTarget.select()}
                readOnly
                ref={inputRef}
                value={backupUrl}
              />
            ) : null}
            <Button onClick={copyBackup} type="button" variant="outline">
              <Copy aria-hidden="true" />
              Copy current itinerary link
            </Button>
            <p aria-live="polite" className="text-[11px] text-muted-foreground">
              {backupMessage}
            </p>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Copy and edit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
