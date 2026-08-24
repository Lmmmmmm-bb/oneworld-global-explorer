import { strToU8, zlibSync } from "fflate"
import { describe, expect, it } from "vitest"

import { createEmptyItinerary, createFlightSegment } from "@/features/itinerary"

import {
  decodeSharePayload,
  encodeSharePayload,
  MAX_SHARE_JSON_BYTES,
} from "./codec"

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}

const encodeUnknown = (value: unknown): string =>
  bytesToBase64Url(zlibSync(strToU8(JSON.stringify(value))))

describe("share payload codec", () => {
  it("keeps the v1 empty-itinerary fixture stable with fflate defaults", () => {
    expect(encodeSharePayload(createEmptyItinerary())).toEqual({
      success: true,
      payload:
        "eJwdzLEOAiEQhOF32ZrGllI7GzstjMUIe8dGWAysGnO5dxevncz3L_Qmv3P0EI3kSUyUG9qXHEUYyC_UQ-KCM7cuVbdzwF30kNH7IByq1vIHRTJj5j22FF5Wx8gaL2Lp9GQ94kN-Qu7saMoyJxv-elvXH4s1LSU",
    })
  })

  it("round-trips an itinerary through the versioned compressed envelope", () => {
    const itinerary = {
      ...createEmptyItinerary(),
      cabinClass: "business" as const,
      flights: [
        createFlightSegment({
          id: "航班-1",
          from: "LHR",
          to: "JFK",
          marketingCarrier: "BA",
          operatingCarrier: "BA",
        }),
      ],
    }

    const encoded = encodeSharePayload(itinerary)
    expect(encoded.success).toBe(true)
    if (!encoded.success) return

    expect(encoded.payload).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(decodeSharePayload(encoded.payload)).toEqual({
      success: true,
      itinerary,
    })
  })

  it("rejects malformed, unsupported, and invalid itinerary payloads", () => {
    expect(decodeSharePayload("not-a-zlib-payload")).toEqual({
      success: false,
      code: "malformed_payload",
    })
    expect(
      decodeSharePayload(
        encodeUnknown({ v: 2, kind: "itinerary", data: createEmptyItinerary() })
      )
    ).toEqual({ success: false, code: "unsupported_version" })
    expect(
      decodeSharePayload(
        encodeUnknown({ v: 1, kind: "itinerary", data: { flights: [] } })
      )
    ).toEqual({ success: false, code: "invalid_itinerary" })
    expect(
      decodeSharePayload(
        encodeUnknown({
          v: 1,
          kind: "itinerary",
          data: createEmptyItinerary(),
          unexpected: true,
        })
      )
    ).toEqual({ success: false, code: "invalid_itinerary" })
  })

  it("round-trips a full 16-flight codeshare and open-jaw plan", () => {
    const itinerary = {
      ...createEmptyItinerary(),
      endWithOpenJaw: true,
      flights: Array.from({ length: 16 }, (_, index) =>
        createFlightSegment({
          id: `航段-${index + 1}`,
          from: index % 2 === 0 ? "LHR" : "JFK",
          to: index % 2 === 0 ? "JFK" : "LHR",
          marketingCarrier: "BA",
          isCodeshare: true,
          operatingCarrier: "AA",
        })
      ),
    }
    const encoded = encodeSharePayload(itinerary)

    expect(encoded.success).toBe(true)
    if (!encoded.success) return
    expect(decodeSharePayload(encoded.payload)).toEqual({
      success: true,
      itinerary,
    })
  })

  it("enforces the decoded JSON size limit", () => {
    const payload = encodeUnknown({
      v: 1,
      kind: "itinerary",
      data: createEmptyItinerary(),
      padding: "x".repeat(MAX_SHARE_JSON_BYTES),
    })

    expect(decodeSharePayload(payload)).toEqual({
      success: false,
      code: "payload_too_large",
    })
  })
})
