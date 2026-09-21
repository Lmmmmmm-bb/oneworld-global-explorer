import { Plus } from "lucide-react"
import { Reveal } from "../motion/reveal.tsx"
import { PAGE_WIDTH } from "../layout/classes.ts"

const FAQ_ITEMS = [
  {
    title: "Is Global Explorer the same as oneworld Explorer?",
    body: (
      <>
        They’re different fare products. Global Explorer is distance-based;
        oneworld Explorer is based on the continents visited. This planner
        covers Global Explorer only. See{" "}
        <a
          href="https://www.oneworld.com/round-the-world"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          oneworld’s fare overview
        </a>{" "}
        for the distinction.
      </>
    ),
  },
  {
    title: "Does a valid route mean I can buy the ticket?",
    body: (
      <>
        No. It means the plan passes the route-derived checks implemented here.
        The planner does not check live schedules, seats, fares, booking
        classes, or whether a carrier will issue the ticket. Confirm the full
        journey with the issuing carrier.
      </>
    ),
  },
  {
    title: "What if a flight I want is missing?",
    body: (
      <>
        The route snapshot can be incomplete or outdated. A missing suggestion
        does not prove a flight does not operate. Check current schedules with
        the airline.
      </>
    ),
  },
  {
    title: "Where does my itinerary go?",
    body: (
      <>
        Your working plan stays in this browser. A share link contains a
        compressed snapshot in its URL. Anyone with the link can read that
        snapshot, so share it with people you choose.
      </>
    ),
  },
  {
    title: "Do I need an account to start?",
    body: (
      <>
        No account is needed. Open the planner and start building your route.
        Your working itinerary is stored in this browser; save a share link if
        you want to keep a snapshot or open it on another device.
      </>
    ),
  },
]

export const FaqSection = () => (
  <section id="questions" className="faq-section">
    <div
      className={`${PAGE_WIDTH} grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20`}
    >
      <Reveal>
        <p className="guide-eyebrow">A FEW THINGS BEFORE YOU GO</p>
        <h2 className="guide-section-title mt-6">
          Good questions.
          <br />
          <span className="text-guide-muted">Clear answers.</span>
        </h2>
        <p className="text-guide-muted mt-6 max-w-xs text-base leading-[1.8]">
          The small details that make a big journey easier to plan.
        </p>
      </Reveal>
      <div className="faq-list">
        {FAQ_ITEMS.map((item) => (
          <details className="faq-item" key={item.title}>
            <summary>
              <h3>{item.title}</h3>
              <Plus className="faq-plus size-4 shrink-0" aria-hidden="true" />
            </summary>
            <div className="faq-answer">
              <p>{item.body}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  </section>
)
