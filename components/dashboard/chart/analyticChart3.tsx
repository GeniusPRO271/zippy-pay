"use client"
import * as React from "react"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
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
import { ChartDataItem } from "@/lib/types/transaction"

export const description = "A donut chart showing status distribution"


const chartConfig = {
  count: {
    label: "Count",
  },
  success: {
    label: "Success",
    color: "#2B9D90",
  },
  pending: {
    label: "Pending",
    color: "#E8DE51",
  },
  fail: {
    label: "Fail",
    color: "#E76E50",
  },
} satisfies ChartConfig

export default function AnalyticChart3({ data }: { data: ChartDataItem[] }) {
  const totalCount = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.count, 0)
  }, [data])

  return (
    <Card className="max-h-[381px]">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Overview</CardTitle>
        <CardDescription>Current System Status</CardDescription>
      </CardHeader>
      <CardContent className="">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    const text = totalCount.toLocaleString()
                    const baseFont = 28
                    const length = text.length
                    const fontSize = Math.max(8, baseFont - Math.max(0, (length - 6) * 2))

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
                            fontSize: "12px",
                          }}
                        >
                          Total Items
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" style={{ color: '#2B9D90' }} />
            <span className="font-medium">
              {(data.find(d => d.status === 'success')?.count || 0).toLocaleString()} Success
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" style={{ color: '#E8DE51' }} />
            <span className="font-medium">
              {(data.find(d => d.status === 'pending')?.count || 0).toLocaleString()} Pending
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" style={{ color: '#E76E50' }} />
            <span className="font-medium">
              {(data.find(d => d.status === 'fail')?.count || 0).toLocaleString()} Fail
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
