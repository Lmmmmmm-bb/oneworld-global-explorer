import { execFile } from "node:child_process"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { promisify } from "node:util"

import { ELIGIBLE_CARRIER_CODES, ROUTE_SOURCE } from "./config.mjs"
import { transformRouteData } from "./transform.mjs"

const OUTPUT_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../src/data/generated"
)
const OUTPUT_FILE = path.join(OUTPUT_DIRECTORY, "route-data.json")
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

await mkdir(OUTPUT_DIRECTORY, { recursive: true })
await writeFile(OUTPUT_FILE, `${JSON.stringify(snapshot)}\n`, "utf8")

console.info(
  `Wrote ${snapshot.airports.length} airports and ${snapshot.routes.length} routes from ${sourceCommit.slice(0, 12)}.`
)
