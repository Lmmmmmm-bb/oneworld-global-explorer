import { lazy, Suspense, useEffect, useMemo, useState, type FC } from "react"
import { ExternalLink, ListOrdered, Map, Plus, ShieldCheck } from "lucide-react"
import { LayoutGroup, motion } from "motion/react"

import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { FlightSegment } from "@/features/itinerary"
import { validateItinerary } from "@/features/rules"
import { useMediaQuery } from "@/hooks"
import { useItineraryStore } from "@/stores"

import { AnimatedMobileTab } from "../components/animated-mobile-tab"
import { ItineraryPanel } from "../components/itinerary-panel"
import { PlannerAside } from "../components/planner-aside"
import { SummaryStrip } from "../components/summary-strip"
import { ValidationPanel } from "../components/validation-panel"
import { formatHistoryChange, useHistoryShortcuts } from "../history"
import { useMapSelection } from "../map-selection"

type MobileTab = "itinerary" | "map" | "validation"

const loadFlightEditorDialog = () =>
  import("../components/flight-editor-dialog")
const loadNewItineraryDialog = () =>
  import("../components/new-itinerary-dialog")
const loadRouteMap = () => import("../components/route-map")
const loadShareItineraryDialog = () =>
  import("@/features/sharing/components/share-itinerary-dialog")

