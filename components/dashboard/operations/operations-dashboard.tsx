"use client"

import * as React from "react"
import { IconHash, IconCash, IconReceipt } from "@tabler/icons-react"

import AnalyticsCard from "@/components/dashboard/analyticsCard"
import OperationsFilterBar from "./operations-filters"
import { DistributionPieChart } from "./distribution-pie-chart"
import { TrendLineChart } from "./trend-line-chart"
import { TrendBarChart } from "./trend-bar-chart"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { Country } from "@/lib/types/country"
import { Merchant } from "@/lib/types/merchant"
import { PayMethod } from "@/lib/types/payMethod"
import { Provider } from "@/lib/types/provider"
import { OperationsFilters } from "@/lib/types/operations"
import { useOperationsStats } from "@/hooks/operations/useOperationsStats"

interface OperationsDashboardProps {
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

export default function OperationsDashboard({
  countries,
  providers,
  merchants,
  payMethods,
}: OperationsDashboardProps) {
  const toDate = new Date()
  const fromDate = new Date(toDate)
  fromDate.setDate(toDate.getDate() - 30)

  const defaultFilters: OperationsFilters = {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    methodType: undefined,
    currency: "CLP",
    status: [],
    merchantId: [],
    providerId: [],
    countryId: [],
    payMethodId: [],
  }

  // Overview tab state
  const [overviewFilters, setOverviewFilters] = React.useState<OperationsFilters>(defaultFilters)

  // Trends tab state
  const [trendFilters, setTrendFilters] = React.useState<OperationsFilters>(defaultFilters)

  const { data, isLoading } = useOperationsStats(overviewFilters)

  const formatLocalCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null || !currency) return "N/A"
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
      }).format(amount)
    } catch {
      return `${currency} ${amount.toLocaleString()}`
    }
  }

  return (
    <div className="w-full h-full mb-4">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* -- Overview Tab -- */}
        <TabsContent value="overview">
          <div className="sticky top-0 z-50 bg-background py-2">
            <div className="flex gap-2 items-center justify-between flex-1 px-2">
              <span className="text-xs text-muted-foreground">
                {`Showing values in ${overviewFilters.currency ?? "CLP"}`}
              </span>
              <OperationsFilterBar
                columnFilters={overviewFilters}
                setColumnFilters={setOverviewFilters}
                merchants={merchants}
                payMethods={payMethods}
                countries={countries}
                providers={providers}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 mt-4">
              <div className="flex gap-4">
                <Skeleton className="h-[100px] flex-1" />
                <Skeleton className="h-[100px] flex-1" />
                <Skeleton className="h-[100px] flex-1" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-[300px] flex-1" />
                <Skeleton className="h-[300px] flex-1" />
              </div>
            </div>
          ) : data ? (
            <>
              <div className="flex gap-4 mt-4">
                <AnalyticsCard
                  icon={IconHash}
                  title="Transaction Count"
                  tooltip="Total number of transactions matching filters"
                  value={data.transactionCount.toLocaleString()}
                />

                <AnalyticsCard
                  icon={IconCash}
                  title="Local Currency Amount"
                  tooltip={`Total amount in ${data.currency ?? overviewFilters.currency}`}
                  value={formatLocalCurrency(data.localCurrencyAmount, data.currency)}
                />

                <AnalyticsCard
                  icon={IconReceipt}
                  title="Average Ticket"
                  tooltip={`Average transaction value in ${data.currency ?? overviewFilters.currency}`}
                  value={formatLocalCurrency(data.averageTicket, data.currency)}
                />
              </div>

              <div className="flex space-x-4 mt-4">
                <DistributionPieChart
                  title="Transactions by Merchant"
                  description="Distribution of transactions across merchants"
                  data={data.merchantDistribution}
                  centerLabel="Transactions"
                />

                <DistributionPieChart
                  title="Transactions by Provider"
                  description="Distribution of transactions across providers"
                  data={data.providerDistribution}
                  centerLabel="Transactions"
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          )}
        </TabsContent>

        {/* -- Trends Tab -- */}
        <TabsContent value="trends">
          <div className="sticky top-0 z-50 bg-background py-2">
            <div className="flex gap-2 items-center justify-between flex-1 px-2">
              <span className="text-xs text-muted-foreground">
                {`Showing values in ${trendFilters.currency ?? "CLP"}`}
              </span>
              <OperationsFilterBar
                columnFilters={trendFilters}
                setColumnFilters={setTrendFilters}
                merchants={merchants}
                payMethods={payMethods}
                countries={countries}
                providers={providers}
                hideDatePicker
              />
            </div>
          </div>

          <div className="space-y-4 mt-4">
            <TrendLineChart
              filters={trendFilters}
            />

            <TrendBarChart
              filters={trendFilters}
              enabled={!!trendFilters.currency}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
