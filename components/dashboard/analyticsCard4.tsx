"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { CountryTransactionSummary } from "@/lib/types/transaction"
import { format } from "date-fns"

export const description = "A mixed bar chart"



export function AnalyticsCard4(
  { countries, chartConfig, from, to }: { countries: CountryTransactionSummary[], chartConfig: ChartConfig, from: Date, to: Date }
) {
  return (
    <Card className="min-w-[381px] flex-1">
      <CardHeader>
        <CardTitle>Transactions - Country</CardTitle>
        <CardDescription>
          {format(from, "MMMM")} - {format(to, "MMMM yyyy")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} >
          <BarChart
            accessibilityLayer
            data={countries}
            layout="vertical"
          >
            <YAxis
              dataKey="country"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                String(chartConfig[value as keyof typeof chartConfig]?.label ?? value)
              }
            />
            <XAxis dataKey="transactions" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="transactions" layout="vertical" radius={5}>
              <LabelList
                position="right"
                className="fill-black dark:fill-white"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
