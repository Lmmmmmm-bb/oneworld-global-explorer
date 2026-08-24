import { describe, expect, it } from "vitest"

import { createEmptyItinerary } from "@/features/itinerary"

import { createShareUrl, MAX_SHARE_URL_LENGTH, parseShareHash } from "./url"

describe("share URL", () => {
  it("recognizes local, valid share, missing, and unsupported routes", () => {
    expect(parseShareHash("")).toEqual({ kind: "local" })
    expect(parseShareHash("#section")).toEqual({ kind: "local" })
    expect(parseShareHash("#/share/v1/payload")).toEqual({
      kind: "shared",
      payload: "payload",
    })
    expect(parseShareHash("#/share/v1/")).toEqual({
      kind: "error",
      code: "missing_payload",
    })
    expect(parseShareHash("#/share/v2/payload")).toEqual({
      kind: "error",
      code: "unsupported_version",
    })
  })

  it("builds a hash URL against the configured deployment base", () => {
    const result = createShareUrl(createEmptyItinerary(), {
      origin: "https://example.com",
      baseUrl: "/planner/",
    })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.url).toMatch(
      /^https:\/\/example\.com\/planner\/#\/share\/v1\/[A-Za-z0-9_-]+$/
    )
  })

  it("rejects generated URLs above the reliable sharing limit", () => {
    const result = createShareUrl(createEmptyItinerary(), {
      origin: `https://${"x".repeat(MAX_SHARE_URL_LENGTH)}.example.com`,
      baseUrl: "/",
    })

    expect(result).toEqual({ success: false, code: "url_too_long" })
  })
})
