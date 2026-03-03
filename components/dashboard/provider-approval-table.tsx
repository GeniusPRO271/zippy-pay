"use client"

import { useState, useMemo } from "react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
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
import { useApprovalRates } from "@/hooks/statistics/useStats"
import type {
  ProviderApprovalData,
  StatsFilters,
} from "@/lib/types/statistics"

const DAYS_PER_PAGE = 6
const SERVER_PAGE_SIZE = 15

interface ProviderApprovalTableProps {
  filters?: StatsFilters
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

function deriveAllDates(data: ProviderApprovalData[]): string[] {
  const dateSet = new Set<string>()
  data.forEach((p) =>
    p.dailyData.forEach((d) => dateSet.add(d.date))
  )
  return Array.from(dateSet).sort()
}

export default function ProviderApprovalTable({
  filters,
}: ProviderApprovalTableProps) {
  const [serverPage, setServerPage] = useState(1)
  const [dayOffset, setDayOffset] = useState<number | null>(null)

  const { data: response, isLoading } = useApprovalRates(
    serverPage,
    SERVER_PAGE_SIZE,
    filters
  )

  const providerData = useMemo(
    () => response?.providerApprovalData ?? [],
    [response?.providerApprovalData]
  )
  const pagination = response?.pagination

  const allDates = useMemo(() => deriveAllDates(providerData), [providerData])

  const effectiveDayOffset =
    dayOffset !== null
      ? dayOffset
      : Math.max(0, allDates.length - DAYS_PER_PAGE)

  const visibleDates = allDates.slice(
    effectiveDayOffset,
    effectiveDayOffset + DAYS_PER_PAGE
  )

  const totalPages = pagination?.totalPages ?? 1

  const canGoLeft =
    effectiveDayOffset > 0 || serverPage < totalPages
  const canGoRight =
    effectiveDayOffset + DAYS_PER_PAGE < allDates.length || serverPage > 1

  const goLeft = () => {
    if (effectiveDayOffset - DAYS_PER_PAGE >= 0) {
      setDayOffset(effectiveDayOffset - DAYS_PER_PAGE)
    } else if (serverPage < totalPages) {
      setServerPage((prev) => prev + 1)
      setDayOffset(null)
    }
  }

  const goRight = () => {
    if (effectiveDayOffset + DAYS_PER_PAGE < allDates.length) {
      setDayOffset(effectiveDayOffset + DAYS_PER_PAGE)
    } else if (serverPage > 1) {
      setServerPage((prev) => prev - 1)
      setDayOffset(0)
    }
  }

  const dateRangeLabel =
    visibleDates.length > 0
      ? formatDateRange(visibleDates[0], visibleDates[visibleDates.length - 1])
      : ""

  const totalColumns = 1 + visibleDates.length

  return (
    <Card className="w-full h-[400px]">
      <CardHeader>
        <CardTitle>Provider Approval Rates</CardTitle>
        <CardDescription>
          Daily approval rate breakdown per provider
        </CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goLeft}
              disabled={!canGoLeft || isLoading}
            >
              <IconArrowLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground whitespace-nowrap min-w-[160px] text-center">
              {isLoading ? "Loading..." : dateRangeLabel}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={goRight}
              disabled={!canGoRight || isLoading}
            >
              <IconArrowRight size={16} />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Loading provider approval rates...
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="border-r min-w-[160px] bg-card">
                  Provider
                </TableHead>
                {visibleDates.map((date) => (
                  <TableHead
                    key={date}
                    className="text-center border-r min-w-[120px] bg-card"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {formatShortDate(date)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Rate / Trx
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerData.length > 0 ? (
                providerData.map((provider) => (
                  <TableRow key={provider.providerName}>
                    <TableCell className="font-medium border-r">
                      {provider.providerName}
                    </TableCell>
                    {visibleDates.map((date) => {
                      const dayData = provider.dailyData.find(
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
