"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendRangePicker } from "@/components/dashboard/operations/trend-range-picker"
import {
  AggregationLevel,
  AGGREGATION_LABELS,
} from "@/lib/types/operations/trends"
import { TransactionAnalyticsFilters } from "@/lib/types/transactionAnalytics"
import { useTransactionAnalyticsTrends } from "@/hooks/transactionAnalytics/useTransactionAnalytics"

const chartConfig = {
  approved: {
    label: "Approved",
    color: "#2B9D90",
  },
  pending: {
    label: "Pending",
    color: "#E8DE51",
  },
  failed: {
    label: "Failed",
    color: "#E76E50",
  },
} satisfies ChartConfig

function getDefaultRange(aggregation: AggregationLevel): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date(to)
  switch (aggregation) {
    case "day":
      from.setDate(to.getDate() - 30)
      break
    case "week":
      from.setDate(to.getDate() - 182)
      break
    case "month":
      from.setMonth(to.getMonth() - 24)
      break
  }
  return { from, to }
}

function formatXAxisTick(value: string, aggregation: AggregationLevel): string {
  const date = new Date(value)
  switch (aggregation) {
    case "day":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    case "week":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    case "month":
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
  }
}

function formatTooltipLabel(value: string, aggregation: AggregationLevel): string {
  const date = new Date(value)
  switch (aggregation) {
    case "day":
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    case "week":
      return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    case "month":
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }
}

interface VolumeBarChartProps {
  filters?: TransactionAnalyticsFilters
}

export function VolumeBarChart({ filters }: VolumeBarChartProps) {
  const [aggregation, setAggregation] = React.useState<AggregationLevel>("day")
  const defaultRange = getDefaultRange("day")
  const [trendFrom, setTrendFrom] = React.useState<string>(defaultRange.from.toISOString())
  const [trendTo, setTrendTo] = React.useState<string>(defaultRange.to.toISOString())

  const handleAggregationChange = (level: AggregationLevel) => {
    setAggregation(level)
    const range = getDefaultRange(level)
    setTrendFrom(range.from.toISOString())
    setTrendTo(range.to.toISOString())
  }

  const handleRangeChange = (range: { from: string; to: string }) => {
    setTrendFrom(range.from)
    setTrendTo(range.to)
  }

  const { data: trendsResponse, isLoading } = useTransactionAnalyticsTrends({
    from: trendFrom,
    to: trendTo,
    aggregation,
    methodType: filters?.methodType,
    merchantId: filters?.merchantId,
    providerId: filters?.providerId,
    countryId: filters?.countryId,
    payMethodId: filters?.payMethodId,
  })

  const data = trendsResponse?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume by Status</CardTitle>
        <CardDescription>
          Number of approved, pending, and failed transactions by {aggregation}
        </CardDescription>
      </CardHeader>

      <div className="flex items-center justify-between px-6 pb-4">
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {(["day", "week", "month"] as AggregationLevel[]).map((level) => (
            <Button
              key={level}
              size="sm"
              variant={aggregation === level ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => handleAggregationChange(level)}
            >
              {AGGREGATION_LABELS[level]}
            </Button>
          ))}
        </div>

        <TrendRangePicker
          aggregation={aggregation}
          from={trendFrom}
          to={trendTo}
          onChange={handleRangeChange}
        />
      </div>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={data} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tickFormatter={(value) => formatXAxisTick(value, aggregation)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) =>
                  Intl.NumberFormat("en-US", { notation: "compact" }).format(value)
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatTooltipLabel(value, aggregation)}
                    indicator="dot"
                  />
                }
              />
              <Bar
                dataKey="approved"
                fill="#2B9D90"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="pending"
                fill="#E8DE51"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="failed"
                fill="#E76E50"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
