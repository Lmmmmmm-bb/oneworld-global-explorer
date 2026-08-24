export type ShareRouteResult =
  | { kind: "local" }
  | { kind: "shared"; payload: string }
  | {
      kind: "error"
      code: "missing_payload" | "malformed_payload" | "unsupported_version"
    }

export const parseShareHash = (hash: string): ShareRouteResult => {
  if (!hash.startsWith("#/share")) {
    return { kind: "local" }
  }

  const match = /^#\/share\/([^/]+)(?:\/(.*))?$/.exec(hash)

  if (!match) {
    return { kind: "error", code: "malformed_payload" }
  }

  const [, version, payload] = match

  if (version !== "v1") {
    return { kind: "error", code: "unsupported_version" }
  }

  if (!payload) {
    return { kind: "error", code: "missing_payload" }
  }

  if (payload.includes("/")) {
    return { kind: "error", code: "malformed_payload" }
  }

  return { kind: "shared", payload }
}
