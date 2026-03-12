
import { MonthlyRevenue } from "@/lib/types/transaction"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { AnalyticChart2 } from "./chart/analyticChart2"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { IconInfoCircle } from "@tabler/icons-react"

function AnalyticsCard2(
  { revenue, monthlyRevenue, revenueChange, comparisonLabel }: { revenue: number, revenueChange: number, monthlyRevenue: MonthlyRevenue[], comparisonLabel?: string }
) {
  return (
    <Card className="h-[182px] min-w-[381px] gap-0 flex-1">
      <CardHeader>
        <CardTitle className="flex gap-2 font-normal">
          <p className="text-[14px]">Total Revenue</p>
        </CardTitle>
        <CardAction>
          <Tooltip>
            <TooltipTrigger className="cursor-pointer" asChild>
              <IconInfoCircle size={18} className="text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="mb-1">
              <p>Includes all revenue including payouts</p>
            </TooltipContent>
          </Tooltip>
        </CardAction>
      </CardHeader>
      <CardContent className="justify-start items-start">
        <div>
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(revenue)}
          </p>
          <p className="text-[12px] text-gray-500">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(revenueChange)}
            {comparisonLabel ?? "from last period"}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full">
          <AnalyticChart2 monthlyRevenue={monthlyRevenue} />
        </div>
      </CardFooter>
    </Card>
  )
}

export default AnalyticsCard2
