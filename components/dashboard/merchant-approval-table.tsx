"use client"

import { useState, useMemo } from "react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { MultiSelectCombobox } from "./table/filter-dropdown"
import { toOptions } from "@/lib/utils"
import { Country } from "@/lib/types/country"
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useApprovalRates } from "@/hooks/statistics/useStats"
import type {
  MerchantApprovalData,
  MerchantMethodDayData,
  StatsFilters,
} from "@/lib/types/statistics"

const DAYS_PER_PAGE = 5
const SERVER_PAGE_SIZE = 15

interface MerchantApprovalTableProps {
  filters?: StatsFilters
  countries: Country[]
}

interface FlatRow {
  merchantName: string
  method: string
  isFirstMethodOfMerchant: boolean
  merchantMethodCount: number
  dailyData: MerchantMethodDayData[]
}

function getApprovalRateColor(rate: number) {
  if (rate >= 80) return "text-green-600"
  if (rate >= 50) return "text-yellow-600"
  return "text-red-600"
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
  return `${startStr} - ${endStr}`
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function deriveAllDates(data: MerchantApprovalData[]): string[] {
  const dateSet = new Set<string>()
  data.forEach((m) =>
    m.methods.forEach((method) =>
      method.dailyData.forEach((d) => dateSet.add(d.date))
    )
  )
  return Array.from(dateSet).sort()
}

function flattenRows(data: MerchantApprovalData[]): FlatRow[] {
  const rows: FlatRow[] = []
  data.forEach((merchant) => {
    merchant.methods.forEach((method, idx) => {
      rows.push({
        merchantName: merchant.merchantName,
        method: method.method,
        isFirstMethodOfMerchant: idx === 0,
        merchantMethodCount: merchant.methods.length,
        dailyData: method.dailyData,
      })
    })
  })
  return rows
}

export default function MerchantApprovalTable({
  filters,
  countries,
}: MerchantApprovalTableProps) {
  // Server-side pagination: page 1 = most recent 15 days
  const [serverPage, setServerPage] = useState(1)
  // Client-side offset within the current server page's dates
  const [dayOffset, setDayOffset] = useState<number | null>(null)
  // Local country filter for this widget
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([])

  const mergedFilters = useMemo(() => {
    const base = filters ?? ({} as StatsFilters)
    return {
      ...base,
      countryId: selectedCountryIds.length > 0 ? selectedCountryIds : base.countryId,
    }
  }, [filters, selectedCountryIds])

  const { data: response, isFetching } = useApprovalRates(
    serverPage,
    SERVER_PAGE_SIZE,
    mergedFilters
  )

  const approvalData = response?.data ?? []
  const pagination = response?.pagination

  const allDates = useMemo(() => deriveAllDates(approvalData), [approvalData])
  const flatRows = useMemo(() => flattenRows(approvalData), [approvalData])

  // Initialize dayOffset to show the most recent 5 days of this page
  const effectiveDayOffset =
    dayOffset !== null
      ? dayOffset
      : Math.max(0, allDates.length - DAYS_PER_PAGE)

  const visibleDates = allDates.slice(
    effectiveDayOffset,
    effectiveDayOffset + DAYS_PER_PAGE
  )

  const totalPages = pagination?.totalPages ?? 1

  // Can go left (older): either there are more days in this page, or there's a next server page
  const canGoLeft =
    effectiveDayOffset > 0 || serverPage < totalPages
  // Can go right (newer): either there are more days in this page, or there's a previous server page (closer to today)
  const canGoRight =
    effectiveDayOffset + DAYS_PER_PAGE < allDates.length || serverPage > 1

  const goLeft = () => {
    if (effectiveDayOffset - DAYS_PER_PAGE >= 0) {
      // Still within current server page
      setDayOffset(effectiveDayOffset - DAYS_PER_PAGE)
    } else if (serverPage < totalPages) {
      // Need older data from next server page
      setServerPage((prev) => prev + 1)
      // Show the rightmost (most recent) slice of the new page
      setDayOffset(null)
    }
  }

  const goRight = () => {
    if (effectiveDayOffset + DAYS_PER_PAGE < allDates.length) {
      // Still within current server page
      setDayOffset(effectiveDayOffset + DAYS_PER_PAGE)
    } else if (serverPage > 1) {
      // Need newer data from previous server page (closer to today)
      setServerPage((prev) => prev - 1)
      // Show the leftmost (oldest) slice of the new page
      setDayOffset(0)
    }
  }

  const dateRangeLabel =
    visibleDates.length > 0
      ? formatDateRange(
          visibleDates[0],
          visibleDates[visibleDates.length - 1]
        )
      : ""

  const totalColumns = 2 + visibleDates.length

  return (
    <Card className="w-full h-[600px]">
      <CardHeader>
        <CardTitle>Merchant Approval Rates</CardTitle>
        <CardDescription>
          Daily approval rate breakdown per merchant and payment method
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <MultiSelectCombobox
              label="Country"
              options={toOptions(countries, "id", "name")}
              value={selectedCountryIds}
              onChange={(values) => {
                setSelectedCountryIds(values)
                setServerPage(1)
                setDayOffset(null)
              }}
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goLeft}
              disabled={!canGoLeft || isFetching}
            >
              <IconArrowLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px] text-center">
              {isFetching ? "Loading..." : dateRangeLabel}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goRight}
              disabled={!canGoRight || isFetching}
            >
              <IconArrowRight size={16} />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        {isFetching ? (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="border-r min-w-[140px] bg-card">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="border-r min-w-[120px] bg-card">
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                {Array.from({ length: DAYS_PER_PAGE }).map((_, i) => (
                  <TableHead
                    key={i}
                    className="text-center border-r min-w-[130px] bg-card"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <TableRow key={rowIdx}>
                  <TableCell className="border-r min-w-[140px]">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="border-r min-w-[120px]">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  {Array.from({ length: DAYS_PER_PAGE }).map((_, colIdx) => (
                    <TableCell
                      key={colIdx}
                      className="border-r text-center"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3 w-14" />
                        <Skeleton className="h-3 w-10" />
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="border-r min-w-[140px] bg-card">
                  Merchant
                </TableHead>
                <TableHead className="border-r min-w-[120px] bg-card">
                  Method
                </TableHead>
                {visibleDates.map((date) => (
                  <TableHead
                    key={date}
                    className="text-center border-r min-w-[130px] bg-card"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {formatShortDate(date)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Rate / Trx / Providers
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {flatRows.length > 0 ? (
                flatRows.map((row, index) => (
                  <TableRow
                    key={`${row.merchantName}-${row.method}-${index}`}
                    className={
                      row.isFirstMethodOfMerchant ? "border-t-2" : "border-b-0"
                    }
                  >
                    <TableCell className="font-medium align-top border-r">
                      {row.isFirstMethodOfMerchant ? row.merchantName : ""}
                    </TableCell>
                    <TableCell className="font-medium border-r">
                      {row.method}
                    </TableCell>
                    {visibleDates.map((date) => {
                      const dayData = row.dailyData.find(
                        (d) => d.date === date
                      )
                      return (
                        <TableCell
                          key={date}
                          className="border-r text-center"
                        >
                          {dayData ? (
                            <div className="flex flex-col gap-1">
                              <span
                                className={`font-semibold text-sm ${getApprovalRateColor(dayData.approvalRate)}`}
                              >
                                {dayData.approvalRate.toFixed(1)}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {dayData.numTransactions.toLocaleString()} trx
                              </span>
                              <div className="flex flex-wrap gap-0.5 justify-center">
                                {dayData.providersUsed.map((provider) => (
                                  <Badge
                                    key={provider}
                                    variant="outline"
                                    className="text-[10px] px-1 py-0"
                                  >
                                    {provider}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              --
                            </span>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={totalColumns}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
