import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { DailyTransactionSummary } from "@/lib/types/transaction"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartConfig = {
  visitors: {
    label: "Success",
    color: "var(--chart-1)",
  },
  desktop: {
    label: "Fail",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Pending",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig


function TransactionChart({ transactionsByDay }: { transactionsByDay: DailyTransactionSummary[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[240px] w-full">
      <BarChart accessibilityLayer data={transactionsByDay}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              indicator="dot"
            />
          }
        />
        <Bar
          dataKey="fail"
          stackId="a"
          fill="#E76E50"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="pending"
          stackId="a"
          fill="#E8DE51"
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="success"
          stackId="a"
          fill="#2B9D90"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}

export default TransactionChart
