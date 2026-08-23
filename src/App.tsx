import { lazy, Suspense, useEffect, useState, type FC } from "react"

import { loadRouteData } from "@/features/route-data"

const loadPlannerPage = () => import("@/features/planner/pages/planner-page")
const PlannerPage = lazy(() =>
  loadPlannerPage().then((module) => ({ default: module.PlannerPage }))
)

type AppStatus = "loading" | "ready" | "error"

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

const App: FC = () => {
  const [status, setStatus] = useState<AppStatus>("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    void Promise.all([loadRouteData(), loadPlannerPage()]).then(
      () => active && setStatus("ready"),
      () => active && setStatus("error")
    )

    return () => {
      active = false
    }
  }, [attempt])

  if (status === "error") {
    return (
      <LoadingScreen
        error
        onRetry={() => {
          setStatus("loading")
          setAttempt((value) => value + 1)
        }}
      />
    )
  }

  if (status !== "ready") return <LoadingScreen />

  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlannerPage />
    </Suspense>
  )
}

export default App
