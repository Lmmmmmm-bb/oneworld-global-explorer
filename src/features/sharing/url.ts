import type { Itinerary } from "@/features/itinerary"

import { encodeSharePayload } from "./codec"
export { parseShareHash } from "./route"

export const MAX_SHARE_URL_LENGTH = 8_000

export type CreateShareUrlResult =
  | { success: true; url: string }
  | {
      success: false
      code: "invalid_itinerary" | "payload_too_large" | "url_too_long"
    }

export interface ShareUrlContext {
  origin: string
  baseUrl: string
}

export const createShareUrl = (
  itinerary: Itinerary,
  context: ShareUrlContext
): CreateShareUrlResult => {
  const encoded = encodeSharePayload(itinerary)

  if (!encoded.success) {
    return encoded
  }

  const url = new URL(context.baseUrl, context.origin)
  url.hash = `/share/v1/${encoded.payload}`
  const value = url.toString()

  if (value.length > MAX_SHARE_URL_LENGTH) {
    return { success: false, code: "url_too_long" }
  }

  return { success: true, url: value }
}

export const createBrowserShareUrl = (
  itinerary: Itinerary
): CreateShareUrlResult =>
  createShareUrl(itinerary, {
    origin: window.location.origin,
    baseUrl: import.meta.env.BASE_URL,
  })
