import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { APP_CONFIG } from "@/config"
import {
  createEmptyItinerary,
  itinerarySchema,
  type CabinClass,
  type FlightSegment,
  type Itinerary,
  type MileageBandPreference,
} from "@/features/itinerary"
import { getCompatibleBands } from "@/features/rules"

import { getLocalStorage } from "./storage"

interface ItineraryStore {
  itinerary: Itinerary
  addFlight: (flight: FlightSegment) => void
  updateFlight: (id: string, update: Partial<FlightSegment>) => void
  deleteFlight: (id: string) => void
  setCabinClass: (cabinClass: CabinClass) => void
  setMileageBand: (mileageBand: MileageBandPreference) => void
  setEndWithOpenJaw: (endWithOpenJaw: boolean) => void
  replaceItinerary: (itinerary: Itinerary) => void
  resetItinerary: () => void
}

type SetStore = (
  partial:
    | Partial<ItineraryStore>
    | ((state: ItineraryStore) => Partial<ItineraryStore>)
) => void

const updateItinerary = (
  set: SetStore,
  updater: (itinerary: Itinerary) => Itinerary
) => set((state) => ({ itinerary: updater(state.itinerary) }))

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      itinerary: createEmptyItinerary(),
      addFlight: (flight) =>
        updateItinerary(set, (itinerary) => ({
          ...itinerary,
          flights: [...itinerary.flights, flight],
        })),
      updateFlight: (id, update) =>
        updateItinerary(set, (itinerary) => ({
          ...itinerary,
          flights: itinerary.flights.map((flight) =>
            flight.id === id ? { ...flight, ...update, id: flight.id } : flight
          ),
        })),
      deleteFlight: (id) =>
        updateItinerary(set, (itinerary) => ({
          ...itinerary,
          flights: itinerary.flights.filter((flight) => flight.id !== id),
        })),
      setCabinClass: (cabinClass) =>
        updateItinerary(set, (itinerary) => {
          const compatibleBands = getCompatibleBands(cabinClass)
          const mileageBand =
            itinerary.mileageBand !== "auto" &&
            !compatibleBands.includes(itinerary.mileageBand)
              ? "auto"
              : itinerary.mileageBand

          return { ...itinerary, cabinClass, mileageBand }
        }),
      setMileageBand: (mileageBand) =>
        updateItinerary(set, (itinerary) => ({ ...itinerary, mileageBand })),
      setEndWithOpenJaw: (endWithOpenJaw) =>
        updateItinerary(set, (itinerary) => ({
          ...itinerary,
          endWithOpenJaw,
        })),
      replaceItinerary: (itinerary) => set({ itinerary }),
      resetItinerary: () => set({ itinerary: createEmptyItinerary() }),
    }),
    {
      name: APP_CONFIG.storageKey,
      version: APP_CONFIG.schemaVersion,
      storage: createJSONStorage(getLocalStorage),
      partialize: ({ itinerary }) => ({ itinerary }),
      merge: (persisted, current) => {
        const candidate = (persisted as Partial<ItineraryStore>)?.itinerary
        const parsed = itinerarySchema.safeParse(candidate)
        return {
          ...current,
          itinerary: parsed.success ? parsed.data : current.itinerary,
        }
      },
    }
  )
)
