"use client"

import * as React from "react"
import {
  IconCaretDownFilled,
  IconFlagCheck,
  IconMenuOrder,
  IconSubscript,
} from "@tabler/icons-react"

import AnalyticsCard from "@/components/dashboard/analyticsCard"
import AnalyticsCard2 from "@/components/dashboard/analyticsCard2"
import AnalyticsCard3 from "@/components/dashboard/transactions-chart/analyticsCard3"
import { AnalyticsCard5 } from "@/components/dashboard/transactions-revenue-chart/analyticsCard5"
import AnalyticChart from "@/components/dashboard/chart/analyticChart"
import AnalyticChart3 from "@/components/dashboard/chart/analyticChart3"
import TransactionsChartFilters from "@/components/dashboard/transactions-chart/filters"
import { DashboardSkeleton } from "@/components/dashboard/skeleton"

import { useDashboardStats } from "@/hooks/statistics/useStats"
import { Country } from "@/lib/types/country"
import { Merchant } from "@/lib/types/merchant"
import { PayMethod } from "@/lib/types/payMethod"
import { Provider } from "@/lib/types/provider"
import { StatsFilters } from "@/lib/types/statistics"

interface DataTableProps {
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

export function PageDashoard({
  payMethods,
  countries,
  providers,
  merchants,
}: DataTableProps) {
  const toDate = new Date()
  const fromDate = new Date(toDate)
  fromDate.setDate(toDate.getDate() - 30)

  const [columnFilters, setColumnFilters] = React.useState<StatsFilters>({
    merchantId: [],
    providerId: [],
    countryId: [],
    payMethodId: [],
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
  })

  const { data: analyticsData, isLoading } = useDashboardStats(columnFilters)
  const showSkeleton = isLoading || !analyticsData

  return (
    <div className="w-full h-full mb-4">
      {/* Header + Filters ALWAYS visible (outside skeleton) */}
      <div className="sticky top-0 z-50 bg-background py-2">
        <div className="items-center justify-between flex">
          <div className="flex gap-2 items-center justify-between flex-1 px-2">
            <span className="text-xs text-muted-foreground">
              All monetary values have been converted to U.S. dollars (USD) for
              consistency.
            </span>

            <TransactionsChartFilters
              columnFilters={columnFilters}
              setColumnFilters={setColumnFilters}
              merchants={merchants}
              payMethods={payMethods}
              countries={countries}
              providers={providers}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {showSkeleton ? (
        <DashboardSkeleton showHeader={false} />
      ) : (
        <>
          <div className="flex gap-4 mt-4">
            <AnalyticsCard
              icon={IconSubscript}
              title="New Transactions"
              tooltip="Total number of new transactions"
              value={analyticsData.totalTransactions}
              description={"Since last week"}
              footerLabel="Details"
              footerValue={analyticsData.lastWeekIncreaseCount.toFixed(1)}
              chart={<AnalyticChart chartData={analyticsData.last5WeeksData} />}
            />

            <AnalyticsCard
              icon={IconMenuOrder}
              title="Avg Order Value"
              tooltip="Avg transaction value"
              value={new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(Number(analyticsData.avgOrderValue))}
              description={"Since last week"}
              footerLabel="Details"
              footerValue={analyticsData.lastWeekIncreaseAOV.toFixed(1)}
              footerIcon={IconCaretDownFilled}
              chart={
                <AnalyticChart chartData={analyticsData.last5WeeksAOVData} />
              }
            />

            <AnalyticsCard
              icon={IconFlagCheck}
              title="Success Rate"
              tooltip="Success rate of transactions"
              value={analyticsData.successRate.toFixed(2) + "%"}
              description={"Since last week"}
              footerLabel="Details"
              footerValue={analyticsData.lastWeekIncreaseSuccessRate.toFixed(1)}
              chart={
                <AnalyticChart
                  chartData={analyticsData.last5WeeksSuccessRateData}
                />
              }
            />

            <AnalyticsCard2
              revenue={analyticsData.totalRevenue}
              monthlyRevenue={analyticsData.monthlyRevenue}
              revenueChange={analyticsData.revenueChange}
            />

          </div>

          <div className="flex space-x-4 mt-4">
            <AnalyticsCard3 data={analyticsData.transactionsForChart} />
            <AnalyticChart3 data={analyticsData.trxRate} />
          </div>

          <div className="flex space-x-4 mt-4">
            <AnalyticsCard5
              countries={countries}
              data={{
                data: analyticsData.revenuByDay,
                config: analyticsData.chartConfig,
              }}
              revenueByCountry={analyticsData.revenueByCountry}
            />
          </div>

          {/*
          <DashbaordTable
            countries={countries}
            transactions={analyticsData.transactionByDateRange}
            payMethods={payMethods}
          />
          */}
        </>
      )}
    </div>
  )
}

export default PageDashoard
