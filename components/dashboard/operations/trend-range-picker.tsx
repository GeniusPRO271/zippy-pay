"use client"

import * as React from "react"
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  format,
  isBefore,
  isAfter,
  isSameDay,
  isSameMonth,
} from "date-fns"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { AggregationLevel } from "@/lib/types/operations/trends"
import { DateRange } from "react-day-picker"

interface TrendRangePickerProps {
  aggregation: AggregationLevel
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}

// ─── Day Picker ──────────────────────────────────────────

function DayRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}) {
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()

  const committedRange: DateRange = {
    from: new Date(from),
    to: new Date(to),
  }

  const selectedRange = draftRange ?? committedRange

  const handleSelect = (range?: DateRange) => {
    const f = range?.from
    if (!f) return

    if (committedRange.from && committedRange.to && !draftRange) {
      setDraftRange({ from: f, to: undefined })
      return
    }

    setDraftRange({ from: f, to: range?.to })

    const t = range?.to
    if (!t) return

    if (differenceInCalendarDays(t, f) > 30) return

    onChange({ from: f.toISOString(), to: t.toISOString() })
    setDraftRange(undefined)
  }

  return (
    <Calendar
      mode="range"
      selected={selectedRange}
      onSelect={handleSelect}
      numberOfMonths={2}
    />
  )
}

// ─── Week Picker ─────────────────────────────────────────

interface WeekEntry {
  monday: Date
  sunday: Date
  label: string
}

function generateWeeks(count: number): WeekEntry[] {
  const weeks: WeekEntry[] = []
  const now = new Date()
  const currentMonday = startOfWeek(now, { weekStartsOn: 1 })

  for (let i = count - 1; i >= 0; i--) {
    const monday = addWeeks(currentMonday, -i)
    const sunday = endOfWeek(monday, { weekStartsOn: 1 })
    weeks.push({
      monday,
      sunday,
      label: `${format(monday, "MMM dd")} – ${format(sunday, "MMM dd")}`,
    })
  }
  return weeks
}

function WeekRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}) {
  const weeks = React.useMemo(() => generateWeeks(52), [])
  const [selectionStart, setSelectionStart] = React.useState<Date | null>(null)

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const handleWeekClick = (week: WeekEntry) => {
    if (!selectionStart) {
      setSelectionStart(week.monday)
      return
    }

    let start = selectionStart
    let end = week.monday

    if (isAfter(start, end)) {
      ;[start, end] = [end, start]
    }

    const weekDiff = differenceInCalendarWeeks(end, start, { weekStartsOn: 1 })
    if (weekDiff > 26) {
      setSelectionStart(week.monday)
      return
    }

    const endSunday = endOfWeek(end, { weekStartsOn: 1 })
    onChange({ from: start.toISOString(), to: endSunday.toISOString() })
    setSelectionStart(null)
  }

  const isInRange = (monday: Date) => {
    if (selectionStart) {
      return isSameDay(monday, selectionStart)
    }
    const weekStart = startOfWeek(fromDate, { weekStartsOn: 1 })
    const weekEnd = startOfWeek(toDate, { weekStartsOn: 1 })
    return (
      (isSameDay(monday, weekStart) || isAfter(monday, weekStart)) &&
      (isSameDay(monday, weekEnd) || isBefore(monday, weekEnd))
    )
  }

  const isRangeStart = (monday: Date) => {
    if (selectionStart) return isSameDay(monday, selectionStart)
    return isSameDay(monday, startOfWeek(fromDate, { weekStartsOn: 1 }))
  }

  const isRangeEnd = (monday: Date) => {
    if (selectionStart) return isSameDay(monday, selectionStart)
    return isSameDay(monday, startOfWeek(toDate, { weekStartsOn: 1 }))
  }

  let lastMonthLabel = ""

  return (
    <div className="h-[300px] w-[280px] overflow-y-auto">
      <div className="flex flex-col gap-0.5 p-2">
        {weeks.map((week) => {
          const monthLabel = format(week.monday, "MMMM yyyy")
          const showHeader = monthLabel !== lastMonthLabel
          lastMonthLabel = monthLabel

          const inRange = isInRange(week.monday)
          const isStart = isRangeStart(week.monday)
          const isEnd = isRangeEnd(week.monday)

          return (
            <React.Fragment key={week.monday.toISOString()}>
              {showHeader && (
                <div className="text-xs font-medium text-muted-foreground px-2 pt-2 pb-1">
                  {monthLabel}
                </div>
              )}
              <button
                type="button"
                onClick={() => handleWeekClick(week)}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors cursor-pointer",
                  inRange && !isStart && !isEnd &&
                    "bg-accent text-accent-foreground",
                  (isStart || isEnd) &&
                    "bg-primary text-primary-foreground",
                  !inRange &&
                    "hover:bg-accent/50"
                )}
              >
                <span>{week.label}</span>
                <span className="text-xs opacity-60">
                  {format(week.monday, "yyyy")}
                </span>
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ─── Month Picker ────────────────────────────────────────

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

function MonthRangePicker({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}) {
  const currentYear = new Date().getFullYear()
  const [displayYear, setDisplayYear] = React.useState(currentYear)
  const [selectionStart, setSelectionStart] = React.useState<Date | null>(null)

  const fromDate = new Date(from)
  const toDate = new Date(to)

  const handleMonthClick = (monthIndex: number) => {
    const clicked = new Date(displayYear, monthIndex, 1)

    if (!selectionStart) {
      setSelectionStart(clicked)
      return
    }

    let start = selectionStart
    let end = clicked

    if (isAfter(start, end)) {
      ;[start, end] = [end, start]
    }

    const monthDiff = differenceInCalendarMonths(end, start)
    if (monthDiff > 24) {
      setSelectionStart(clicked)
      return
    }

    const endOfMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0)
    onChange({ from: start.toISOString(), to: endOfMonth.toISOString() })
    setSelectionStart(null)
  }

  const isInRange = (monthDate: Date) => {
    if (selectionStart) {
      return isSameMonth(monthDate, selectionStart)
    }
    const fromMonth = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
    const toMonth = new Date(toDate.getFullYear(), toDate.getMonth(), 1)
    return (
      (isSameMonth(monthDate, fromMonth) || isAfter(monthDate, fromMonth)) &&
      (isSameMonth(monthDate, toMonth) || isBefore(monthDate, toMonth))
    )
  }

  const isRangeStart = (monthDate: Date) => {
    if (selectionStart) return isSameMonth(monthDate, selectionStart)
    return (
      monthDate.getFullYear() === fromDate.getFullYear() &&
      monthDate.getMonth() === fromDate.getMonth()
    )
  }

  const isRangeEnd = (monthDate: Date) => {
    if (selectionStart) return isSameMonth(monthDate, selectionStart)
    return (
      monthDate.getFullYear() === toDate.getFullYear() &&
      monthDate.getMonth() === toDate.getMonth()
    )
  }

  return (
    <div className="p-3 w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDisplayYear((y) => y - 1)}
        >
          <ChevronLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium">{displayYear}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDisplayYear((y) => y + 1)}
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {MONTH_NAMES.map((name, index) => {
          const monthDate = new Date(displayYear, index, 1)
          const inRange = isInRange(monthDate)
          const isStart = isRangeStart(monthDate)
          const isEnd = isRangeEnd(monthDate)
          const isFuture = isAfter(monthDate, new Date())

          return (
            <button
              key={name}
              type="button"
              disabled={isFuture}
              onClick={() => handleMonthClick(index)}
              className={cn(
                "rounded-md px-2 py-2 text-sm transition-colors cursor-pointer",
                inRange && !isStart && !isEnd &&
                  "bg-accent text-accent-foreground",
                (isStart || isEnd) &&
                  "bg-primary text-primary-foreground",
                !inRange && !isFuture &&
                  "hover:bg-accent/50",
                isFuture && "text-muted-foreground/40 cursor-not-allowed"
              )}
            >
              {name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────

export function TrendRangePicker({
  aggregation,
  from,
  to,
  onChange,
}: TrendRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleChange = (range: { from: string; to: string }) => {
    onChange(range)
    if (aggregation !== "day") {
      setOpen(false)
    }
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  let buttonLabel: string
  switch (aggregation) {
    case "day":
      buttonLabel = `${format(fromDate, "LLL dd, y")} – ${format(toDate, "LLL dd, y")}`
      break
    case "week": {
      const startMonday = startOfWeek(fromDate, { weekStartsOn: 1 })
      const endSunday = endOfWeek(toDate, { weekStartsOn: 1 })
      buttonLabel = `${format(startMonday, "MMM dd")} – ${format(endSunday, "MMM dd, y")}`
      break
    }
    case "month":
      buttonLabel = `${format(fromDate, "MMM yyyy")} – ${format(toDate, "MMM yyyy")}`
      break
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {aggregation === "day" && (
          <DayRangePicker from={from} to={to} onChange={handleChange} />
        )}
        {aggregation === "week" && (
          <WeekRangePicker from={from} to={to} onChange={handleChange} />
        )}
        {aggregation === "month" && (
          <MonthRangePicker from={from} to={to} onChange={handleChange} />
        )}
      </PopoverContent>
    </Popover>
  )
}
