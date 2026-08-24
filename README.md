# oneworld Global Explorer Planner

Plan a round-the-world Global Explorer itinerary, see the route on an
interactive globe, and catch common rule issues as you build.

This is an unofficial, independent planning tool. It is not affiliated with or
endorsed by oneworld or its member airlines.

## What you can do

- Build a trip flight by flight with eligible marketing and operating carriers.
- Search the included route network by airport and airline.
- Mark each arrival as a transfer or stopover.
- Include open jaws and count their surface distance toward the itinerary.
- See estimated mileage, remaining mileage, stopovers, segments, and region
  order at a glance.
- Compare a trip with the available 26,000, 29,000, 34,000, and 39,000-mile
  bands.
- View flight segments and airports on an interactive globe.
- Share a read-only itinerary snapshot with a link.
- Copy a shared itinerary into the local planner when you want to edit it.
- Undo and redo committed itinerary changes while you work.

## Plan an itinerary

1. Choose a cabin and let the planner select a mileage band automatically, or
   select a band yourself.
2. Add flights in travel order. Choose the marketing carrier, operating
   carrier, origin, destination, and whether the arrival is a transfer or
   stopover.
3. If two consecutive flights do not connect at the same airport, the planner
   treats the gap as an open jaw and includes it in the totals.
4. Follow the mileage summary, globe, and validation panel while adjusting the
   route.
5. Use **Share** when you want a portable backup or want someone else to review
   the itinerary. A recipient can explicitly choose **Copy and edit** to make a
   local editable copy.

Your current itinerary is saved automatically in this browser.

## Undo and redo changes

Use the history controls in the header, or press `Ctrl+Z` / `Cmd+Z` to undo
and `Ctrl+Shift+Z` / `Cmd+Shift+Z` to redo. `Ctrl+Y` also redoes a change on
Windows and Linux.

Adding, editing, or deleting a flight and changing plan settings each create a
history step. Copying a shared itinerary or starting a new itinerary can also
be undone as one step. Draft changes inside an editor are added to history only
when saved.

## Share an itinerary

Choose **Share** to create a `#/share/v1/…` link. The planner wraps the current
itinerary in a versioned envelope, encodes it as UTF-8, compresses it with
`fflate` using its default settings, and converts the result to Base64URL. The
encoded snapshot stays in the URL fragment, which browsers do not send in the
HTTP request.

Opening a share link displays the decoded snapshot in read-only mode and does
not replace the itinerary already saved in that browser. **Copy and edit** is
the explicit handoff into local storage. If a local plan already exists, the
confirmation dialog can copy its own share link first.

Share links are limited to 8,000 characters and decoded share data is limited
to 64 KiB. Invalid, damaged, oversized, and unsupported versions show an error
without loading the planner workspace.

Up to 100 changes are kept for the current browser tab. Reloading the page
keeps the automatically saved itinerary but clears its undo and redo history.

## Understand the validation status

- **Incomplete** means the itinerary still needs flights or another required
  part of the journey.
- **Invalid** means the planner found at least one route-derived rule conflict.
- **Valid** means the route passes the checks implemented by this planner. It
  does not guarantee that the itinerary can be priced, booked, or ticketed.

The planner checks eligible carriers and known routes, mileage-band and cabin
compatibility, segment limits, itinerary closure, Atlantic and Pacific
crossings, intercontinental direction, stopovers, regional entry and exit
limits, and open-jaw restrictions.

These checks are based on sections 4 and 8 of
[Global Explorer Rule 9701 dated 27 February 2026](https://assets.ctfassets.net/m9ph4qvas97u/2pqmhTK95sqIsn5UP02lz/a55a65324e4eff966e9d520216b6c307/Global_Explorer_27_FEB_26.pdf).

## Privacy and offline use

The planner runs entirely in your browser. Your itinerary is stored in browser
local storage and is not uploaded by the application. The route network and
globe are bundled with the app, so normal planning does not require a route or
map service.

Clearing browser data can remove a saved itinerary. Copy a share link if you
want a separate snapshot backup. Anyone with that link can read the embedded
itinerary, so treat it as access to the plan.

## Route coverage

Route suggestions come from a filtered snapshot of
[Jonty's airline route data](https://github.com/Jonty/airline-route-data). A
missing route may reflect incomplete or outdated source data; its absence does
not prove that a flight does not operate. Schedules and airline participation
can change, so verify every flight with the airline before booking.

## Machine-readable resources

Agent-capable browsers and other tools can discover the planner's purpose,
itinerary data model, current capabilities, and checked-in route network
through stable public resources:

- `/llms.txt` provides concise usage guidance and links to the other resources.
- `/schema.json` defines the itinerary JSON format and the public route-data
  format using JSON Schema Draft 2020-12.
- `/capabilities.json` describes the planner features, rule scope, and known
  limitations without claiming live booking capabilities.
- `/route-data.json` exposes the same airport and directed-route snapshot used
  by the planner in an expanded, field-named format.

The public route snapshot is generated alongside the compact browser snapshot
by `pnpm data:update`. Run `pnpm data:export-public` to rebuild only the public
snapshot from the current checked-in compact data without contacting upstream.
GitHub Actions repeats that export and fails when the committed public snapshot
is missing or out of date.

## Development

Use Node.js 20.19 or newer with the pinned pnpm version:

```sh
pnpm install
pnpm test
pnpm lint
pnpm build
```

`pnpm data:update` refreshes the checked-in compact route snapshot from the
configured upstream revision. The snapshot is emitted as a hashed static asset
and decoded in the browser; sharing dialogs, share decoding, and the interactive globe
remain in separate on-demand chunks.

## Important limitations

This planner does not determine:

- fares, taxes, or surcharges;
- live schedules, inventory, or booking-class availability;
- minimum connection times;
- current codeshare or ticketing agreements; or
- whether a carrier will price or issue the final itinerary.

Mileage figures are estimates. Always read the current official terms and
confirm the complete itinerary with the issuing carrier before making travel
arrangements.

## License

The application source is available under the [MIT License](LICENSE). Route
data is sourced separately and is subject to its upstream terms.
