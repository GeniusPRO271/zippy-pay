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

interface DistributionItem {
  name: string
  count: number
  fill: string
}

interface DistributionPieChartProps {
  title: string
  description?: string
  data: DistributionItem[]
  centerLabel?: string
}

const MAX_ITEMS = 5
const SLICE_COLORS = ["#2B9D90", "#E76E50", "#264653", "#E8DE51", "#F4A261", "#7C3AED"]
const OTHERS_COLOR = "#94a3b8"

export function DistributionPieChart({
  title,
  description,
  data,
  centerLabel = "Total",
}: DistributionPieChartProps) {
  const chartData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count)
    if (sorted.length <= MAX_ITEMS) {
      return sorted.map((item, i) => ({ ...item, fill: SLICE_COLORS[i % SLICE_COLORS.length] }))
    }

    const top = sorted.slice(0, MAX_ITEMS).map((item, i) => ({ ...item, fill: SLICE_COLORS[i] }))
    const othersCount = sorted
      .slice(MAX_ITEMS)
      .reduce((acc, item) => acc + item.count, 0)

    return [...top, { name: "Others", count: othersCount, fill: OTHERS_COLOR }]
  }, [data])

  const totalCount = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.count, 0),
    [chartData]
  )

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      count: { label: "Count" },
    }
    chartData.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
    })
    return config
  }, [chartData])

  if (data.length === 0) {
    return (
      <Card className="flex-1">
        <CardHeader className="items-center pb-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
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
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
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
                      const text = totalCount.toLocaleString()
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
                            {centerLabel}
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
                totalCount > 0
                  ? ((item.count / totalCount) * 100).toFixed(1)
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
