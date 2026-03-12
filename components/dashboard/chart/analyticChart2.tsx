"use client"

import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { MonthlyRevenue } from "@/lib/types/transaction"

import { Area, AreaChart, Dot } from "recharts"

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AnalyticChart2(
  { monthlyRevenue }: { monthlyRevenue: MonthlyRevenue[] }
) {
  return (
    <ChartContainer config={chartConfig} className="h-[69px] w-full">
      <AreaChart
        accessibilityLayer
        data={monthlyRevenue}
        margin={
          {
            left: 9,
            top: 9,
            right: 9,
            bottom: 9
          }
        }
      >
        <Area
          dataKey="revenue"
          type="natural"
          fillOpacity={0}
          strokeWidth={2}
          dot={({ index, ...props }) => {
            return (
              <Dot
                key={index}
                r={3}
                cx={props.cx}
                cy={props.cy}
                fill={"white"}
                strokeWidth={2}
                stroke={"black"}
              />
            )
          }}
          stroke={"black"}
        />
      </AreaChart>
    </ChartContainer >
  )
}
