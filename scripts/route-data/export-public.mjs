import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { createPublicRouteData, expandCompactRouteData } from "./transform.mjs"

const INPUT_FILE = path.resolve(
  import.meta.dirname,
  "../../src/data/generated/route-data.compact.json"
)
const OUTPUT_FILE = path.resolve(
  import.meta.dirname,
  "../../public/route-data.json"
)

const compactSnapshot = JSON.parse(await readFile(INPUT_FILE, "utf8"))
const publicSnapshot = createPublicRouteData(
  expandCompactRouteData(compactSnapshot)
)

await writeFile(OUTPUT_FILE, `${JSON.stringify(publicSnapshot)}\n`, "utf8")

console.info(
  `Wrote ${publicSnapshot.metadata.airportCount} airports and ${publicSnapshot.metadata.routeCount} directed routes to public/route-data.json.`
)
