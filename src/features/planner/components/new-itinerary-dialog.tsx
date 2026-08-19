import type { FC } from "react"
import { FilePlus2 } from "lucide-react"

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

interface NewItineraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onExport: () => void
}

export const NewItineraryDialog: FC<NewItineraryDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onExport,
}) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogMedia>
          <FilePlus2 aria-hidden="true" />
        </AlertDialogMedia>
        <AlertDialogTitle>Start a new itinerary?</AlertDialogTitle>
        <AlertDialogDescription>
          This replaces the single plan saved in this browser. Export the
          current JSON first if you may want it later.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="sm:flex-wrap">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button onClick={onExport} type="button" variant="outline">
          Export JSON first
        </Button>
        <AlertDialogAction
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
          type="button"
        >
          Start new
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
