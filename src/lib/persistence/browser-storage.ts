import type { StateStorage } from "zustand/middleware"

const inMemoryFallback: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const getBrowserStorage = (): StateStorage =>
  typeof localStorage === "undefined" ? inMemoryFallback : localStorage
