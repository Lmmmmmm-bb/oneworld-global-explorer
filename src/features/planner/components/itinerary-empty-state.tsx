import type { FC } from "react"
import { ArrowRight, MapPin, Plus, Route } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ItineraryEmptyStateProps = {
  onAddFlight?: () => void
}

export const ItineraryEmptyState: FC<ItineraryEmptyStateProps> = ({
  onAddFlight,
}) => (
  <Card className="min-h-[430px] justify-center border-dashed bg-card/70">
    <CardHeader className="mx-auto w-full max-w-lg items-center text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center border bg-muted/60">
        <Route aria-hidden="true" className="size-5 text-primary" />
      </div>
      <CardTitle className="text-xl">Build your first route</CardTitle>
      <p className="max-w-md text-sm leading-6 text-muted-foreground">
        Add eligible nonstop flights one by one. Mileage, open jaws and Global
        Explorer route rules will update as you plan.
      </p>
    </CardHeader>
    <CardContent className="mx-auto w-full max-w-md">
      <div className="mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs text-muted-foreground">
        <div className="border bg-background p-3 text-center">
          <MapPin aria-hidden="true" className="mx-auto mb-2 size-4" />
          Choose origin
        </div>
        <ArrowRight aria-hidden="true" className="size-4" />
        <div className="border bg-background p-3 text-center">
          <Route aria-hidden="true" className="mx-auto mb-2 size-4" />
          Add direct route
        </div>
      </div>
      <Button className="w-full" onClick={onAddFlight} size="lg">
        <Plus aria-hidden="true" />
        Add first flight
      </Button>
    </CardContent>
  </Card>
)
