"use client"
import React, { useMemo } from "react"
import { ChartContainer } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import { ChartConfig, RevenueChartData } from "@/lib/analytics/utils"

export const description = "Revenue chart in USD"

const lightPalette = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
]

const darkPalette = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#22d3ee",
]

function TransactionChart({
  transactionsByDay,
  config,
  filter,
}: {
  transactionsByDay: RevenueChartData[]
  config: ChartConfig
  filter: Record<string, boolean>
}) {
  const countries = Object.keys(config).filter((key) => key !== "total")

  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark")

  const palette = isDark ? darkPalette : lightPalette

  const colorMap = useMemo(() => {
    const map: Record<string, string> = { total: palette[0] }
    countries.forEach((country, index) => {
      map[country] = palette[(index + 1) % palette.length]
    })
    return map
  }, [countries, palette])

  const visibleCountries = countries.filter(
    (country) => filter?.[country] === true
  )

  const totalShowState = filter?.total === true

  return (
    <div className="flex flex-col items-center gap-4">
      <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
        <AreaChart data={transactionsByDay}>
          <defs>
            {Object.entries(colorMap).map(([key, color]) => (
              <linearGradient
                key={key}
                id={`fill-${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid vertical={false} className="stroke-muted/30" />

          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                notation: "compact",
              }).format(value)
            }
          />

          <Tooltip
            cursor={false}
            content={({ active, payload, label }) => {
              if (!active || !payload) return null
              // Filter tooltip entries to match visible countries + total
              const filteredPayload = payload.filter(
                (entry) =>
                  entry.name === "total" ||
                  visibleCountries.includes(entry.name as string)
              )
              return (
                <div className="rounded-lg border bg-background/90 p-2 shadow-md backdrop-blur-md">
                  <p className="text-sm font-medium mb-1">
                    {new Date(label).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {filteredPayload.map((entry) => {
                    return (
                      <div
                        key={entry.name}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                        />
                        <span className="font-medium">{entry.name}:</span>
                        <span>
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(entry.value as number)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          />


          {totalShowState && (
            <Area
              dataKey="total"
              type="natural"
              fill="url(#fill-total)"
              stroke={colorMap.total}
              strokeWidth={2}
              stackId="b"
            />
          )}
          {
            visibleCountries.map((country) => (
              <Area
                key={country}
                dataKey={country}
                type="natural"
                fill={`url(#fill-${country})`}
                stroke={colorMap[country]}
                strokeWidth={2}
                stackId={country}
              />
            ))
          }
        </AreaChart>
      </ChartContainer>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded"
          ></span>
          <span className="font-medium">Total</span>
        </div>

        {visibleCountries.map((country) => (
          <div key={country} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded"
            ></span>
            <span className="font-medium">{country}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TransactionChart
