import { ArrowUpRight, Globe2 } from "lucide-react"
import { motion, useScroll } from "motion/react"

export const GuideHeader = () => {
  const { scrollYProgress } = useScroll({ trackContentSize: true })
  return (
    <header className="guide-header guide-dark">
      <a className="guide-skip-link" href="#guide-main">
        Skip to content
      </a>
      <div className="guide-container guide-header-content">
        <a
          className="guide-brand"
          href="/"
          aria-label="Global Explorer Planner home"
        >
          <Globe2 aria-hidden="true" size={23} />
          <span>Global Explorer</span>
          <span className="guide-brand-label">Guide</span>
        </a>
        <nav aria-label="Guide navigation">
          <a className="guide-nav-section" href="#how-it-works">
            How it works
          </a>
          <a className="guide-nav-section" href="#example">
            Example journey
          </a>
          <a className="guide-nav-section" href="#questions">
            Good to know
          </a>
          <a className="guide-nav-cta" href="/">
            Open planner <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </div>
      <motion.div
        aria-hidden="true"
        className="guide-reading-progress"
        style={{ scaleX: scrollYProgress }}
      />
    </header>
  )
}
