import { z } from "zod"

import { APP_CONFIG } from "@/config"

const airportCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Expected a three-letter IATA airport code")

export const flightSegmentSchema = z
  .object({
    id: z.string().min(1),
    from: airportCodeSchema,
    to: airportCodeSchema,
    marketingCarrier: z.string().min(1),
    isCodeshare: z.boolean(),
    operatingCarrier: z.string(),
    arrivalType: z.enum(["stopover", "transfer"]),
  })
  .superRefine((flight, context) => {
    if (flight.isCodeshare && !flight.operatingCarrier) {
      context.addIssue({
        code: "custom",
        path: ["operatingCarrier"],
        message: "A codeshare flight requires an operating carrier",
      })
    }
  })

export const itinerarySchema = z.object({
  schemaVersion: z.literal(APP_CONFIG.schemaVersion),
  cabinClass: z.enum(["economy", "business", "first"]),
  mileageBand: z.union([
    z.literal("auto"),
    z.literal(26_000),
    z.literal(29_000),
    z.literal(34_000),
    z.literal(39_000),
  ]),
  endWithOpenJaw: z.boolean(),
  flights: z.array(flightSegmentSchema),
})
