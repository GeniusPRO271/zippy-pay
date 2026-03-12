"use client"
import { Line, LineChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
} from "@/components/ui/chart"
import { ChartDataWeekly } from "@/lib/types/transaction"

const chartConfig = {
  desktop: {
    label: "Week",
    color: "#2563eb",
  },
} satisfies ChartConfig

function AnalyticChart({ chartData }: { chartData: ChartDataWeekly[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[39px] w-full">
      <LineChart
        accessibilityLayer
        data={chartData}
      >
        <Line
          dataKey="amount"
          type="linear"
          stroke="var(--color-desktop)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

export default AnalyticChart
