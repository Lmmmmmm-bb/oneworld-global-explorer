# Guide / Flightpath

Independent React + TypeScript + Tailwind entry at `/guide/`, prerendered by
`vite.config.ts`. It reuses the project's technical stack, not the planner's
feature components, stores, or runtime route database. Motion is a progressive
enhancement; the production HTML contains every section before hydration.

## Structure and ownership

```text
guide-app.tsx                 Page composition only
main.tsx / guide.css          Independent client and stylesheet entry points
layout/                      Header, footer, and shared layout classes
components/                  Controls actually shared by sections
sections/
  hero/                      Hero content and atlas playback/parallax wiring
  journey-workbench/         Layout eligibility, stage state, and accessible tabs
    demo/                    One map + three persistent content panels
  example-journey/           Example summary and selectable five-stop ledger
  *.tsx                      Checks, native FAQ, closing call to action
visuals/route-atlas/          Atlas model, SVG layers, and playback lifecycle
motion/                      Shared pacing, reveals, and motion preference
data/                        Single example itinerary and share URL
lib/                         Pure geographic projection and stroke timing
styles/                      Tokens, base, layout, and section-specific CSS
```

Keep section-specific code with its section. Promote a component only when
another section needs it. Tests sit beside the code they exercise. No production
guide module imports planner components or its route database; tests alone use
the full snapshot and rule validator. Hero, workbench, and ledger share journey
facts but do not share interaction state.

- `data/` and `lib/` have no dependency on React, sections, or browser APIs.
- `atlas-model.ts` derives geometry and timeline once; SVG layers only render.
- `use-route-playback.ts` owns the viewport trigger and playback lifecycle.
- `use-workbench-layout.ts` measures the space needed for enhancement.
- `stage-progress.ts` and `stage-state.ts` are independently tested pure logic.
- `use-journey-stage.ts` connects browser events, stage state, and focus recovery.
- `JourneyDemo` presents its given mode and stage; it does not listen to scrolling.
- Share/copy state and ledger selection remain local to their owning components.

`styles/tokens.css` owns fonts and the Night/Paper/Signal/Pine palette.
Each section stylesheet owns its responsive rules. The planner excludes the
guide from Tailwind scanning, so guide-only utilities do not enlarge its CSS.

## Motion and static rendering

The hero has the only animated map. Its five continuous projected pieces
(representing four flights) share a four-second, constant-speed clock.
`createRouteTimeline()` schedules pieces by projected length and derives
arrival times; strokes and airport highlights consume the same elapsed value.
Keep the two sides of the date line separate: SVG dash patterns restart at each
subpath and would otherwise draw both Pacific pieces together.

The route starts once at 20% visibility, then remains complete. Leaving the
viewport completely, hiding the document during playback, or enabling reduced
motion finishes it. Cleanup stops animations and disconnects observers. The
whole geographic layer has a small desktop-only parallax offset; labels, map,
and route move together. The workbench map and closing curve stay static.

The motion preference is `unknown | allow | reduce`, with `unknown` as the
stable server snapshot. Unknown does not enable layout enhancement. The hero's
foreground stroke starts hidden so hydration cannot flash a complete route.
Reduced-motion CSS and the `noscript` fallback in `guide/index.html` reveal
the complete route. Other text, links, and content are never hidden pending JS.
The no-script fallback also hides the copy button.

Mileage is readable in the prerendered HTML; its visual bar plays once when the
check panel becomes active and visible. It finishes if interrupted and does
not reset on stage changes or resize. Reveals are subtle and never start at
zero opacity.

## One workbench, two presentations

There is one map and one instance of each Build / Check / Share panel at every
breakpoint. The same SharePreview retains its state during layout changes.

Cinematic presentation requires all of:

- Width >= 1024px, height >= 800px, and motion preference `allow`.
- The measured heading + common demo chrome + tallest panel fit below the
  actual header, with a bottom margin and an entry safety margin.
- Initial enhancement happens before the workbench is already being read.
  Direct section anchors, restored mid-page positions, and focus within the
  section start in ordinary flow instead.

ResizeObserver watches the actual content, so font/content resizing can remove
enhancement. Narrow, short, reduced-motion, and server-rendered views show three
ordinary sections in reading order. The cinematic scroll distance is derived
from the available viewport, not a hard-coded multi-screen section.

In cinematic mode all panels share a grid cell and reserve the tallest height.
Inactive panels are hidden, inert, and excluded from the accessibility tree.
Arrow keys, Home, and End operate a roving tab stop. Clicking a tab preserves
the choice until the scroll chapter changes. Keyboard or panel focus locks the
active chapter; scrolling resumes control only after that focus is released.
Crossing to flow preserves focus on persistent controls; a disappearing tab
transfers focus to its corresponding step heading. Enhancement cannot hide a
focused flow panel. No wheel interception, forced snapping, or scroll library.

## Example facts and controls

`data/journey.ts` drives airport markers, route arcs, flight rows, mileage, and
the read-only example URL. Mileage uses the planner's `haversineMiles` helper.
Tests compare the decoded share link and advertised checks with the checked-in
route snapshot and real validator. If the snapshot changes, update the example
deliberately; do not import it into the guide client bundle.

The ledger derives five stops from four flights, including the return to SFO.
Native buttons support pointer preview, keyboard focus, and committed selection.
Hover alone does not change selection or announce live updates. FAQ uses native
`details`. Copy feedback uses a live status and retains a usable example link
when the Clipboard API fails. None of these actions edits a planner itinerary.

## Verification

Run `pnpm build`, `pnpm test`, and `pnpm lint`. Inspect the production preview,
not just the development server: production hydrates the prerendered HTML.
In development, `main.tsx` checks `childElementCount` to distinguish a real
prerendered tree from the build-time placeholder comment.

Automated coverage includes example facts, date-line geometry, sequential
stroke timing and arrivals, stage boundaries/hysteresis, keyboard navigation
mapping, manual/focus ownership, server rendering, unique IDs, one copy action,
and inert cinematic panels.

Browser regression checklist:

- Check 1440×900; low-height 1280×720 and 1024×700; 768px tablet; 390/320px phone.
- Verify route starts with only one moving piece, finishes once, and has no flash.
- Choose tabs, use arrow/Home/End keys, scroll while focused, then resize.
- Confirm fixed demo height, preserved copy state, and no hidden focus targets.
- Select each ledger leg, open FAQ, follow an example link, and test copy failure.
- Check reduced-motion and no-JS fallbacks; content and links must remain usable.
- Check 200% zoom and a real OS reduced-motion setting before release.

Implementation verification on 2026-09-21: production build, typecheck, ESLint,
and 101 automated tests passed. In-app browser checks covered desktop, tablet,
phone, low-height layouts, copy success/failure, native FAQ, and focus recovery.
Reduced-motion JS behavior was exercised through a local matchMedia override;
static fallback was checked with scripts blocked and the noscript CSS applied.
These simulations do not replace a real OS preference / JavaScript-disabled
browser check. Browser zoom was not changed during this run.

## Atlas attribution

`public/guide-assets/world-land.svg` is a static equirectangular projection of
[world-atlas 2.0.2 land-110m](https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json),
derived from public-domain Natural Earth 1:110m land. Antarctica is omitted.
Coordinates map longitude -180..180 and latitude 83..-60 to a 1000×440 viewBox.
SVG masks share this cacheable asset without duplicating geometry in the HTML.
Flight arcs are illustrative great circles, not filed flight paths.

world-atlas is distributed under the ISC license. Its notice is included in
`public/licenses/world-atlas.txt`, so attribution accompanies the built site.
