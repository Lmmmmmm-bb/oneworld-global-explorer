import { createItineraryTools } from "./itinerary-tools"
import { createRouteTools } from "./route-tools"
import type { ToolMode, WebMcpTool } from "./types"

export const createPlannerTools = (
  mode: ToolMode,
  lifecycleSignal?: AbortSignal
): WebMcpTool[] => [
  ...createRouteTools(),
  ...createItineraryTools(mode, lifecycleSignal),
]
