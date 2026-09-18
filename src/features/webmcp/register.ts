import { createPlannerTools } from "./tools"
import type { ToolMode, WebMcpContext } from "./types"

export const registerPlannerTools = (
  context: WebMcpContext,
  mode: ToolMode
) => {
  const controller = new AbortController()
  const tools = createPlannerTools(mode, controller.signal)

  for (const tool of tools) {
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: controller.signal })
      ).catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.warn(`WebMCP registration failed for ${tool.name}:`, error)
        }
      })
    } catch (error) {
      if (!controller.signal.aborted) {
        console.warn(`WebMCP registration failed for ${tool.name}:`, error)
      }
    }
  }

  return () => {
    controller.abort()
    for (const tool of tools) context.unregisterTool?.(tool.name)
  }
}
