import { ArrowDown, ArrowUpRight } from "lucide-react"
import { PrimaryLink } from "../../components/primary-link.tsx"
import {
  EXAMPLE_ROUTE_URL,
  JOURNEY_ROUTE_LABEL,
  JOURNEY_MILES,
} from "../../data/journey.ts"
import { formatMiles } from "../../../utils.ts"
import { HeroAtlas } from "./hero-atlas.tsx"

export const HeroSection = () => (
  <section className="flightpath-hero guide-dark" aria-labelledby="hero-title">
    <div className="guide-container">
      <div className="hero-copy">
        <p className="guide-eyebrow">
          <span className="signal-dot" /> Global Explorer route planner
        </p>
        <h1 id="hero-title">
          The world.
          <br />
          <span>Connected by you.</span>
        </h1>
        <p className="hero-description">
          Plan your oneworld Global Explorer journey with routes, estimated
          miles, and planning checks in view.
        </p>
        <div className="hero-actions">
          <PrimaryLink href="/" light>
            Start planning <ArrowUpRight size={16} aria-hidden="true" />
          </PrimaryLink>
          <a className="guide-secondary-link" href={EXAMPLE_ROUTE_URL}>
            Open example <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
        <p className="hero-note">
          No account needed. An independent planning tool.
        </p>
      </div>
      <HeroAtlas />
      <div className="hero-route-index">
        <span className="guide-eyebrow">Example route</span>
        <p>{JOURNEY_ROUTE_LABEL}</p>
        <span>
          {formatMiles(JOURNEY_MILES)}{" "}
          <span className="hero-unit">estimated mi</span>
        </span>
        <a href="#how-it-works" aria-label="See how the planner works">
          <ArrowDown size={18} aria-hidden="true" />
        </a>
      </div>
    </div>
  </section>
)
