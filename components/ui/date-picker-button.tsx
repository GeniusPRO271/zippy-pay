"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DateRange } from "react-day-picker"

type Filters = {
  dateRange?: DateRange
  dateRangeTrx: DateRange
}

export function RangePickerButton({
  filters,
  setFilters,
}: {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
}) {
  const [open, setOpen] = React.useState(false)
  const dateRange = filters.dateRangeTrx

  const value =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "dd MMMM yyyy")} - ${format(
        dateRange.to,
        "dd MMMM yyyy"
      )}`
      : ""

  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={value}
          placeholder="Select a date range"
          className="text-sm bg-background pr-10"
          readOnly
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              mode="range"
              selected={dateRange}
              defaultMonth={dateRange?.from ?? new Date()}
              onSelect={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  dateRange: range ?? prev.dateRange,
                  dateRangeTrx: range ?? prev.dateRangeTrx,
                }))
              }}
              className="rounded-lg border shadow-sm"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
