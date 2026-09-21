import type { FC } from "react"

import { GuideFooter } from "./components/guide-footer.tsx"
import { GuideHeader } from "./components/guide-header.tsx"
import { ExampleRoute } from "./sections/example-route.tsx"
import { FaqSection } from "./sections/faq-section.tsx"
import { FinalCallToAction } from "./sections/final-call-to-action.tsx"
import { HeroSection } from "./sections/hero-section.tsx"
import { HowItWorks } from "./sections/how-it-works.tsx"
import { PlannerChecks } from "./sections/planner-checks.tsx"
import { ScopeStrip } from "./sections/scope-strip.tsx"

export const GuideApp: FC = () => (
  <>
    <GuideHeader />
    <main>
      <HeroSection />
      <ScopeStrip />
      <HowItWorks />
      <PlannerChecks />
      <ExampleRoute />
      <FaqSection />
      <FinalCallToAction />
    </main>
    <GuideFooter />
  </>
)
