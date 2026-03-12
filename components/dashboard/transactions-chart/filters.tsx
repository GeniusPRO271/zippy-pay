"use client"

import * as React from "react"
import { differenceInCalendarDays, format } from "date-fns"
import { IconX } from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"

import { MultiSelectCombobox } from "../table/filter-dropdown"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, toOptions, toUniquePayMethodOptions } from "@/lib/utils"
import { Merchant } from "@/lib/types/merchant"
import { Provider } from "@/lib/types/provider"
import { PayMethod } from "@/lib/types/payMethod"
import { Country } from "@/lib/types/country"
import { StatsFilters } from "@/lib/types/statistics"
import { DateRange } from "react-day-picker"

interface TableFiltersProps {
  columnFilters: StatsFilters
  setColumnFilters: React.Dispatch<React.SetStateAction<StatsFilters>>
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

const MAX_RANGE_DAYS = 30

function TransactionsChartFilters({
  countries,
  merchants,
  columnFilters,
  setColumnFilters,
  payMethods,
  providers,
}: TableFiltersProps) {
  const { options: payMethodOptions, namesToIds, idsToNames } = React.useMemo(
    () => toUniquePayMethodOptions(payMethods),
    [payMethods]
  )

  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()

  const committedRange: DateRange | undefined =
    columnFilters.from || columnFilters.to
      ? {
        from: columnFilters.from
          ? new Date(columnFilters.from)
          : undefined,
        to: columnFilters.to ? new Date(columnFilters.to) : undefined,
      }
      : undefined

  const hasFilters =
    (columnFilters.payMethodId?.length || 0) +
    (columnFilters.countryId?.length || 0) +
    (columnFilters.merchantId?.length || 0) +
    (columnFilters.providerId?.length || 0) >
    0 ||
    !!columnFilters.from ||
    !!columnFilters.to

  const handleReset = () => {
    setDraftRange(undefined)
    setColumnFilters({
      merchantId: [],
      providerId: [],
      countryId: [],
      payMethodId: [],
      from: undefined,
      to: undefined,
    })
  }

  const selectedRange: DateRange | undefined = draftRange ?? committedRange

  const handleDateSelect = (range?: DateRange) => {
    const from = range?.from
    if (!from) return

    // If a full range is already committed, start a new draft range on first click
    if (committedRange?.from && committedRange?.to && !draftRange) {
      setDraftRange({ from, to: undefined })
      return
    }

    // Keep showing draft while user is picking
    setDraftRange({ from, to: range?.to })

    const to = range?.to
    if (!to) return

    const days = differenceInCalendarDays(to, from)
    if (days > MAX_RANGE_DAYS) return

    setColumnFilters((prev) => ({
      ...prev,
      from: from.toISOString(),
      to: to.toISOString(),
    }))

    setDraftRange(undefined)
  }

  return (
    <div className="flex flex-wrap gap-2 transition-all">
      <MultiSelectCombobox
        label="PayMethod"
        options={payMethodOptions}
        value={idsToNames(columnFilters.payMethodId || [])}
        onChange={(names) =>
          setColumnFilters((prev) => ({ ...prev, payMethodId: namesToIds(names) }))
        }
      />

      <MultiSelectCombobox
        label="Merchant"
        options={toOptions(merchants, "id", "name")}
        value={columnFilters.merchantId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, merchantId: values }))
        }
      />

      <MultiSelectCombobox
        label="Country"
        options={toOptions(countries, "id", "name")}
        value={columnFilters.countryId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, countryId: values }))
        }
      />

      <MultiSelectCombobox
        label="Provider"
        options={toOptions(providers, "id", "name")}
        value={columnFilters.providerId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, providerId: values }))
        }
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedRange?.from ? (
              selectedRange.to ? (
                <>
                  {format(selectedRange.from, "LLL dd, y")} –{" "}
                  {format(selectedRange.to, "LLL dd, y")}
                </>
              ) : (
                format(selectedRange.from, "LLL dd, y")
              )
            ) : (
              "Pick a date range (max 30 days)"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={selectedRange}
            onSelect={handleDateSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Select
        value={columnFilters.comparisonType ?? "previous_period"}
        onValueChange={(value) =>
          setColumnFilters((prev) => ({
            ...prev,
            comparisonType: value as "previous_period" | "previous_month" | "previous_year",
          }))
        }
      >
        <SelectTrigger className="w-[180px] h-8 text-sm">
          <SelectValue placeholder="Compare with..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="previous_period">Previous Period</SelectItem>
          <SelectItem value="previous_month">Previous Month</SelectItem>
          <SelectItem value="previous_year">Previous Year</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          onClick={handleReset}
          className="text-sm cursor-pointer"
          size="sm"
          variant="ghost"
        >
          Reset
          <IconX size={12} />
        </Button>
      )}
    </div>
  )
}

export default TransactionsChartFilters
