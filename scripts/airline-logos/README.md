# Airline logos

The `update.mjs` script extracts the 21 marketing-carrier logos used by the
planner from the `airlogos` package into `public/airlines`.

Run `pnpm assets:airlines` after updating `airlogos` or changing the supported
carrier list. The application serves these local PNG files instead of bundling
the package's complete Base64 catalog into the browser JavaScript.

Airline names and logos are trademarks of their respective owners.
