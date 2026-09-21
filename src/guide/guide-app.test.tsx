import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GuideApp } from "./guide-app"
import { JOURNEY_STEPS } from "./sections/journey-workbench/stages"
import { JourneyDemo } from "./sections/journey-workbench/demo/journey-demo"
import { JourneyLedger } from "./sections/example-journey/journey-ledger"

describe("Flightpath prerender and accessible scenes", () => {
  it("renders readable content and unique IDs without browser globals", () => {
    const html = renderToString(<GuideApp />)
    expect(html).toContain('data-presentation="flow"')
    expect(html).toContain('id="guide-main" tabindex="-1"')
    for (const step of JOURNEY_STEPS) expect(html).toContain(step.title)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    const ids = Array.from(
      html.matchAll(/\sid="([^"]+)"/g),
      (match) => match[1]
    )
    expect(new Set(ids).size).toBe(ids.length)
    expect(html.match(/class="demo-copy"/g)).toHaveLength(1)
    expect(html.match(/data-playback="draw"/g)).toHaveLength(1)
    expect(html.match(/data-playback="static"/g)).toHaveLength(1)
  })
  it("keeps inactive panels inert and preserves a single static map", () => {
    const html = renderToString(
      <JourneyDemo stage="check" prefix="test" presentation="cinematic" />
    )
    expect(html.match(/role="tabpanel"/g)).toHaveLength(3)
    expect(html.match(/inert=""/g)).toHaveLength(2)
    expect(html.match(/aria-hidden="true" inert/g)).toHaveLength(2)
    expect(html.match(/data-playback="static"/g)).toHaveLength(1)
  })
  it("exposes all three steps in flow mode", () => {
    const html = renderToString(
      <JourneyDemo stage="build" prefix="flow" presentation="flow" />
    )
    expect(html).toContain("British Airways")
    expect(html).toContain('role="meter"')
    expect(html).toContain("Copy example link")
    expect(html).not.toContain('inert=""')
  })
  it("renders five stops and four real leg controls", () => {
    const html = renderToString(<JourneyLedger />)
    expect(html.match(/class="ledger-airport"/g)).toHaveLength(5)
    expect(html.match(/class="ledger-leg"/g)).toHaveLength(4)
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1)
    expect(html).toContain("7,424")
    expect(html).toContain("Return")
  })
})
