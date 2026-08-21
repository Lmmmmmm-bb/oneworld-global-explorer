import { useMemo, useState, type FC } from "react"
import { ChevronsUpDown, MapPin } from "lucide-react"

import { AirlineLogo } from "@/components/airline-logo"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Airport } from "@/features/route-data"
import { searchAirports } from "@/features/route-data"
import { cn } from "@/lib/utils"

interface AirportComboboxProps {
  label: string
  value: string
  candidates: Airport[]
  onChange: (airport: Airport) => void
  carrierCodes?: Map<string, string[]>
  disabled?: boolean
  placeholder?: string
}

export const AirportCombobox: FC<AirportComboboxProps> = ({
  label,
  value,
  candidates,
  onChange,
  carrierCodes,
  disabled = false,
  placeholder = "Choose airport",
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const selected = candidates.find((airport) => airport.iata === value)
  const results = useMemo(
    () => searchAirports(candidates, query),
    [candidates, query]
  )

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) setQuery("")
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </span>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              className={cn(
                "h-10 w-full min-w-0 justify-between px-3 text-left font-normal",
                !selected && "text-muted-foreground"
              )}
              type="button"
              variant="outline"
            />
          }
        >
          <span className="min-w-0 flex-1 truncate">
            {selected ? (
              <>
                <span className="font-semibold text-foreground">
                  {selected.iata}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  · {selected.city}
                </span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown aria-hidden="true" className="size-3.5 shrink-0" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
          sideOffset={6}
        >
          <Command className="rounded-none p-0" shouldFilter={false}>
            <CommandInput
              autoFocus
              onValueChange={setQuery}
              placeholder="Search code, city, or airport…"
              value={query}
            />
            <CommandList className="max-h-[min(48svh,320px)]">
              <CommandEmpty>No eligible airports found.</CommandEmpty>
              <CommandGroup>
                {results.map((airport) => {
                  const airportCarrierCodes = carrierCodes?.get(airport.iata)
                  const visibleCarrierCodes = airportCarrierCodes?.slice(0, 3)
                  return (
                    <CommandItem
                      className="min-h-11"
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
                          {airport.iata} · {airport.city}
                        </span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {airport.name}, {airport.country}
                        </span>
                      </span>
                      {airportCarrierCodes?.length ? (
                        <span
                          aria-label={`${airportCarrierCodes.length} ${
                            airportCarrierCodes.length === 1
                              ? "carrier"
                              : "carriers"
                          }: ${airportCarrierCodes.join(", ")}`}
                          className="flex shrink-0 items-center gap-1"
                          role="img"
                        >
                          {visibleCarrierCodes?.map((code) => (
                            <AirlineLogo
                              className="size-5 rounded-sm"
                              code={code}
                              key={code}
                              title={code}
                            />
                          ))}
                          {airportCarrierCodes.length > 3 ? (
                            <span
                              className="grid size-5 shrink-0 place-items-center rounded-sm bg-muted text-[8px] font-semibold text-muted-foreground ring-1 ring-border/70"
                              title={`${airportCarrierCodes.length - 3} more carriers`}
                            >
                              +{airportCarrierCodes.length - 3}
                            </span>
                          ) : null}
                        </span>
                      ) : null}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
