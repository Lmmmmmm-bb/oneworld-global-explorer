import type { FC, ReactNode } from "react"

import { SectionHeading } from "../components/section-heading.tsx"
import { PAGE_WIDTH } from "../styles.ts"

const TERMS_URL =
  "https://assets.ctfassets.net/m9ph4qvas97u/2pqmhTK95sqIsn5UP02lz/a55a65324e4eff966e9d520216b6c307/Global_Explorer_27_FEB_26.pdf"

const FAQ_ITEMS: ReadonlyArray<{ title: string; body: ReactNode }> = [
  {
    title: "Does “Route valid” mean I can buy this ticket?",
    body: (
      <>
        No. It means the plan passes the route-derived checks implemented here.
        The planner does not check live schedules, seats, fares, booking
        classes, or whether a carrier will issue the ticket.
      </>
    ),
  },
  {
    title: "Is this the same as oneworld Explorer?",
    body: (
      <>
        No. Global Explorer uses a distance-based fare. The separate oneworld
        Explorer fare is based on the continents visited. This tool covers
        Global Explorer only. See{" "}
        <a
          className="text-guide-green-dark underline underline-offset-3"
          href="https://www.oneworld.com/round-the-world"
          rel="noopener noreferrer"
          target="_blank"
        >
          oneworld&apos;s fare overview
        </a>{" "}
        for the product distinction.
      </>
    ),
  },
  {
    title: "What if a flight is missing?",
    body: (
      <>
        The route snapshot can be incomplete or outdated. A missing suggestion
        does not prove a flight does not operate; check current schedules with
        the airline.
      </>
    ),
  },
  {
    title: "Where does my itinerary go?",
    body: (
      <>
        Your working plan stays in this browser. A share link contains a
        compressed snapshot in the URL; anyone with that link can read the
        snapshot.
      </>
    ),
  },
]

export const FaqSection: FC = () => (
  <section className="border-guide-line border-t bg-white py-[72px] sm:py-[100px]">
    <div className={PAGE_WIDTH}>
      <SectionHeading
        eyebrowText="BEFORE YOU RELY ON A ROUTE"
        title="Know what the status means."
      />
      <div className="mt-10 grid sm:grid-cols-2 sm:gap-x-[70px]">
        {FAQ_ITEMS.map((item) => (
          <article
            className="border-guide-line border-t py-6 sm:pb-7"
            key={item.title}
          >
            <h3 className="text-base font-semibold tracking-[-0.025em]">
              {item.title}
            </h3>
            <p className="text-guide-muted mt-2.5 mb-0 text-[13px] leading-[1.7]">
              {item.body}
            </p>
          </article>
        ))}
      </div>
      <p className="text-guide-muted mt-8 mb-0 max-w-[900px] text-xs leading-[1.7]">
        Use the{" "}
        <a
          className="text-guide-green-dark underline underline-offset-3"
          href={TERMS_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          published Global Explorer terms
        </a>{" "}
        and confirm the full journey with the issuing carrier before making
        travel arrangements.
      </p>
    </div>
  </section>
)
