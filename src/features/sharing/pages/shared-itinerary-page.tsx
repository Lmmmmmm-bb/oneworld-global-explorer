import { lazy, Suspense, useEffect, useMemo, useState, type FC } from "react"
import {
  Check,
  Copy,
  Globe2,
  ListOrdered,
  Map,
  PencilLine,
  ShieldCheck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { APP_CONFIG } from "@/config"
import {
  areItinerariesEqual,
  createEmptyItinerary,
  type Itinerary,
} from "@/features/itinerary"
import { ItineraryPanel } from "@/features/planner/components/itinerary-panel"
import { PlannerAside } from "@/features/planner/components/planner-aside"
import { SummaryStrip } from "@/features/planner/components/summary-strip"
import { ValidationPanel } from "@/features/planner/components/validation-panel"
import { validateItinerary } from "@/features/rules"
import { useMediaQuery } from "@/hooks"
import { useItineraryStore } from "@/stores"

import { copyTextToClipboard } from "../clipboard"
import { CopySharedItineraryDialog } from "../components/copy-shared-itinerary-dialog"

type MobileTab = "itinerary" | "map" | "validation"

const loadRouteMap = () => import("@/features/planner/components/route-map")
const RouteMap = lazy(() =>
  loadRouteMap().then((module) => ({ default: module.RouteMap }))
)

interface SharedItineraryPageProps {
  itinerary: Itinerary
  onOpenLocal: () => void
}

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

export const SharedItineraryPage: FC<SharedItineraryPageProps> = ({
  itinerary,
  onOpenLocal,
}) => {
  const localItinerary = useItineraryStore((state) => state.itinerary)
  const copySharedItinerary = useItineraryStore(
    (state) => state.copySharedItinerary
  )
  const [copyDialogOpen, setCopyDialogOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [mobileTab, setMobileTab] = useState<MobileTab>("itinerary")
  const [desktopMapReady, setDesktopMapReady] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const validation = useMemo(() => validateItinerary(itinerary), [itinerary])
  const hasLocalItinerary = useMemo(
    () => !areItinerariesEqual(localItinerary, createEmptyItinerary()),
    [localItinerary]
  )

  useEffect(() => {
    if (!isDesktop) return

    const timeout = window.setTimeout(() => {
      setDesktopMapReady(true)
      void loadRouteMap()
    }, 150)

    return () => window.clearTimeout(timeout)
  }, [isDesktop])

  const copySharedLink = async () => {
    const copied = await copyTextToClipboard(window.location.href)
    setLinkCopied(copied)
  }

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-[#f7f8f6]">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="mx-auto flex min-h-16 max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground">
                <Globe2 aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold tracking-tight">
                    {APP_CONFIG.name}
                  </p>
                  <Badge variant="secondary">Read-only share</Badge>
                </div>
                <p className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  This snapshot cannot change the plan saved in your browser
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Button onClick={onOpenLocal} variant="ghost">
                Open my itinerary
              </Button>
              <Button
                aria-label="Copy shared link"
                onClick={copySharedLink}
                variant="outline"
              >
                {linkCopied ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {linkCopied ? "Copied" : "Copy link"}
                </span>
              </Button>
              <Button onClick={() => setCopyDialogOpen(true)}>
                <PencilLine aria-hidden="true" />
                Copy and edit
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mb-5">
            <p className="text-[10px] font-medium tracking-[0.18em] text-primary uppercase">
              Shared route snapshot
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Review the itinerary and its route checks.
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              You can explore the map and validation details. Copy the plan to
              your browser when you want to make changes.
            </p>
          </div>

          <SummaryStrip itinerary={itinerary} validation={validation} />

          {isDesktop ? (
            <div className="mt-5 grid grid-cols-[minmax(0,3fr)_minmax(340px,2fr)] items-start gap-5">
              <ItineraryPanel
                itinerary={itinerary}
                readOnly
                validation={validation}
              />
              <PlannerAside
                routeMap={
                  desktopMapReady ? (
                    <Suspense fallback={<MapFallback />}>
                      <RouteMap flights={itinerary.flights} />
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
              onValueChange={(value) =>
                value && setMobileTab(value as MobileTab)
              }
              value={mobileTab}
            >
              <TabsList className="grid h-11 w-full grid-cols-3">
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
                  itinerary={itinerary}
                  readOnly
                  validation={validation}
                />
              </TabsContent>
              <TabsContent className="mt-4" value="map">
                {mobileTab === "map" ? (
                  <Suspense fallback={<MapFallback />}>
                    <RouteMap flights={itinerary.flights} />
                  </Suspense>
                ) : null}
              </TabsContent>
              <TabsContent className="mt-4" value="validation">
                <ValidationPanel validation={validation} />
              </TabsContent>
            </Tabs>
          )}
        </main>

        <footer className="mx-auto max-w-[1600px] px-4 py-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Unofficial planning tool. Final eligibility is determined by oneworld
          and the ticketing carrier.
        </footer>

        <CopySharedItineraryDialog
          hasLocalItinerary={hasLocalItinerary}
          localItinerary={localItinerary}
          onConfirm={() => {
            copySharedItinerary(itinerary)
            onOpenLocal()
          }}
          onOpenChange={setCopyDialogOpen}
          open={copyDialogOpen}
        />
      </div>
    </TooltipProvider>
  )
}
