import type { StateStorage } from "zustand/middleware"

const inMemoryFallback: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

export const getLocalStorage = (): StateStorage =>
  typeof localStorage === "undefined" ? inMemoryFallback : localStorage
