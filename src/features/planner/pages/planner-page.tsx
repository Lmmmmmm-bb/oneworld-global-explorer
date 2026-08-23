import { lazy, Suspense, useEffect, useRef, useState, type FC } from "react"
import { ListOrdered, Map, Plus, ShieldCheck } from "lucide-react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { FlightSegment, Itinerary } from "@/features/itinerary"
import { useMediaQuery } from "@/hooks"
import { useItineraryStore } from "@/stores"

import { ItineraryPanel } from "../components/itinerary-panel"
import { PlannerAside } from "../components/planner-aside"
import { SummaryStrip } from "../components/summary-strip"
import { ValidationPanel } from "../components/validation-panel"
import { formatHistoryChange, useHistoryShortcuts } from "../history"

type MobileTab = "itinerary" | "map" | "validation"

const loadFlightEditorDialog = () =>
  import("../components/flight-editor-dialog")
const loadImportItineraryDialog = () =>
  import("../components/import-itinerary-dialog")
const loadNewItineraryDialog = () =>
  import("../components/new-itinerary-dialog")
const loadRouteMap = () => import("../components/route-map")

const FlightEditorDialog = lazy(() =>
  loadFlightEditorDialog().then((module) => ({
    default: module.FlightEditorDialog,
  }))
)
const ImportItineraryDialog = lazy(() =>
  loadImportItineraryDialog().then((module) => ({
    default: module.ImportItineraryDialog,
  }))
)
const NewItineraryDialog = lazy(() =>
  loadNewItineraryDialog().then((module) => ({
    default: module.NewItineraryDialog,
  }))
)
const RouteMap = lazy(() =>
  loadRouteMap().then((module) => ({ default: module.RouteMap }))
)

const MapFallback: FC = () => (
  <Card className="overflow-hidden">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm">Route map</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid min-h-64 place-items-center bg-muted/30 text-xs text-muted-foreground">
        Preparing the interactive map…
      </div>
    </CardContent>
  </Card>
)

const PlannerPageContent: FC = () => {
  const itinerary = useItineraryStore((state) => state.itinerary)
  const addFlight = useItineraryStore((state) => state.addFlight)
  const updateFlight = useItineraryStore((state) => state.updateFlight)
  const replaceItinerary = useItineraryStore((state) => state.replaceItinerary)
  const resetItinerary = useItineraryStore((state) => state.resetItinerary)
  const past = useItineraryStore((state) => state.past)
  const future = useItineraryStore((state) => state.future)
  const undo = useItineraryStore((state) => state.undo)
  const redo = useItineraryStore((state) => state.redo)
  const lastHistoryEvent = useItineraryStore((state) => state.lastHistoryEvent)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<FlightSegment | null>(null)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("itinerary")
  const [importFile, setImportFile] = useState<File | null>(null)
  const [desktopMapReady, setDesktopMapReady] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)
  const lastArrival = itinerary.flights.at(-1)?.to ?? ""
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const undoChange = past.at(-1)?.change
  const redoChange = future.at(-1)?.change

  useHistoryShortcuts()

  useEffect(() => {
    if (!isDesktop) return

    const timeout = window.setTimeout(() => {
      setDesktopMapReady(true)
      void loadRouteMap()
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [isDesktop])

  const openAddFlight = () => {
    void loadFlightEditorDialog()
    setEditingFlight(null)
    setEditorOpen(true)
  }

  const openEditFlight = (flight: FlightSegment) => {
    void loadFlightEditorDialog()
    setEditingFlight(flight)
    setEditorOpen(true)
  }

  const saveFlight = (flight: FlightSegment) => {
    if (editingFlight) updateFlight(editingFlight.id, flight)
    else addFlight(flight)
  }

  const exportCurrent = () => {
    void import("@/features/itinerary/serialization").then(
      ({ downloadItineraryJson }) => downloadItineraryJson(itinerary)
    )
  }

  const handleImport = (imported: Itinerary) => {
    replaceItinerary(imported)
    setEditingFlight(null)
    setMobileTab("itinerary")
  }

  return (
    <div className="min-h-svh bg-[#f7f8f6] pb-20 lg:pb-0">
      <input
        accept="application/json,.json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) setImportFile(file)
        }}
        ref={importInputRef}
        type="file"
      />
      <AppHeader
        history={{
          canUndo: Boolean(undoChange),
          canRedo: Boolean(redoChange),
          undoLabel: undoChange ? formatHistoryChange(undoChange) : undefined,
          redoLabel: redoChange ? formatHistoryChange(redoChange) : undefined,
          onUndo: undo,
          onRedo: redo,
        }}
        onAddFlight={openAddFlight}
        onExport={exportCurrent}
        onImport={() => {
          void loadImportItineraryDialog()
          importInputRef.current?.click()
        }}
        onNew={() => {
          void loadNewItineraryDialog()
          setNewDialogOpen(true)
        }}
      />
      <p aria-atomic="true" aria-live="polite" className="sr-only">
        {lastHistoryEvent
          ? `${lastHistoryEvent.direction === "undo" ? "Undid" : "Redid"}: ${formatHistoryChange(lastHistoryEvent.change)}`
          : ""}
      </p>
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

        {isDesktop ? (
          <div className="mt-5 grid grid-cols-[minmax(0,3fr)_minmax(340px,2fr)] items-start gap-5">
            <ItineraryPanel
              onAddFlight={openAddFlight}
              onEditFlight={openEditFlight}
            />
            <PlannerAside
              routeMap={
                desktopMapReady ? (
                  <Suspense fallback={<MapFallback />}>
                    <RouteMap />
                  </Suspense>
                ) : (
                  <MapFallback />
                )
              }
            />
          </div>
        ) : (
          <Tabs
            className="mt-5"
            onValueChange={(value) => value && setMobileTab(value as MobileTab)}
            value={mobileTab}
          >
            <TabsList
              className="grid h-11 w-full grid-cols-3"
              variant="default"
            >
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
              {mobileTab === "map" ? (
                <Suspense fallback={<MapFallback />}>
                  <RouteMap />
                </Suspense>
              ) : null}
            </TabsContent>
            <TabsContent className="mt-4" value="validation">
              <ValidationPanel />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="mx-auto max-w-[1600px] px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        Unofficial planning tool. Final eligibility is determined by oneworld
        and the ticketing carrier.
      </footer>

      {!isDesktop && mobileTab === "itinerary" ? (
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

      {editorOpen ? (
        <Suspense fallback={null}>
          <FlightEditorDialog
            defaultOrigin={editingFlight?.from ?? lastArrival}
            flight={editingFlight}
            onOpenChange={setEditorOpen}
            onSave={saveFlight}
            open
          />
        </Suspense>
      ) : null}
      {importFile ? (
        <Suspense fallback={null}>
          <ImportItineraryDialog
            file={importFile}
            key={`${importFile.name}-${importFile.lastModified}`}
            onClose={() => setImportFile(null)}
            onImport={handleImport}
          />
        </Suspense>
      ) : null}
      {newDialogOpen ? (
        <Suspense fallback={null}>
          <NewItineraryDialog
            onConfirm={() => {
              resetItinerary()
              setEditingFlight(null)
              setMobileTab("itinerary")
            }}
            onExport={exportCurrent}
            onOpenChange={setNewDialogOpen}
            open
          />
        </Suspense>
      ) : null}
    </div>
  )
}

export const PlannerPage: FC = () => (
  <TooltipProvider>
    <PlannerPageContent />
  </TooltipProvider>
)
