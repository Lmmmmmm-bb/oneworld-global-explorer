import { MotionConfig } from "motion/react"
import { GuideFooter } from "./layout/guide-footer.tsx"
import { GuideHeader } from "./layout/guide-header.tsx"
import { ExampleJourney } from "./sections/example-journey/example-journey.tsx"
import { FaqSection } from "./sections/faq-section.tsx"
import { FinalCallToAction } from "./sections/final-call-to-action.tsx"
import { HeroSection } from "./sections/hero/hero-section.tsx"
import { JourneyWorkbench } from "./sections/journey-workbench/journey-workbench.tsx"
import { PlannerChecks } from "./sections/planner-checks.tsx"

export const GuideApp = () => (
  <MotionConfig reducedMotion="user">
    <GuideHeader />
    <main id="guide-main" tabIndex={-1} className="outline-none">
      <HeroSection />
      <JourneyWorkbench />
      <ExampleJourney />
      <PlannerChecks />
      <FaqSection />
      <FinalCallToAction />
    </main>
    <GuideFooter />
  </MotionConfig>
)
