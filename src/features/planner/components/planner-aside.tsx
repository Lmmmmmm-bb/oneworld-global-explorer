import type { FC } from "react"
import { CheckCircle2, Globe2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const PlannerAside: FC = () => (
  <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
    <Card className="overflow-hidden py-0">
      <div className="page-grid relative grid aspect-[16/8] place-items-center bg-muted/25">
        <div className="absolute inset-5 rounded-[50%] border border-primary/20" />
        <div className="absolute inset-10 rounded-[50%] border border-primary/10" />
        <Globe2 aria-hidden="true" className="size-12 text-primary/55" />
      </div>
      <CardContent className="border-t py-3 text-xs text-muted-foreground">
        Route overview will appear as flights are added.
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <CheckCircle2 aria-hidden="true" className="size-4 text-primary" />
          Route validation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Add at least three counted segments to begin route validation.
        </p>
      </CardContent>
    </Card>
  </aside>
)
