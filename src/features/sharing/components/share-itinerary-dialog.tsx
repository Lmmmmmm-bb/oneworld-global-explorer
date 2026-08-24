import { useMemo, useRef, useState, type FC } from "react"
import { Check, Copy, Link2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Itinerary } from "@/features/itinerary"

import { copyTextToClipboard } from "../clipboard"
import { createBrowserShareUrl, type CreateShareUrlResult } from "../url"

interface ShareItineraryDialogProps {
  itinerary: Itinerary
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ERROR_MESSAGES: Record<
  Exclude<CreateShareUrlResult, { success: true }>["code"],
  string
> = {
  invalid_itinerary:
    "This itinerary contains data that cannot be shared. Check the saved flights and try again.",
  payload_too_large:
    "This itinerary is too large to fit safely in a share link.",
  url_too_long: "The generated link is too long for reliable sharing.",
}

export const ShareItineraryDialog: FC<ShareItineraryDialogProps> = ({
  itinerary,
  onOpenChange,
  open,
}) => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "manual">(
    "idle"
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const result = useMemo<CreateShareUrlResult | null>(
    () => (open ? createBrowserShareUrl(itinerary) : null),
    [itinerary, open]
  )

  const copyLink = async () => {
    if (!result?.success) return

    const copied = await copyTextToClipboard(result.url)
    setCopyState(copied ? "copied" : "manual")

    if (!copied) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 aria-hidden="true" className="size-4 text-primary" />
            Share this itinerary
          </DialogTitle>
          <DialogDescription>
            Anyone with the link can open this snapshot in read-only mode. The
            itinerary is compressed into the link and is not uploaded by this
            planner.
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="space-y-2">
            <Input
              aria-label="Share link"
              onFocus={(event) => event.currentTarget.select()}
              readOnly
              ref={inputRef}
              value={result.url}
            />
            <p aria-live="polite" className="text-[11px] text-muted-foreground">
              {copyState === "copied"
                ? "Link copied to clipboard."
                : copyState === "manual"
                  ? "Clipboard access was unavailable. The link is selected for manual copy."
                  : "Opening this link does not replace the recipient’s local itinerary."}
            </p>
          </div>
        ) : result ? (
          <p className="border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
            {ERROR_MESSAGES[result.code]}
          </p>
        ) : null}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
          <Button disabled={!result?.success} onClick={copyLink}>
            {copyState === "copied" ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            {copyState === "copied" ? "Copied" : "Copy link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
