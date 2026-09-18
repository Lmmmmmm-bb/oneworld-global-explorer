import type { Itinerary } from "@/features/itinerary"

export interface WebMcpTool {
  name: string
  title: string
  description: string
  inputSchema: object
  annotations: { readOnlyHint: boolean }
  execute: (
    input: unknown,
    options?: { signal?: AbortSignal }
  ) => Promise<unknown> | unknown
}

export interface WebMcpContext {
  registerTool: (
    tool: WebMcpTool,
    options?: { signal?: AbortSignal }
  ) => Promise<void> | void
  unregisterTool?: (name: string) => void
}

export type ToolMode =
  { kind: "local" } | { kind: "shared"; itinerary: Itinerary }
