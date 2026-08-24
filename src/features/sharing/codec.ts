import { strFromU8, strToU8, unzlibSync, zlibSync } from "fflate"

import { itinerarySchema, type Itinerary } from "@/features/itinerary"

import {
  SHARE_PROTOCOL_VERSION,
  shareEnvelopeV1Schema,
  type ShareEnvelopeV1,
} from "./schema"

export const MAX_SHARE_JSON_BYTES = 64 * 1024
export const MAX_SHARE_PAYLOAD_LENGTH = 8_000

export type ShareCodecErrorCode =
  | "invalid_itinerary"
  | "malformed_payload"
  | "payload_too_large"
  | "unsupported_version"

export type EncodeSharePayloadResult =
  | { success: true; payload: string }
  | { success: false; code: "invalid_itinerary" | "payload_too_large" }

export type DecodeSharePayloadResult =
  | { success: true; itinerary: Itinerary }
  | { success: false; code: ShareCodecErrorCode }

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let binary = ""

  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}

const base64UrlToBytes = (value: string): Uint8Array => {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Invalid Base64URL payload")
  }

  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + padding)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

export const encodeSharePayload = (
  itinerary: Itinerary
): EncodeSharePayloadResult => {
  const parsedItinerary = itinerarySchema.safeParse(itinerary)

  if (!parsedItinerary.success) {
    return { success: false, code: "invalid_itinerary" }
  }

  const envelope: ShareEnvelopeV1 = {
    v: SHARE_PROTOCOL_VERSION,
    kind: "itinerary",
    data: parsedItinerary.data,
  }
  const json = strToU8(JSON.stringify(envelope))

  if (json.byteLength > MAX_SHARE_JSON_BYTES) {
    return { success: false, code: "payload_too_large" }
  }

  return {
    success: true,
    // Keep fflate's default compression settings for protocol compatibility.
    payload: bytesToBase64Url(zlibSync(json)),
  }
}

export const decodeSharePayload = (
  payload: string
): DecodeSharePayloadResult => {
  if (!payload || payload.length > MAX_SHARE_PAYLOAD_LENGTH) {
    return {
      success: false,
      code: payload ? "payload_too_large" : "malformed_payload",
    }
  }

  let value: unknown

  try {
    const compressed = base64UrlToBytes(payload)
    const json = unzlibSync(compressed)

    if (json.byteLength > MAX_SHARE_JSON_BYTES) {
      return { success: false, code: "payload_too_large" }
    }

    value = JSON.parse(strFromU8(json)) as unknown
  } catch {
    return { success: false, code: "malformed_payload" }
  }

  if (isRecord(value) && "v" in value && value.v !== SHARE_PROTOCOL_VERSION) {
    return { success: false, code: "unsupported_version" }
  }

  const parsedEnvelope = shareEnvelopeV1Schema.safeParse(value)

  if (!parsedEnvelope.success) {
    return { success: false, code: "invalid_itinerary" }
  }

  return { success: true, itinerary: parsedEnvelope.data.data }
}
