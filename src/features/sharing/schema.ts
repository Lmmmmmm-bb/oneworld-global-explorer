import { z } from "zod"

import { itinerarySchema } from "@/features/itinerary"

export const SHARE_PROTOCOL_VERSION = 1

export const shareEnvelopeV1Schema = z.strictObject({
  v: z.literal(SHARE_PROTOCOL_VERSION),
  kind: z.literal("itinerary"),
  data: itinerarySchema,
})

export type ShareEnvelopeV1 = z.infer<typeof shareEnvelopeV1Schema>
