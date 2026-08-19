import { describe, expect, it } from "vitest"

import { APP_CONFIG, MILEAGE_BANDS } from "./config"

describe("application configuration", () => {
  it("exposes the four Global Explorer mileage bands", () => {
    expect(MILEAGE_BANDS).toEqual([26_000, 29_000, 34_000, 39_000])
  })

  it("uses a stable first JSON schema version", () => {
    expect(APP_CONFIG.schemaVersion).toBe(1)
  })
})
