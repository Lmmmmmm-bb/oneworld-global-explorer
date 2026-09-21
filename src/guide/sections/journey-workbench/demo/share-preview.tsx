import { ArrowRight, CheckCheck, Copy, Link2 } from "lucide-react"
import { useState } from "react"
import { EXAMPLE_ROUTE_URL } from "../../../data/journey.ts"

export const SharePreview = () => {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle"
  )
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        new URL(EXAMPLE_ROUTE_URL, window.location.origin).href
      )
      setCopyState("copied")
    } catch {
      setCopyState("error")
    }
  }
  return (
    <div className="demo-share">
      <div className="demo-caption">
        <span>Good journeys are shared</span>
        <Link2 className="size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 font-heading text-[23px] tracking-[-0.04em]">
        One link. The whole journey.
      </p>
      <p className="text-guide-muted mt-2 text-sm leading-relaxed">
        A read-only copy of the route. Anyone with the link can read the
        snapshot.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" className="demo-copy" onClick={() => void copy()}>
          {copyState === "copied" ? (
            <CheckCheck className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {copyState === "copied" ? "Link copied" : "Copy example link"}
        </button>
        <a href={EXAMPLE_ROUTE_URL} className="demo-open">
          Open example <ArrowRight className="size-3.5" aria-hidden="true" />
        </a>
      </div>
      <p
        role="status"
        className="text-guide-muted mt-3 min-h-10 text-xs leading-relaxed"
      >
        {copyState === "error"
          ? "Copy is unavailable. Open the example and copy its address."
          : copyState === "copied"
            ? "Example itinerary link copied to your clipboard."
            : "Your working itinerary is not changed."}
      </p>
    </div>
  )
}
