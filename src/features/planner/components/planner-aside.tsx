import type { FC } from "react"

import { RouteMapPlaceholder } from "./route-map-placeholder"
import { ValidationPanel } from "./validation-panel"

export const PlannerAside: FC = () => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
    <RouteMapPlaceholder />
    <ValidationPanel />
  </aside>
)
