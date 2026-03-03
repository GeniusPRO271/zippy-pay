"use client"

import * as React from "react"
import { format } from "date-fns"
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
import { OperationsFilters } from "@/lib/types/operations"
import { DateRange } from "react-day-picker"

const STATUS_OPTIONS = [
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "refunded", label: "Refunded" },
]

interface OperationsFiltersProps {
  columnFilters: OperationsFilters
  setColumnFilters: React.Dispatch<React.SetStateAction<OperationsFilters>>
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
  hideDatePicker?: boolean
}

export default function OperationsFilterBar({
  countries,
  merchants,
  columnFilters,
  setColumnFilters,
  payMethods,
  providers,
  hideDatePicker = false,
}: OperationsFiltersProps) {
  const currencyOptions = React.useMemo(() => {
    return [...new Set(countries.map((c) => c.currency))].sort()
  }, [countries])

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
      (columnFilters.providerId?.length || 0) +
      (columnFilters.status?.length || 0) >
      0 ||
    !!columnFilters.from ||
    !!columnFilters.to ||
    !!columnFilters.methodType

  const handleReset = () => {
    const toDate = new Date()
    const fromDate = new Date(toDate)
    fromDate.setDate(toDate.getDate() - 30)

    setDraftRange(undefined)
    setColumnFilters({
      merchantId: [],
      providerId: [],
      countryId: [],
      payMethodId: [],
      status: [],
      methodType: undefined,
      currency: "CLP",
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })
  }

  const selectedRange: DateRange | undefined = draftRange ?? committedRange

  const handleDateSelect = (range?: DateRange) => {
    const from = range?.from
    if (!from) return

    if (committedRange?.from && committedRange?.to && !draftRange) {
      setDraftRange({ from, to: undefined })
      return
    }

    setDraftRange({ from, to: range?.to })

    const to = range?.to
    if (!to) return

    setColumnFilters((prev) => ({
      ...prev,
      from: from.toISOString(),
      to: to.toISOString(),
    }))

    setDraftRange(undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 transition-all">
      {!hideDatePicker && (
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
                "Pick a date range"
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
      )}

      <Select
        value={columnFilters.methodType ?? "all"}
        onValueChange={(val) =>
          setColumnFilters((prev) => ({
            ...prev,
            methodType: val === "all" ? undefined : (val as "payin" | "payout"),
          }))
        }
      >
        <SelectTrigger size="sm" className="w-[140px]">
          <SelectValue placeholder="Method Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="payin">Payin</SelectItem>
          <SelectItem value="payout">Payout</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={columnFilters.currency ?? "CLP"}
        onValueChange={(val) =>
          setColumnFilters((prev) => ({
            ...prev,
            currency: val,
          }))
        }
      >
        <SelectTrigger size="sm" className="w-[120px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((cur) => (
            <SelectItem key={cur} value={cur}>
              {cur}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <MultiSelectCombobox
        label="Status"
        options={STATUS_OPTIONS}
        value={columnFilters.status || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, status: values }))
        }
        showSelectAll
      />

      <MultiSelectCombobox
        label="PayMethod"
        options={payMethodOptions}
        value={idsToNames(columnFilters.payMethodId || [])}
        onChange={(names) =>
          setColumnFilters((prev) => ({ ...prev, payMethodId: namesToIds(names) }))
        }
        showSelectAll
      />

      <MultiSelectCombobox
        label="Merchant"
        options={toOptions(merchants, "id", "name")}
        value={columnFilters.merchantId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, merchantId: values }))
        }
        showSelectAll
      />

      <MultiSelectCombobox
        label="Provider"
        options={toOptions(providers, "id", "name")}
        value={columnFilters.providerId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, providerId: values }))
        }
        showSelectAll
      />

      <MultiSelectCombobox
        label="Country"
        options={toOptions(countries, "id", "name")}
        value={columnFilters.countryId || []}
        onChange={(values) =>
          setColumnFilters((prev) => ({ ...prev, countryId: values }))
        }
        showSelectAll
      />

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
