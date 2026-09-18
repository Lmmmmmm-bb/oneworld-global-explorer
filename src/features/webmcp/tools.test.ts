import { beforeEach, describe, expect, it, vi } from "vitest"

import compactRouteData from "@/data/generated/route-data.compact.json"
import { createEmptyItinerary } from "@/features/itinerary"
import {
  initializeRouteData,
  routes,
  type CompactRouteDataSnapshot,
} from "@/features/route-data"
import { useItineraryStore } from "@/stores"

import { registerPlannerTools } from "./register"
import { createPlannerTools } from "./tools"
import type { WebMcpTool } from "./types"

const call = async (
  tools: WebMcpTool[],
  name: string,
  input: unknown = {},
  options?: { signal?: AbortSignal }
) => {
  const tool = tools.find((candidate) => candidate.name === name)
  if (!tool) throw new Error(`Missing tool: ${name}`)
  return tool.execute(input, options) as Promise<Record<string, unknown>>
}

describe("planner WebMCP tools", () => {
  beforeEach(() => {
    initializeRouteData(compactRouteData as CompactRouteDataSnapshot)
    useItineraryStore.getState().resetItinerary()
  })

  it("exposes bounded airport and directed-route discovery", async () => {
    const tools = createPlannerTools({ kind: "local" })
    const route = routes[0]
    const airportResult = await call(tools, "search_airports", {
      query: route.from,
      limit: 1,
    })
    expect(airportResult.success).toBe(true)
    expect(airportResult.airports).toEqual([
      expect.objectContaining({ iata: route.from }),
    ])

    const routeResult = await call(tools, "find_routes", {
      from: route.from,
      to: route.to,
      carrier: route.carrierCodes[0],
    })
    expect(routeResult.totalMatches).toBe(1)
    expect(routeResult.routes).toEqual([
      expect.objectContaining({
        from: route.from,
        to: route.to,
        carrierCodes: expect.arrayContaining([route.carrierCodes[0]]),
      }),
    ])
    expect(
      (await call(tools, "search_airports", { query: "x", limit: 100 })).code
    ).toBe("invalid_input")
  })

  it("previews a draft without changing the local itinerary", async () => {
    const tools = createPlannerTools({ kind: "local" })
    const route = routes[0]
    const draft = {
      cabinClass: "economy",
      mileageBand: "auto",
      endWithOpenJaw: false,
      flights: [
        {
          from: route.from,
          to: route.to,
          marketingCarrier: route.carrierCodes[0],
          arrivalType: "stopover",
        },
      ],
    }

    const result = await call(tools, "preview_itinerary", { draft })
    expect(result.success).toBe(true)
    expect(result.previewFlightIds).toEqual(["preview-flight-1"])
    expect(result.validation).toMatchObject({
      metrics: { flightCount: 1 },
    })
    expect(useItineraryStore.getState().itinerary).toEqual(
      createEmptyItinerary()
    )
  })

  it("saves as one undoable edit and rejects a stale revision", async () => {
    const tools = createPlannerTools({ kind: "local" })
    const route = routes[0]
    const before = await call(tools, "get_itinerary")
    const draft = {
      cabinClass: "economy",
      mileageBand: "auto",
      endWithOpenJaw: false,
      flights: [
        {
          from: route.from,
          to: route.to,
          marketingCarrier: route.carrierCodes[0],
          arrivalType: "stopover",
        },
      ],
    }
    const initialHistoryLength = useItineraryStore.getState().past.length

    const saved = await call(tools, "save_itinerary", {
      expectedRevision: before.revision,
      draft,
    })
    expect(saved.success).toBe(true)
    expect(saved.undoable).toBe(true)
    expect(useItineraryStore.getState().itinerary.flights).toHaveLength(1)
    expect(useItineraryStore.getState().past).toHaveLength(
      initialHistoryLength + 1
    )
    expect(useItineraryStore.getState().past.at(-1)?.change.type).toBe(
      "itinerary.replaceFromAgent"
    )

    const conflict = await call(tools, "save_itinerary", {
      expectedRevision: before.revision,
      draft,
    })
    expect(conflict.code).toBe("revision_conflict")
    expect(useItineraryStore.getState().past).toHaveLength(
      initialHistoryLength + 1
    )

    useItineraryStore.getState().undo()
    expect(useItineraryStore.getState().itinerary).toEqual(before.itinerary)
  })

  it("does not save malformed drafts or cancelled executions", async () => {
    const controller = new AbortController()
    const tools = createPlannerTools({ kind: "local" }, controller.signal)
    const before = await call(tools, "get_itinerary")

    const malformed = await call(tools, "save_itinerary", {
      expectedRevision: before.revision,
      draft: { cabinClass: "economy", flights: [] },
    })
    expect(malformed.code).toBe("invalid_input")

    controller.abort()
    const cancelled = await call(tools, "save_itinerary", {
      expectedRevision: before.revision,
      draft: {
        cabinClass: "economy",
        mileageBand: "auto",
        endWithOpenJaw: false,
        flights: [],
      },
    })
    expect(cancelled.code).toBe("cancelled")
    expect(useItineraryStore.getState().itinerary).toEqual(before.itinerary)
  })

  it("keeps shared pages read-only and returns their displayed snapshot", async () => {
    const shared = createEmptyItinerary()
    shared.cabinClass = "business"
    const tools = createPlannerTools({ kind: "shared", itinerary: shared })

    expect(tools.map(({ name }) => name)).toEqual([
      "search_airports",
      "find_routes",
      "get_itinerary",
      "preview_itinerary",
    ])
    const result = await call(tools, "get_itinerary")
    expect(result).toMatchObject({
      success: true,
      mode: "shared",
      itinerary: { cabinClass: "business" },
    })
    expect(result).not.toHaveProperty("revision")
  })

  it("unregisters tools when the page mode changes", () => {
    const registered: WebMcpTool[] = []
    const signals: AbortSignal[] = []
    const unregisterTool = vi.fn()
    const dispose = registerPlannerTools(
      {
        registerTool: (tool, options) => {
          registered.push(tool)
          signals.push(options!.signal!)
        },
        unregisterTool,
      },
      { kind: "local" }
    )

    expect(registered).toHaveLength(6)
    expect(signals.every((signal) => !signal.aborted)).toBe(true)
    dispose()
    expect(signals.every((signal) => signal.aborted)).toBe(true)
    expect(unregisterTool).toHaveBeenCalledTimes(6)
  })
})
