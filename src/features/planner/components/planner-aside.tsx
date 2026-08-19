import type { FC } from "react"

import { RouteMap } from "./route-map"
import { ValidationPanel } from "./validation-panel"

export const PlannerAside: FC = () => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
    <RouteMap />
    <ValidationPanel />
  </aside>
)
