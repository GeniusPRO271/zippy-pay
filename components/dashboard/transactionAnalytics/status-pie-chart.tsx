"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
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
import { StatusDistribution } from "@/lib/types/transactionAnalytics"

const STATUS_COLORS = {
  approved: "#2B9D90",
  pending: "#E8DE51",
  failed: "#E76E50",
}

const chartConfig = {
  count: { label: "Count" },
  approved: { label: "Approved", color: STATUS_COLORS.approved },
  pending: { label: "Pending", color: STATUS_COLORS.pending },
  failed: { label: "Failed", color: STATUS_COLORS.failed },
} satisfies ChartConfig

interface StatusPieChartProps {
  data: StatusDistribution
}

export function StatusPieChart({ data }: StatusPieChartProps) {
  const chartData = [
    { name: "Approved", count: data.approved, fill: STATUS_COLORS.approved },
    { name: "Pending", count: data.pending, fill: STATUS_COLORS.pending },
    { name: "Failed", count: data.failed, fill: STATUS_COLORS.failed },
  ]

  const total = data.total

  if (total === 0) {
    return (
      <Card className="flex-1">
        <CardHeader className="items-center pb-0">
          <CardTitle>Transaction Status Distribution</CardTitle>
          <CardDescription>Breakdown by approval status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[250px]">
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle>Transaction Status Distribution</CardTitle>
        <CardDescription>Breakdown by approval status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[200px] min-w-[200px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                strokeWidth={3}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const text = total.toLocaleString()
                      const baseFont = 24
                      const length = text.length
                      const fontSize = Math.max(
                        8,
                        baseFont - Math.max(0, (length - 6) * 2)
                      )

                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            style={{
                              fill: "var(--foreground)",
                              fontSize: `${fontSize}px`,
                              fontWeight: 700,
                            }}
                          >
                            {text}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + fontSize * 0.9}
                            style={{
                              fill: "var(--muted-foreground)",
                              fontSize: "11px",
                            }}
                          >
                            Transactions
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {chartData.map((item) => {
              const percentage =
                total > 0
                  ? ((item.count / total) * 100).toFixed(1)
                  : "0.0"

              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium tabular-nums">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
