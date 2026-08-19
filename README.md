# Global Explorer Planner

An unofficial, offline-first planning and validation tool for oneworld Global
Explorer itineraries.

## Local development

```bash
pnpm install
pnpm dev
```

Run the verification suite with `pnpm build`, `pnpm test`, and `pnpm lint`.

The planner is a pure front-end application. Route data is checked into the
repository so normal installs and builds do not require a route-data API.

## Route data

Run `pnpm data:update` explicitly to refresh the filtered snapshot from
[Jonty's airline route data](https://github.com/Jonty/airline-route-data). The
snapshot records the exact source commit and includes only routes attributed to
the Global Explorer carrier allowlist.

The upstream repository does not currently publish a license. Confirm the
appropriate data rights before publicly or commercially distributing a build.

## Validation scope

The rule engine implements itinerary-derived checks from sections 4 and 8 of
[Global Explorer Rule 9701 (27 February 2026)](https://assets.ctfassets.net/m9ph4qvas97u/2pqmhTK95sqIsn5UP02lz/a55a65324e4eff966e9d520216b6c307/Global_Explorer_27_FEB_26.pdf).
It deliberately does not determine pricing, inventory, booking-class
availability, ticketing agreements, or whether a carrier will issue a ticket.

## Optional route map

Copy `.env.example` to `.env.local` and set `VITE_MAPTILER_KEY` to enable the
read-only MapLibre overview. MapTiler is the app's only runtime network
dependency; restrict the public browser key to the domains that serve the app.
All planner and validation features continue to work when the map is not
configured or cannot load.

## Follow-up ideas

- Add full operation history with multi-step undo and redo.
- Evaluate [cobe](https://github.com/shuding/cobe) as an optional 3D globe
  preview without replacing the simple default map.
