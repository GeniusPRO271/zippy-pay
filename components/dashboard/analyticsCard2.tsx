import { MonthlyRevenue } from "@/lib/types/transaction"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { AnalyticChart2 } from "./chart/analyticChart2"

function AnalyticsCard2(
  { revenue, monthlyRevenue, revenueChange }: { revenue: number, revenueChange: number, monthlyRevenue: MonthlyRevenue[] }
) {
  return (
    <Card className="h-[182px] min-w-[381px] gap-0 flex-1">
      <CardHeader>
        <CardTitle className="flex gap-2 font-normal">
          <p className="text-[14px]">Total Revenue</p>
        </CardTitle>
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
            }).format(revenueChange)} {" "}
            from last period
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
