import type { FC, ReactNode } from "react"

import { ValidationPanel } from "./validation-panel"

interface PlannerAsideProps {
  routeMap: ReactNode
}

export const PlannerAside: FC<PlannerAsideProps> = ({ routeMap }) => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
    {routeMap}
    <ValidationPanel />
  </aside>
)
