import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { APP_CONFIG, MILEAGE_BANDS } from "@/config"
import compactRouteData from "@/data/generated/route-data.compact.json"
import {
  decodeRouteData,
  type CompactRouteDataSnapshot,
  type RouteDataSnapshot,
} from "@/features/route-data"

interface CapabilitiesDocument {
  capabilitiesVersion: number
  application: {
    name: string
    description: string
  }
  resources: Record<string, string>
  planning: {
    cabinClasses: string[]
    mileageBands: number[]
    arrivalTypes: string[]
  }
  validation: {
    officialTermsUrl: string
  }
}

interface SchemaDocument {
  properties: {
    schemaVersion: { const: number }
    cabinClass: { enum: string[] }
    mileageBand: { enum: Array<string | number> }
  }
  $defs: {
    flightSegment: {
      properties: {
        arrivalType: { enum: string[] }
      }
    }
    routeDataSnapshot: {
      properties: {
        schemaVersion: { const: number }
      }
    }
  }
}

interface PublicRouteDataSnapshot extends RouteDataSnapshot {
  schemaVersion: number
  metadata: RouteDataSnapshot["metadata"] & {
    airportCount: number
    routeCount: number
  }
}

const publicDirectory = path.resolve(import.meta.dirname, "../public")

const readPublicText = (filename: string) =>
  readFileSync(path.join(publicDirectory, filename), "utf8")

const readPublicJson = <Value>(filename: string): Value =>
  JSON.parse(readPublicText(filename)) as Value

describe("machine-readable public resources", () => {
  const capabilities = readPublicJson<CapabilitiesDocument>("capabilities.json")
  const schema = readPublicJson<SchemaDocument>("schema.json")

  it("keeps the public itinerary contract aligned with application config", () => {
    expect(schema.properties.schemaVersion.const).toBe(APP_CONFIG.schemaVersion)
    expect(schema.properties.cabinClass.enum).toEqual([
      "economy",
      "business",
      "first",
    ])
    expect(schema.properties.mileageBand.enum).toEqual([
      "auto",
      ...MILEAGE_BANDS,
    ])
    expect(schema.$defs.flightSegment.properties.arrivalType.enum).toEqual([
      "stopover",
      "transfer",
    ])
  })

  it("describes only the application's current public capabilities", () => {
    expect(capabilities.capabilitiesVersion).toBe(1)
    expect(capabilities.application.name).toBe(APP_CONFIG.name)
    expect(capabilities.application.description).toBe(APP_CONFIG.description)
    expect(capabilities.planning.cabinClasses).toEqual([
      "economy",
      "business",
      "first",
    ])
    expect(capabilities.planning.mileageBands).toEqual([...MILEAGE_BANDS])
    expect(capabilities.planning.arrivalTypes).toEqual(["transfer", "stopover"])
    expect(capabilities.validation.officialTermsUrl).toBe(
      APP_CONFIG.officialTermsUrl
    )
    expect(Object.values(capabilities.resources).sort()).toEqual(
      ["/llms.txt", "/route-data.json", "/schema.json"].sort()
    )
  })

  it("publishes the same expanded network used by the planner", () => {
    const decoded = decodeRouteData(
      compactRouteData as CompactRouteDataSnapshot
    )
    const publicRouteData =
      readPublicJson<PublicRouteDataSnapshot>("route-data.json")

    expect(publicRouteData.schemaVersion).toBe(1)
    expect(schema.$defs.routeDataSnapshot.properties.schemaVersion.const).toBe(
      publicRouteData.schemaVersion
    )
    expect(publicRouteData.metadata).toEqual({
      ...decoded.metadata,
      airportCount: decoded.airports.length,
      routeCount: decoded.routes.length,
    })
    expect(publicRouteData.airports).toEqual(decoded.airports)
    expect(publicRouteData.routes).toEqual(decoded.routes)
  })

  it("links every machine-readable resource from llms.txt", () => {
    const instructions = readPublicText("llms.txt")

    expect(instructions).toContain("# oneworld Global Explorer Planner")
    expect(instructions).toContain("/capabilities.json")
    expect(instructions).toContain("/schema.json")
    expect(instructions).toContain("/route-data.json")
    expect(instructions).toContain(APP_CONFIG.officialTermsUrl)
  })
})
