import { lazy, Suspense, useEffect, useState, type FC } from "react"
import { Link2Off } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Itinerary } from "@/features/itinerary"
import { loadRouteData } from "@/features/route-data"
import { parseShareHash } from "@/features/sharing/route"
import type { ShareCodecErrorCode } from "@/features/sharing/codec"

const loadPlannerPage = () => import("@/features/planner/pages/planner-page")
const PlannerPage = lazy(() =>
  loadPlannerPage().then((module) => ({ default: module.PlannerPage }))
)
const loadSharedItineraryPage = () =>
  import("@/features/sharing/pages/shared-itinerary-page")
const SharedItineraryPage = lazy(() =>
  loadSharedItineraryPage().then((module) => ({
    default: module.SharedItineraryPage,
  }))
)

type ShareErrorCode = ShareCodecErrorCode | "missing_payload"

type AppState =
  | { status: "loading" }
  | { status: "local" }
  | { status: "shared"; itinerary: Itinerary }
  | { status: "share-error"; code: ShareErrorCode }
  | { status: "data-error" }

const LoadingScreen: FC<{ error?: boolean; onRetry?: () => void }> = ({
  error = false,
  onRetry,
}) => (
  <main className="grid min-h-svh place-items-center bg-[#f7f8f6] px-6 text-center">
    <div className="max-w-sm">
      <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">
        Global Explorer
      </p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight">
        {error
          ? "Planner data could not be loaded"
          : "Preparing your route workspace"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {error
          ? "The bundled route snapshot is unavailable. Retry to continue without sending itinerary data anywhere."
          : "Loading the checked-in airport and route snapshot in your browser…"}
      </p>
      {error ? (
        <button
          className="mt-5 border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : (
        <div
          aria-label="Loading planner"
          className="mx-auto mt-5 size-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          role="status"
        />
      )}
    </div>
  </main>
)

const SHARE_ERROR_COPY: Record<
  ShareErrorCode,
  { title: string; body: string }
> = {
  invalid_itinerary: {
    title: "This shared itinerary is invalid",
    body: "The link opened, but its itinerary data does not match the supported format.",
  },
  malformed_payload: {
    title: "This share link is damaged",
    body: "The encoded itinerary could not be read. Ask the sender to create a new link.",
  },
  missing_payload: {
    title: "This share link is incomplete",
    body: "The link does not contain an itinerary. Ask the sender to copy the complete link.",
  },
  payload_too_large: {
    title: "This shared itinerary is too large",
    body: "The link exceeds the safe size supported by this planner.",
  },
  unsupported_version: {
    title: "This share link uses a newer format",
    body: "This planner cannot read that link version yet. Ask the sender for a compatible link.",
  },
}

const ShareErrorScreen: FC<{
  code: ShareErrorCode
  onOpenLocal: () => void
}> = ({ code, onOpenLocal }) => {
  const copy = SHARE_ERROR_COPY[code]

  return (
    <main className="grid min-h-svh place-items-center bg-[#f7f8f6] px-6 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-10 place-items-center bg-destructive/10 text-destructive">
          <Link2Off aria-hidden="true" className="size-5" />
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{copy.body}</p>
        <Button className="mt-5" onClick={onOpenLocal}>
          Open my itinerary
        </Button>
      </div>
    </main>
  )
}

const App: FC = () => {
  const [state, setState] = useState<AppState>({ status: "loading" })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    const route = parseShareHash(window.location.hash)

    if (route.kind === "error") {
      queueMicrotask(() => {
        if (active) setState({ status: "share-error", code: route.code })
      })
      return () => {
        active = false
      }
    }

    if (route.kind === "shared") {
      void import("@/features/sharing/codec").then(
        ({ decodeSharePayload }) => {
          if (!active) return

          const decoded = decodeSharePayload(route.payload)
          if (!decoded.success) {
            setState({ status: "share-error", code: decoded.code })
            return
          }

          void Promise.all([loadRouteData(), loadSharedItineraryPage()]).then(
            () =>
              active &&
              setState({ status: "shared", itinerary: decoded.itinerary }),
            () => active && setState({ status: "data-error" })
          )
        },
        () => active && setState({ status: "data-error" })
      )
    } else {
      void Promise.all([loadRouteData(), loadPlannerPage()]).then(
        () => active && setState({ status: "local" }),
        () => active && setState({ status: "data-error" })
      )
    }

    return () => {
      active = false
    }
  }, [attempt])

  useEffect(() => {
    const handleHashChange = () => {
      setState({ status: "loading" })
      setAttempt((value) => value + 1)
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const openLocal = () => {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`
    )
    setState({ status: "loading" })
    setAttempt((value) => value + 1)
  }

  if (state.status === "share-error") {
    return <ShareErrorScreen code={state.code} onOpenLocal={openLocal} />
  }

  if (state.status === "data-error") {
    return (
      <LoadingScreen
        error
        onRetry={() => {
          setState({ status: "loading" })
          setAttempt((value) => value + 1)
        }}
      />
    )
  }

  if (state.status === "loading") return <LoadingScreen />

  return (
    <Suspense fallback={<LoadingScreen />}>
      {state.status === "shared" ? (
        <SharedItineraryPage
          itinerary={state.itinerary}
          onOpenLocal={openLocal}
        />
      ) : (
        <PlannerPage />
      )}
    </Suspense>
  )
}

export default App
