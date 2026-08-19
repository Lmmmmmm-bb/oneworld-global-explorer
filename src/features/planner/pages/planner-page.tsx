import type { FC } from "react"

import { AppHeader } from "@/components/app-header"

import { ItineraryEmptyState } from "../components/itinerary-empty-state"
import { PlannerAside } from "../components/planner-aside"
import { SummaryStrip } from "../components/summary-strip"

export const PlannerPage: FC = () => (
  <div className="min-h-svh bg-[#f7f8f6]">
    <AppHeader />
    <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mb-5">
        <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">
          Route workspace
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Plan the route. Check the rules.
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Build a Global Explorer itinerary with clear mileage and route
              validation as you go.
            </p>
          </div>
        </div>
      </div>
      <SummaryStrip />
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
        <ItineraryEmptyState />
        <PlannerAside />
      </div>
    </main>
    <footer className="mx-auto max-w-[1600px] px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
      Unofficial planning tool. Final eligibility is determined by oneworld and
      the ticketing carrier.
    </footer>
  </div>
)
