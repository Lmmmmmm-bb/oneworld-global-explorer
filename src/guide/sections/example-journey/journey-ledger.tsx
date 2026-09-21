import { useId, useState } from "react"
import { ArrowRight } from "lucide-react"
import { JOURNEY_LEGS } from "../../data/journey.ts"
import { formatMiles } from "../../../utils.ts"

const stops = [JOURNEY_LEGS[0].from, ...JOURNEY_LEGS.map(({ to }) => to)]
export const JourneyLedger = () => {
  const id = useId()
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState<number | null>(null)
  const [focused, setFocused] = useState<number | null>(null)
  const preview = focused ?? hovered ?? selected
  const leg = JOURNEY_LEGS[preview]
  return (
    <div className="journey-ledger">
      <ol className="ledger-stops">
        {stops.map((airport, index) => (
          <li
            key={`${index}-${airport.iata}`}
            data-active={preview === index || preview + 1 === index}
          >
            <div className="ledger-airport">
              <span className="ledger-dot" aria-hidden="true" />
              <span className="ledger-stop-label">
                {index === 0
                  ? "Depart"
                  : index === stops.length - 1
                    ? "Return"
                    : `Stop 0${index}`}
              </span>
              <strong>{airport.iata}</strong>
              <span>{airport.city}</span>
            </div>
            {JOURNEY_LEGS[index] && (
              <button
                type="button"
                className="ledger-leg"
                aria-pressed={selected === index}
                aria-controls={id}
                aria-label={`Select ${airport.iata} to ${JOURNEY_LEGS[index].to.iata}, ${JOURNEY_LEGS[index].carrier.name}`}
                data-preview={preview === index}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setHovered(index)
                }}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setFocused(index)}
                onBlur={() => setFocused(null)}
                onClick={() => setSelected(index)}
              >
                <span>{JOURNEY_LEGS[index].carrier.name}</span>
                <span>
                  {formatMiles(JOURNEY_LEGS[index].miles)} mi{" "}
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </button>
            )}
          </li>
        ))}
      </ol>
      <div className="ledger-details" id={id}>
        <span className="ledger-detail-label">
          LEG {String(preview + 1).padStart(2, "0")} /{" "}
          {String(JOURNEY_LEGS.length).padStart(2, "0")}
        </span>
        <p>
          {leg.from.city} <ArrowRight size={16} aria-hidden="true" />{" "}
          {leg.to.city}
        </p>
        <span>
          {leg.carrier.name} · {formatMiles(leg.miles)} estimated mi
        </span>
      </div>
    </div>
  )
}
