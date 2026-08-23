import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { APP_CONFIG } from "@/config"
import {
  areItinerariesEqual,
  cloneItinerary,
  createEmptyItinerary,
  isItinerary,
  type CabinClass,
  type FlightSegment,
  type Itinerary,
  type ItineraryChange,
  type MileageBandPreference,
} from "@/features/itinerary"
import { getCompatibleBands } from "@/features/rules"
import {
  commitHistory,
  redoHistory,
  undoHistory,
  type HistoryEntry,
} from "@/lib/history"
import { getBrowserStorage } from "@/lib/persistence"

export interface ItineraryHistoryEvent {
  id: number
  direction: "undo" | "redo"
  change: ItineraryChange
}

interface ItineraryStore {
  itinerary: Itinerary
  past: HistoryEntry<Itinerary, ItineraryChange>[]
  future: HistoryEntry<Itinerary, ItineraryChange>[]
  lastHistoryEvent: ItineraryHistoryEvent | null
  addFlight: (flight: FlightSegment) => void
  updateFlight: (id: string, update: Partial<FlightSegment>) => void
  deleteFlight: (id: string) => void
  setCabinClass: (cabinClass: CabinClass) => void
  setMileageBand: (mileageBand: MileageBandPreference) => void
  setEndWithOpenJaw: (endWithOpenJaw: boolean) => void
  replaceItinerary: (itinerary: Itinerary) => void
  resetItinerary: () => void
  undo: () => void
  redo: () => void
}

type SetStore = (
  partial:
    | Partial<ItineraryStore>
    | ((state: ItineraryStore) => Partial<ItineraryStore>)
) => void

type ItineraryChangeFactory = (
  current: Itinerary,
  next: Itinerary
) => ItineraryChange

const commitItinerary = (
  set: SetStore,
  getChange: ItineraryChangeFactory,
  updater: (itinerary: Itinerary) => Itinerary
) =>
  set((state) => {
    const current = cloneItinerary(state.itinerary)
    const next = cloneItinerary(updater(state.itinerary))

    if (areItinerariesEqual(current, next)) return state

    const transition = commitHistory({
      present: current,
      next,
      change: getChange(current, next),
      past: state.past,
      future: state.future,
      equals: areItinerariesEqual,
    })

    return {
      itinerary: transition.present,
      past: transition.past,
      future: transition.future,
    }
  })

const createHistoryEvent = (
  state: ItineraryStore,
  direction: ItineraryHistoryEvent["direction"],
  change: ItineraryChange
): ItineraryHistoryEvent => ({
  id: (state.lastHistoryEvent?.id ?? 0) + 1,
  direction,
  change,
})

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      itinerary: createEmptyItinerary(),
      past: [],
      future: [],
      lastHistoryEvent: null,
      addFlight: (flight) =>
        commitItinerary(
          set,
          () => ({ type: "flight.add", from: flight.from, to: flight.to }),
          (itinerary) => ({
            ...itinerary,
            flights: [...itinerary.flights, { ...flight }],
          })
        ),
      updateFlight: (id, update) =>
        commitItinerary(
          set,
          (_current, next) => {
            const flight = next.flights.find(
              (candidate) => candidate.id === id
            )!
            return {
              type: "flight.update",
              from: flight.from,
              to: flight.to,
            }
          },
          (itinerary) => ({
            ...itinerary,
            flights: itinerary.flights.map((flight) =>
              flight.id === id
                ? { ...flight, ...update, id: flight.id }
                : flight
            ),
          })
        ),
      deleteFlight: (id) =>
        commitItinerary(
          set,
          (current) => {
            const flight = current.flights.find(
              (candidate) => candidate.id === id
            )!
            return {
              type: "flight.delete",
              from: flight.from,
              to: flight.to,
            }
          },
          (itinerary) => ({
            ...itinerary,
            flights: itinerary.flights.filter((flight) => flight.id !== id),
          })
        ),
      setCabinClass: (cabinClass) =>
        commitItinerary(
          set,
          () => ({ type: "cabin.change", cabinClass }),
          (itinerary) => {
            const compatibleBands = getCompatibleBands(cabinClass)
            const mileageBand =
              itinerary.mileageBand !== "auto" &&
              !compatibleBands.includes(itinerary.mileageBand)
                ? "auto"
                : itinerary.mileageBand

            return { ...itinerary, cabinClass, mileageBand }
          }
        ),
      setMileageBand: (mileageBand) =>
        commitItinerary(
          set,
          () => ({ type: "mileageBand.change", mileageBand }),
          (itinerary) => ({ ...itinerary, mileageBand })
        ),
      setEndWithOpenJaw: (endWithOpenJaw) =>
        commitItinerary(
          set,
          () => ({ type: "openJaw.change", enabled: endWithOpenJaw }),
          (itinerary) => ({
            ...itinerary,
            endWithOpenJaw,
          })
        ),
      replaceItinerary: (itinerary) =>
        commitItinerary(
          set,
          () => ({ type: "itinerary.import" }),
          () => cloneItinerary(itinerary)
        ),
      resetItinerary: () =>
        commitItinerary(
          set,
          () => ({ type: "itinerary.reset" }),
          createEmptyItinerary
        ),
      undo: () =>
        set((state) => {
          const transition = undoHistory({
            present: cloneItinerary(state.itinerary),
            past: state.past,
            future: state.future,
          })

          if (!transition.appliedChange) return state

          return {
            itinerary: cloneItinerary(transition.present),
            past: transition.past,
            future: transition.future,
            lastHistoryEvent: createHistoryEvent(
              state,
              "undo",
              transition.appliedChange
            ),
          }
        }),
      redo: () =>
        set((state) => {
          const transition = redoHistory({
            present: cloneItinerary(state.itinerary),
            past: state.past,
            future: state.future,
          })

          if (!transition.appliedChange) return state

          return {
            itinerary: cloneItinerary(transition.present),
            past: transition.past,
            future: transition.future,
            lastHistoryEvent: createHistoryEvent(
              state,
              "redo",
              transition.appliedChange
            ),
          }
        }),
    }),
    {
      name: APP_CONFIG.storageKey,
      version: APP_CONFIG.schemaVersion,
      storage: createJSONStorage(getBrowserStorage),
      partialize: ({ itinerary }) => ({ itinerary }),
      merge: (persisted, current) => {
        const candidate = (persisted as Partial<ItineraryStore>)?.itinerary
        return {
          ...current,
          itinerary: isItinerary(candidate)
            ? cloneItinerary(candidate)
            : current.itinerary,
          past: [],
          future: [],
          lastHistoryEvent: null,
        }
      },
    }
  )
)