const FlightEditorDialog = lazy(() =>
  loadFlightEditorDialog().then((module) => ({
    default: module.FlightEditorDialog,
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
const ShareItineraryDialog = lazy(() =>
  loadShareItineraryDialog().then((module) => ({
    default: module.ShareItineraryDialog,
  }))
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
  const deleteFlight = useItineraryStore((state) => state.deleteFlight)
  const setCabinClass = useItineraryStore((state) => state.setCabinClass)
  const setMileageBand = useItineraryStore((state) => state.setMileageBand)
  const setEndWithOpenJaw = useItineraryStore(
    (state) => state.setEndWithOpenJaw
  )
  const resetItinerary = useItineraryStore((state) => state.resetItinerary)
  const past = useItineraryStore((state) => state.past)
  const future = useItineraryStore((state) => state.future)
  const undo = useItineraryStore((state) => state.undo)
  const redo = useItineraryStore((state) => state.redo)
  const lastHistoryEvent = useItineraryStore((state) => state.lastHistoryEvent)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMounted, setEditorMounted] = useState(false)
  const [editorSession, setEditorSession] = useState(0)
  const [editingFlight, setEditingFlight] = useState<FlightSegment | null>(null)
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("itinerary")
  const [desktopMapReady, setDesktopMapReady] = useState(false)
  const lastArrival = itinerary.flights.at(-1)?.to ?? ""
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const {
    selection: mapSelection,
    clearSelection: clearMapSelection,
    toggleFlight: showFlightOnMap,
  } = useMapSelection(isDesktop, () => setMobileTab("map"))
  const undoChange = past.at(-1)?.change
  const redoChange = future.at(-1)?.change
  const validation = useMemo(() => validateItinerary(itinerary), [itinerary])

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
    setEditorSession((session) => session + 1)
    setEditorMounted(true)
    setEditorOpen(true)
  }

  const openEditFlight = (flight: FlightSegment) => {
    void loadFlightEditorDialog()
    setEditingFlight(flight)
    setEditorSession((session) => session + 1)
    setEditorMounted(true)
    setEditorOpen(true)
  }

  const removeFlight = (id: string) => {
    if (mapSelection?.flightId === id) clearMapSelection()
    deleteFlight(id)
  }

  const saveFlight = (flight: FlightSegment) => {
    if (editingFlight) updateFlight(editingFlight.id, flight)
    else addFlight(flight)
  }

  const openShareDialog = () => {
    void loadShareItineraryDialog()
    setShareDialogOpen(true)
  }

  return (
    <div className="min-h-svh bg-[#f7f8f6] pb-20 lg:pb-0">
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
        onNew={() => {
          void loadNewItineraryDialog()
          setNewDialogOpen(true)
        }}
        onShare={openShareDialog}
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
            Plan your oneworld Global Explorer itinerary.
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Build a round-the-world route, estimate mileage, and check common
            itinerary rules as you go.
          </p>
          <a
            className="mt-2 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href="/guide/"
          >
            New to Global Explorer? Read the planning guide →
          </a>
        </div>

        <SummaryStrip itinerary={itinerary} validation={validation} />

        {isDesktop ? (
          <div className="mt-5 grid grid-cols-[minmax(0,3fr)_minmax(340px,2fr)] items-start gap-5">
            <ItineraryPanel
              itinerary={itinerary}
              onAddFlight={openAddFlight}
              onCabinClassChange={setCabinClass}
              onDeleteFlight={removeFlight}
              onEditFlight={openEditFlight}
              onEndWithOpenJawChange={setEndWithOpenJaw}
              onMileageBandChange={setMileageBand}
              onShowFlightOnMap={showFlightOnMap}
              selectedFlightId={mapSelection?.flightId}
              validation={validation}
            />
            <PlannerAside
              routeMap={
                desktopMapReady ? (
                  <Suspense fallback={<MapFallback />}>
                    <RouteMap
                      flights={itinerary.flights}
                      onClearSelection={clearMapSelection}
                      selection={mapSelection}
                    />
                  </Suspense>
                ) : (
                  <MapFallback />
                )
              }
              validation={validation}
            />
          </div>
        ) : (
          <Tabs
            className="mt-5"
            onValueChange={(value) => value && setMobileTab(value as MobileTab)}
            value={mobileTab}
          >
            <LayoutGroup id="planner-mobile-tabs">
              <TabsList
                className="grid h-11 w-full grid-cols-3"
                variant="default"
              >
                <AnimatedMobileTab
                  active={mobileTab === "itinerary"}
                  value="itinerary"
                >
                  <ListOrdered aria-hidden="true" />
                  Itinerary
                </AnimatedMobileTab>
                <AnimatedMobileTab
                  active={mobileTab === "map"}
                  className="planner-mobile-map-tab"
                  value="map"
                >
                  <Map aria-hidden="true" />
                  Map
                </AnimatedMobileTab>
                <AnimatedMobileTab
                  active={mobileTab === "validation"}
                  value="validation"
                >
                  <ShieldCheck aria-hidden="true" />
                  Validation
                </AnimatedMobileTab>
              </TabsList>
            </LayoutGroup>
            <TabsContent className="mt-4" value="itinerary">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <ItineraryPanel
                  itinerary={itinerary}
                  onAddFlight={openAddFlight}
                  onCabinClassChange={setCabinClass}
                  onDeleteFlight={removeFlight}
                  onEditFlight={openEditFlight}
                  onEndWithOpenJawChange={setEndWithOpenJaw}
                  onMileageBandChange={setMileageBand}
                  onShowFlightOnMap={showFlightOnMap}
                  selectedFlightId={mapSelection?.flightId}
                  validation={validation}
                />
              </motion.div>
            </TabsContent>
            <TabsContent className="mt-4" value="map">
              {mobileTab === "map" ? (
                <Suspense fallback={<MapFallback />}>
                  <motion.div
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    <RouteMap
                      flights={itinerary.flights}
                      onClearSelection={clearMapSelection}
                      selection={mapSelection}
                    />
                  </motion.div>
                </Suspense>
              ) : null}
            </TabsContent>
            <TabsContent className="mt-4" value="validation">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                <ValidationPanel validation={validation} />
              </motion.div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        <span>
          Unofficial planning tool. Final eligibility is determined by oneworld
          and the ticketing carrier.
        </span>
        <a
          className="underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="/guide/"
        >
          Planning guide
        </a>
        <a
          className="inline-flex items-center gap-1.5 underline-offset-4 hover:text-foreground hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          href="https://github.com/Lmmmmmm-bb/oneworld-global-explorer"
          rel="noopener noreferrer"
          target="_blank"
        >
          <ExternalLink aria-hidden="true" className="size-3.5" />
          View on GitHub
        </a>
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

      {editorMounted ? (
        <Suspense fallback={null}>
          <FlightEditorDialog
            defaultOrigin={editingFlight?.from ?? lastArrival}
            flight={editingFlight}
            key={editorSession}
            onCloseComplete={() => setEditorMounted(false)}
            onOpenChange={setEditorOpen}
            onSave={saveFlight}
            open={editorOpen}
          />
        </Suspense>
      ) : null}
      {newDialogOpen ? (
        <Suspense fallback={null}>
          <NewItineraryDialog
            onConfirm={() => {
              resetItinerary()
              clearMapSelection()
              setEditingFlight(null)
              setMobileTab("itinerary")
            }}
            onOpenChange={setNewDialogOpen}
            onShare={openShareDialog}
            open
          />
        </Suspense>
      ) : null}
      {shareDialogOpen ? (
        <Suspense fallback={null}>
          <ShareItineraryDialog
            itinerary={itinerary}
            onOpenChange={setShareDialogOpen}
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
