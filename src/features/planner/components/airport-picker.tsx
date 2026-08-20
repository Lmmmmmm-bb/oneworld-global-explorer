import { useMemo, useState, type FC } from "react"
import { ChevronsUpDown, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Airport } from "@/features/route-data"
import { searchAirports } from "@/features/route-data"
import { cn } from "@/lib/utils"

interface AirportPickerProps {
  label: string
  value: string
  candidates: Airport[]
  onChange: (airport: Airport) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  carrierCounts?: Map<string, number>
  disabled?: boolean
  placeholder?: string
}

export const AirportPicker: FC<AirportPickerProps> = ({
  label,
  value,
  candidates,
  onChange,
  onOpenChange,
  open,
  carrierCounts,
  disabled = false,
  placeholder = "Choose an airport",
}) => {
  const [query, setQuery] = useState("")
  const selected = candidates.find((airport) => airport.iata === value)
  const results = useMemo(
    () => searchAirports(candidates, query),
    [candidates, query]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) setQuery("")
  }

  return (
    <div className="min-w-0 space-y-2">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <Button
          aria-haspopup="dialog"
          className={cn(
            "h-auto min-h-11 min-w-0 w-full justify-between overflow-hidden px-3 py-2 text-left font-normal",
            !selected && "text-muted-foreground"
          )}
          disabled={disabled}
          onClick={() => handleOpenChange(true)}
          type="button"
          variant="outline"
        >
          {selected ? (
            <span className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate font-semibold text-foreground">
                {selected.iata} · {selected.city}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {selected.name}, {selected.country}
              </span>
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate">{placeholder}</span>
          )}
          <ChevronsUpDown aria-hidden="true" className="size-4 shrink-0" />
        </Button>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b p-4 pr-12">
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Search by IATA code, airport, city, or country.
            </DialogDescription>
          </DialogHeader>
          <Command shouldFilter={false} className="rounded-none p-0">
            <CommandInput
              autoFocus
              onValueChange={setQuery}
              placeholder="Search airports…"
              value={query}
            />
            <CommandList className="max-h-[min(60svh,430px)]">
              <CommandEmpty>No eligible airports found.</CommandEmpty>
              <CommandGroup>
                {results.map((airport) => {
                  const carrierCount = carrierCounts?.get(airport.iata)
                  return (
                    <CommandItem
                      className="min-h-12"
                      key={airport.iata}
                      onSelect={() => {
                        onChange(airport)
                        handleOpenChange(false)
                      }}
                      value={`${airport.iata} ${airport.city} ${airport.name} ${airport.country}`}
                    >
                      <MapPin aria-hidden="true" className="text-primary" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {airport.city} · {airport.iata}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {airport.name}, {airport.country}
                        </span>
                      </span>
                      {carrierCount ? (
                        <span className="text-[10px] text-muted-foreground">
                          {carrierCount}{" "}
                          {carrierCount === 1 ? "carrier" : "carriers"}
                        </span>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  )
}
