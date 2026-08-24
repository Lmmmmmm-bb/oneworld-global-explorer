import type { FC, ReactNode } from "react"

import type { ItineraryValidation } from "@/features/itinerary"

import { ValidationPanel } from "./validation-panel"

interface PlannerAsideProps {
  routeMap: ReactNode
  validation: ItineraryValidation
}

export const PlannerAside: FC<PlannerAsideProps> = ({
  routeMap,
  validation,
}) => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
    {routeMap}
    <ValidationPanel validation={validation} />
  </aside>
)
