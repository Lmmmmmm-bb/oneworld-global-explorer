import type { FC } from "react"
import { Globe2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { useItineraryStore } from "@/stores"

export const RouteMapPlaceholder: FC = () => {
  const flightCount = useItineraryStore(
    (state) => state.itinerary.flights.length
  )

  return (
    <Card className="overflow-hidden py-0">
      <div className="page-grid relative grid aspect-[16/9] min-h-64 place-items-center bg-muted/25">
        <div className="absolute inset-[12%] rounded-[50%] border border-primary/20" />
        <div className="absolute inset-[22%] rounded-[50%] border border-primary/10" />
        <div className="relative text-center">
          <Globe2
            aria-hidden="true"
            className="mx-auto size-12 text-primary/55"
          />
          <p className="mt-3 text-xs font-medium">
            {flightCount
              ? `${flightCount} flight${flightCount === 1 ? "" : "s"} ready to map`
              : "Route overview"}
          </p>
        </div>
      </div>
      <CardContent className="border-t py-3 text-[11px] text-muted-foreground">
        A simplified, non-interactive route map will show flights only. Open
        jaws are intentionally omitted.
      </CardContent>
    </Card>
  )
}
