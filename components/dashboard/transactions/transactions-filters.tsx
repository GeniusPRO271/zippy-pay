"use client"

import * as React from "react"
import { format } from "date-fns"
import { IconX, IconSearch } from "@tabler/icons-react"
import { CalendarIcon } from "lucide-react"

import { MultiSelectCombobox } from "../table/filter-dropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { TransactionFilters } from "@/lib/types/transactions"
import { DateRange } from "react-day-picker"

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
  { value: "refunded", label: "Refunded" },
]

interface TransactionsFiltersProps {
  filters: TransactionFilters
  setFilters: React.Dispatch<React.SetStateAction<TransactionFilters>>
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

function DateRangeFilter({
  label,
  from,
  to,
  onChange,
}: {
  label: string
  from?: string
  to?: string
  onChange: (from?: string, to?: string) => void
}) {
  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>()

  const committedRange: DateRange | undefined =
    from || to
      ? { from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined }
      : undefined

  const selectedRange = draftRange ?? committedRange

  const handleDateSelect = (range?: DateRange) => {
    const f = range?.from
    if (!f) return

    if (committedRange?.from && committedRange?.to && !draftRange) {
      setDraftRange({ from: f, to: undefined })
      return
    }

    setDraftRange({ from: f, to: range?.to })

    const t = range?.to
    if (!t) return

    onChange(f.toISOString(), t.toISOString())
    setDraftRange(undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
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
            label
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
  )
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 400,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
} & Omit<React.ComponentProps<"input">, "onChange">) {
  const [value, setValue] = React.useState(initialValue)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(newValue), debounceMs)
  }

  React.useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return <Input value={value} onChange={handleChange} {...props} />
}

export default function TransactionsFilterBar({
  filters,
  setFilters,
  countries,
  merchants,
  providers,
  payMethods,
}: TransactionsFiltersProps) {
  const { options: payMethodOptions, namesToIds, idsToNames } = React.useMemo(
    () => toUniquePayMethodOptions(payMethods),
    [payMethods]
  )

  const hasFilters =
    !!filters.methodType ||
    (filters.payMethodId?.length ?? 0) > 0 ||
    (filters.status?.length ?? 0) > 0 ||
    (filters.merchantId?.length ?? 0) > 0 ||
    (filters.providerId?.length ?? 0) > 0 ||
    (filters.countryId?.length ?? 0) > 0 ||
    !!filters.requestDateFrom ||
    !!filters.requestDateTo ||
    !!filters.transferDateFrom ||
    !!filters.transferDateTo ||
    !!filters.searchName ||
    !!filters.searchEmail ||
    !!filters.searchIdDocument ||
    filters.amountMin !== undefined ||
    filters.amountMax !== undefined ||
    !!filters.searchZippyId ||
    !!filters.searchMerchantId

  const handleReset = () => {
    setFilters({
      methodType: undefined,
      payMethodId: [],
      status: [],
      merchantId: [],
      providerId: [],
      countryId: [],
      requestDateFrom: undefined,
      requestDateTo: undefined,
      transferDateFrom: undefined,
      transferDateTo: undefined,
      searchName: undefined,
      searchEmail: undefined,
      searchIdDocument: undefined,
      amountMin: undefined,
      amountMax: undefined,
      searchZippyId: undefined,
      searchMerchantId: undefined,
    })
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Multi-select filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.methodType ?? "all"}
          onValueChange={(val) =>
            setFilters((prev) => ({
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

        <MultiSelectCombobox
          label="PayMethod"
          options={payMethodOptions}
          value={idsToNames(filters.payMethodId || [])}
          onChange={(names) =>
            setFilters((prev) => ({ ...prev, payMethodId: namesToIds(names) }))
          }
          showSelectAll
        />

        <MultiSelectCombobox
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status || []}
          onChange={(values) =>
            setFilters((prev) => ({ ...prev, status: values }))
          }
          showSelectAll
        />

        <MultiSelectCombobox
          label="Merchant"
          options={toOptions(merchants, "id", "name")}
          value={filters.merchantId || []}
          onChange={(values) =>
            setFilters((prev) => ({ ...prev, merchantId: values }))
          }
          showSelectAll
        />

        <MultiSelectCombobox
          label="Provider"
          options={toOptions(providers, "id", "name")}
          value={filters.providerId || []}
          onChange={(values) =>
            setFilters((prev) => ({ ...prev, providerId: values }))
          }
          showSelectAll
        />

        <MultiSelectCombobox
          label="Country"
          options={toOptions(countries, "id", "name")}
          value={filters.countryId || []}
          onChange={(values) =>
            setFilters((prev) => ({ ...prev, countryId: values }))
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

      {/* Row 2: Date ranges + text search + amount range */}
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter
          label="Request Date"
          from={filters.requestDateFrom}
          to={filters.requestDateTo}
          onChange={(from, to) =>
            setFilters((prev) => ({
              ...prev,
              requestDateFrom: from,
              requestDateTo: to,
            }))
          }
        />

        <DateRangeFilter
          label="Transfer Date"
          from={filters.transferDateFrom}
          to={filters.transferDateTo}
          onChange={(from, to) =>
            setFilters((prev) => ({
              ...prev,
              transferDateFrom: from,
              transferDateTo: to,
            }))
          }
        />

        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={filters.searchName ?? ""}
            onChange={(v) => setFilters((prev) => ({ ...prev, searchName: v || undefined }))}
            placeholder="Name"
            className="h-8 w-[130px] pl-8 text-sm"
          />
        </div>

        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={filters.searchEmail ?? ""}
            onChange={(v) => setFilters((prev) => ({ ...prev, searchEmail: v || undefined }))}
            placeholder="Email"
            className="h-8 w-[150px] pl-8 text-sm"
          />
        </div>

        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={filters.searchIdDocument ?? ""}
            onChange={(v) => setFilters((prev) => ({ ...prev, searchIdDocument: v || undefined }))}
            placeholder="ID Document"
            className="h-8 w-[130px] pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="Min $"
            className="h-8 w-[90px] text-sm"
            value={filters.amountMin ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                amountMin: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="number"
            placeholder="Max $"
            className="h-8 w-[90px] text-sm"
            value={filters.amountMax ?? ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                amountMax: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>

        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={filters.searchZippyId ?? ""}
            onChange={(v) => setFilters((prev) => ({ ...prev, searchZippyId: v || undefined }))}
            placeholder="Zippy ID"
            className="h-8 w-[130px] pl-8 text-sm"
          />
        </div>

        <div className="relative">
          <IconSearch size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <DebouncedInput
            value={filters.searchMerchantId ?? ""}
            onChange={(v) => setFilters((prev) => ({ ...prev, searchMerchantId: v || undefined }))}
            placeholder="Merchant Internal ID"
            className="h-8 w-[130px] pl-8 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
