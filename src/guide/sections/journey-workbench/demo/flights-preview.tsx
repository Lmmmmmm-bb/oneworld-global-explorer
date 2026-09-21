import { ArrowRight } from "lucide-react"
import { formatMiles } from "../../../../utils.ts"
import { JOURNEY_LEGS } from "../../../data/journey.ts"

export const FlightsPreview = () => (
  <div className="demo-flights">
    <div className="demo-caption">
      <span>Your connections</span>
      <span>{String(JOURNEY_LEGS.length).padStart(2, "0")} flights</span>
    </div>
    <ol className="demo-flight-list">
      {JOURNEY_LEGS.map((leg, index) => (
        <li className="demo-flight" key={leg.from.iata}>
          <span className="demo-flight-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="demo-flight-route">
            <span className="demo-airport">{leg.from.iata}</span>
            <ArrowRight
              aria-hidden="true"
              className="text-guide-muted size-3"
            />
            <span className="demo-airport">{leg.to.iata}</span>
          </span>
          <span className="demo-carrier">{leg.carrier.name}</span>
          <span className="demo-miles">
            {formatMiles(leg.miles)} <span>mi</span>
          </span>
        </li>
      ))}
    </ol>
  </div>
)
