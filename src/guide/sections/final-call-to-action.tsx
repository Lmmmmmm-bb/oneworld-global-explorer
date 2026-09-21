import { ArrowUpRight } from "lucide-react"
import { PrimaryLink } from "../components/primary-link.tsx"

export const FinalCallToAction = () => (
  <section className="final-journey guide-dark" aria-labelledby="final-title">
    <div className="guide-container">
      <p className="guide-eyebrow">Your next point of departure</p>
      <h2 id="final-title">
        Where will
        <br />
        you begin?
      </h2>
      <p className="final-description">
        Start with one place.
        <br />
        Build the rest of the journey from there.
      </p>
      <PrimaryLink href="/" light>
        Start planning <ArrowUpRight size={16} aria-hidden="true" />
      </PrimaryLink>
      <p className="final-note">No account needed.</p>
    </div>
    <svg
      className="closing-route"
      viewBox="0 0 1440 240"
      fill="none"
      aria-hidden="true"
    >
      <path d="M-20 210C260 210 205 20 440 60S780 235 1020 145 1280 40 1460 65" />
      <circle cx="440" cy="60" r="5" />
      <circle cx="1020" cy="145" r="5" />
    </svg>
  </section>
)
