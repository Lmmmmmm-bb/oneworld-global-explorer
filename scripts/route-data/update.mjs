import { execFile } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

import { ELIGIBLE_CARRIER_CODES, ROUTE_SOURCE } from "./config.mjs"
import {
  compactRouteData,
  createPublicRouteData,
  transformRouteData,
} from "./transform.mjs"

const OUTPUT_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../src/data/generated"
)
const OUTPUT_FILE = path.join(OUTPUT_DIRECTORY, "route-data.compact.json")
const PUBLIC_OUTPUT_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../public"
)
const PUBLIC_OUTPUT_FILE = path.join(PUBLIC_OUTPUT_DIRECTORY, "route-data.json")
const execFileAsync = promisify(execFile)

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { "User-Agent": "global-explorer-planner-data-updater" },
  })

  if (!response.ok) {
    throw new Error(`Route data request failed (${response.status}): ${url}`)
  }

  return response.json()
}

const { stdout: remoteHead } = await execFileAsync("git", [
  "ls-remote",
  `${ROUTE_SOURCE.repository}.git`,
  "HEAD",
])
const sourceCommit = remoteHead.trim().split(/\s+/)[0]

if (typeof sourceCommit !== "string" || sourceCommit.length !== 40) {
  throw new Error("The route source did not return a valid commit SHA.")
}

const rawAirports = await fetchJson(ROUTE_SOURCE.rawAtCommit(sourceCommit))
const snapshot = transformRouteData({
  rawAirports,
  eligibleCarrierCodes: ELIGIBLE_CARRIER_CODES,
  sourceCommit,
  sourceRepository: ROUTE_SOURCE.repository,
})
const compactSnapshot = compactRouteData(snapshot)
const publicSnapshot = createPublicRouteData(snapshot)

await Promise.all([
  mkdir(OUTPUT_DIRECTORY, { recursive: true }),
  mkdir(PUBLIC_OUTPUT_DIRECTORY, { recursive: true }),
])
await Promise.all([
  writeFile(OUTPUT_FILE, `${JSON.stringify(compactSnapshot)}\n`, "utf8"),
  writeFile(PUBLIC_OUTPUT_FILE, `${JSON.stringify(publicSnapshot)}\n`, "utf8"),
])

console.info(
  `Wrote ${snapshot.airports.length} airports and ${snapshot.routes.length} routes from ${sourceCommit.slice(0, 12)}.`
)
