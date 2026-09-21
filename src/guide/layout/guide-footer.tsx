import { ArrowUpRight, Globe2 } from "lucide-react"

export const GuideFooter = () => (
  <footer className="guide-footer guide-dark">
    <div className="guide-container guide-footer-content">
      <div>
        <a className="guide-brand" href="/">
          <Globe2 size={20} aria-hidden="true" />
          Global Explorer Planner
        </a>
        <p>
          An independent, unofficial planning tool. Not affiliated with
          oneworld.
          <br />
          Final eligibility is determined by oneworld and the ticketing carrier.
        </p>
      </div>
      <nav aria-label="Footer">
        <a href="/">Planner</a>
        <a href="#guide-main">Back to top ↑</a>
        <a
          href="https://github.com/Lmmmmmm-bb/oneworld-global-explorer"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </nav>
    </div>
  </footer>
)
