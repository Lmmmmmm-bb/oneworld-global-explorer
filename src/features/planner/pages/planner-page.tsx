import { useRef, useState, type FC } from "react"
import { ListOrdered, Map, Plus, ShieldCheck } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  downloadItineraryJson,
  type FlightSegment,
  type Itinerary,
} from "@/features/itinerary"
import { useItineraryStore } from "@/stores"

import { FlightEditorSheet } from "../components/flight-editor-sheet"
import {
  ImportItineraryDialog,
  type ImportItineraryDialogHandle,
} from "../components/import-itinerary-dialog"
import { ItineraryPanel } from "../components/itinerary-panel"
import { NewItineraryDialog } from "../components/new-itinerary-dialog"
import { PlannerAside } from "../components/planner-aside"
import { RouteMap } from "../components/route-map"
import { SummaryStrip } from "../components/summary-strip"
import { ValidationPanel } from "../components/validation-panel"

type MobileTab = "itinerary" | "map" | "validation"

export const PlannerPage: FC = () => {
  const itinerary = useItineraryStore((state) => state.itinerary)
  const addFlight = useItineraryStore((state) => state.addFlight)
  const updateFlight = useItineraryStore((state) => state.updateFlight)
  const replaceItinerary = useItineraryStore((state) => state.replaceItinerary)
  const resetItinerary = useItineraryStore((state) => state.resetItinerary)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<FlightSegment | null>(null)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("itinerary")
  const importDialogRef = useRef<ImportItineraryDialogHandle>(null)
  const lastArrival = itinerary.flights.at(-1)?.to ?? ""

  const openAddFlight = () => {
    setEditingFlight(null)
    setEditorOpen(true)
  }

  const openEditFlight = (flight: FlightSegment) => {
    setEditingFlight(flight)
    setEditorOpen(true)
  }

  const saveFlight = (flight: FlightSegment) => {
    if (editingFlight) updateFlight(editingFlight.id, flight)
    else addFlight(flight)
  }

  const exportCurrent = () => downloadItineraryJson(itinerary)

  const handleImport = (imported: Itinerary) => {
    replaceItinerary(imported)
    setEditingFlight(null)
    setMobileTab("itinerary")
  }

  return (
    <div className="min-h-svh bg-[#f7f8f6] pb-20 lg:pb-0">
      <AppHeader
        onAddFlight={openAddFlight}
        onExport={exportCurrent}
        onImport={() => importDialogRef.current?.chooseFile()}
        onNew={() => setNewDialogOpen(true)}
      />
      <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mb-5">
          <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">
            Route workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Plan the route. Check the rules.
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Build a Global Explorer itinerary with clear mileage and route
            validation as you go.
          </p>
        </div>

        <SummaryStrip />

        <div className="mt-5 hidden gap-5 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
          <ItineraryPanel
            onAddFlight={openAddFlight}
            onEditFlight={openEditFlight}
          />
          <PlannerAside />
        </div>

        <Tabs
          className="mt-5 lg:hidden"
          onValueChange={(value) => value && setMobileTab(value as MobileTab)}
          value={mobileTab}
        >
          <TabsList className="grid h-11 w-full grid-cols-3" variant="default">
            <TabsTrigger value="itinerary">
              <ListOrdered aria-hidden="true" />
              Itinerary
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map aria-hidden="true" />
              Map
            </TabsTrigger>
            <TabsTrigger value="validation">
              <ShieldCheck aria-hidden="true" />
              Validation
            </TabsTrigger>
          </TabsList>
          <TabsContent className="mt-4" value="itinerary">
            <ItineraryPanel
              onAddFlight={openAddFlight}
              onEditFlight={openEditFlight}
            />
          </TabsContent>
          <TabsContent className="mt-4" value="map">
            <RouteMap />
          </TabsContent>
          <TabsContent className="mt-4" value="validation">
            <ValidationPanel />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mx-auto max-w-[1600px] px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        Unofficial planning tool. Final eligibility is determined by oneworld
        and the ticketing carrier.
      </footer>

      {mobileTab === "itinerary" ? (
        <Button
          className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-5 shadow-lg sm:hidden"
          onClick={openAddFlight}
          size="lg"
          type="button"
        >
          <Plus aria-hidden="true" />
          Add flight
        </Button>
      ) : null}

      <FlightEditorSheet
        defaultOrigin={editingFlight ? "" : lastArrival}
        flight={editingFlight}
        onOpenChange={setEditorOpen}
        onSave={saveFlight}
        open={editorOpen}
      />
      <ImportItineraryDialog onImport={handleImport} ref={importDialogRef} />
      <NewItineraryDialog
        onConfirm={() => {
          resetItinerary()
          setEditingFlight(null)
          setMobileTab("itinerary")
        }}
        onExport={exportCurrent}
        onOpenChange={setNewDialogOpen}
        open={newDialogOpen}
      />
    </div>
  )
}
