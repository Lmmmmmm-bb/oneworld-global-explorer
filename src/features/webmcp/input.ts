import { z } from "zod"

const airportCode = z.string().regex(/^[A-Z]{3}$/)
const flightDraftSchema = z
  .strictObject({
    from: airportCode,
    to: airportCode,
    marketingCarrier: z.string().min(1),
    isCodeshare: z.boolean().optional().default(false),
    operatingCarrier: z.string().optional(),
    arrivalType: z.enum(["transfer", "stopover"]),
  })
  .refine((flight) => !flight.isCodeshare || Boolean(flight.operatingCarrier), {
    message: "A codeshare flight needs an operatingCarrier.",
    path: ["operatingCarrier"],
  })

export const itineraryDraftSchema = z.strictObject({
  cabinClass: z.enum(["economy", "business", "first"]),
  mileageBand: z.union([
    z.literal("auto"),
    z.literal(26_000),
    z.literal(29_000),
    z.literal(34_000),
    z.literal(39_000),
  ]),
  endWithOpenJaw: z.boolean(),
  flights: z.array(flightDraftSchema).max(16),
})

export type ItineraryDraft = z.infer<typeof itineraryDraftSchema>

export const searchInputSchema = z.strictObject({
  query: z.string().trim().min(1).max(100),
  limit: z.number().int().min(1).max(20).optional().default(10),
})

export const routesInputSchema = z.strictObject({
  from: airportCode,
  to: airportCode.optional(),
  carrier: z.string().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional().default(20),
})

export const previewInputSchema = z.strictObject({
  draft: itineraryDraftSchema,
})

export const saveInputSchema = z.strictObject({
  expectedRevision: z.string().regex(/^[a-f0-9]{64}$/),
  draft: itineraryDraftSchema,
})

export const emptyInputSchema = z.strictObject({})

export const inputError = (error: z.ZodError) => ({
  success: false,
  code: "invalid_input",
  issues: error.issues.map(({ path, message }) => ({
    path: path.join("."),
    message,
  })),
})

const flightJsonSchema = {
  type: "object",
  properties: {
    from: {
      type: "string",
      pattern: "^[A-Z]{3}$",
      description: "Origin IATA code",
    },
    to: {
      type: "string",
      pattern: "^[A-Z]{3}$",
      description: "Destination IATA code",
    },
    marketingCarrier: {
      type: "string",
      minLength: 1,
      description: "Carrier code on the selected route",
    },
    isCodeshare: {
      type: "boolean",
      description: "Whether another carrier operates this flight",
    },
    operatingCarrier: {
      type: "string",
      description:
        "Required for codeshares; otherwise defaults to marketingCarrier",
    },
    arrivalType: { type: "string", enum: ["transfer", "stopover"] },
  },
  required: ["from", "to", "marketingCarrier", "arrivalType"],
  additionalProperties: false,
}

export const draftJsonSchema = {
  type: "object",
  properties: {
    cabinClass: { type: "string", enum: ["economy", "business", "first"] },
    mileageBand: { enum: ["auto", 26_000, 29_000, 34_000, 39_000] },
    endWithOpenJaw: { type: "boolean" },
    flights: { type: "array", maxItems: 16, items: flightJsonSchema },
  },
  required: ["cabinClass", "mileageBand", "endWithOpenJaw", "flights"],
  additionalProperties: false,
}

export const searchJsonSchema = {
  type: "object",
  properties: {
    query: { type: "string", minLength: 1, maxLength: 100 },
    limit: { type: "integer", minimum: 1, maximum: 20, default: 10 },
  },
  required: ["query"],
  additionalProperties: false,
}

export const routesJsonSchema = {
  type: "object",
  properties: {
    from: { type: "string", pattern: "^[A-Z]{3}$" },
    to: { type: "string", pattern: "^[A-Z]{3}$" },
    carrier: { type: "string", minLength: 1 },
    limit: { type: "integer", minimum: 1, maximum: 50, default: 20 },
  },
  required: ["from"],
  additionalProperties: false,
}

export const emptyJsonSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
}

export const previewJsonSchema = {
  type: "object",
  properties: { draft: draftJsonSchema },
  required: ["draft"],
  additionalProperties: false,
}

export const saveJsonSchema = {
  type: "object",
  properties: {
    expectedRevision: {
      type: "string",
      pattern: "^[a-f0-9]{64}$",
      description: "Revision returned by get_itinerary",
    },
    draft: draftJsonSchema,
  },
  required: ["expectedRevision", "draft"],
  additionalProperties: false,
}
