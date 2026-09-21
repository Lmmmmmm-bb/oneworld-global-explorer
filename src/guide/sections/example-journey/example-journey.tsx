import { ArrowUpRight } from "lucide-react"
import { PrimaryLink } from "../../components/primary-link.tsx"
import {
  EXAMPLE_ROUTE_URL,
  JOURNEY_BAND,
  JOURNEY_MILES,
} from "../../data/journey.ts"
import { formatMiles } from "../../../utils.ts"
import { JourneyLedger } from "./journey-ledger.tsx"

export const ExampleJourney = () => (
  <section
    id="example"
    className="example-journey guide-container"
    aria-labelledby="example-title"
  >
    <div className="example-heading">
      <div>
        <p className="guide-eyebrow">A complete example</p>
        <h2 id="example-title" className="guide-section-title">
          Four flights.
          <br />
          One complete journey.
        </h2>
      </div>
      <p>
        San Francisco, London, Tokyo, Sydney — and home again. A little
        inspiration for your own way around the world.
      </p>
    </div>
    <JourneyLedger />
    <div className="example-summary">
      <dl>
        <div>
          <dt>Estimated distance</dt>
          <dd>
            {formatMiles(JOURNEY_MILES)} <span>mi</span>
          </dd>
        </div>
        <div>
          <dt>Mileage band</dt>
          <dd>
            {formatMiles(JOURNEY_BAND)} <span>mi</span>
          </dd>
        </div>
      </dl>
      <PrimaryLink href={EXAMPLE_ROUTE_URL}>
        Open this itinerary <ArrowUpRight size={16} aria-hidden="true" />
      </PrimaryLink>
    </div>
    <p className="example-disclaimer">
      A planning example, not a fare quote. Availability is not confirmed.
    </p>
  </section>
)
