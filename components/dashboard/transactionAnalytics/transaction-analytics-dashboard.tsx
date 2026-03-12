"use client"

import * as React from "react"

import AnalyticsFilterBar from "./analytics-filters"
import { StatusPieChart } from "./status-pie-chart"
import { MatrixTable } from "./matrix-table"
import { EffectivenessLineChart } from "./effectiveness-line-chart"
import { VolumeBarChart } from "./volume-bar-chart"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

import { Country } from "@/lib/types/country"
import { Merchant } from "@/lib/types/merchant"
import { PayMethod } from "@/lib/types/payMethod"
import { Provider } from "@/lib/types/provider"
import { TransactionAnalyticsFilters } from "@/lib/types/transactionAnalytics"
import { useTransactionAnalytics } from "@/hooks/transactionAnalytics/useTransactionAnalytics"

interface TransactionAnalyticsDashboardProps {
  countries: Country[]
  providers: Provider[]
  merchants: Merchant[]
  payMethods: PayMethod[]
}

export default function TransactionAnalyticsDashboard({
  countries,
  providers,
  merchants,
  payMethods,
}: TransactionAnalyticsDashboardProps) {
  const toDate = new Date()
  const fromDate = new Date(toDate)
  fromDate.setDate(toDate.getDate() - 30)

  const defaultFilters: TransactionAnalyticsFilters = {
    from: fromDate.toISOString(),
    to: toDate.toISOString(),
    methodType: undefined,
    merchantId: [],
    providerId: [],
    countryId: [],
    payMethodId: [],
  }

  // Section 1 filter state
  const [statusFilters, setStatusFilters] = React.useState<TransactionAnalyticsFilters>(defaultFilters)

  // Section 2 filter state
  const [trendFilters, setTrendFilters] = React.useState<TransactionAnalyticsFilters>(defaultFilters)

  const { data, isLoading } = useTransactionAnalytics(statusFilters)

  const merchantMatrixRows = (data?.merchantMatrix ?? []).map((row) => ({
    name: row.merchantName,
    approved: row.approved,
    pending: row.pending,
    failed: row.failed,
    total: row.total,
  }))

  const providerMatrixRows = (data?.providerMatrix ?? []).map((row) => ({
    name: row.providerName,
    approved: row.approved,
    pending: row.pending,
    failed: row.failed,
    total: row.total,
  }))

  return (
    <div className="w-full h-full mb-4">
      <Tabs defaultValue="status-distribution">
        <TabsList>
          <TabsTrigger value="status-distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="performance-trends">Performance Trends</TabsTrigger>
        </TabsList>

        {/* -- Section 1: Status Distribution -- */}
        <TabsContent value="status-distribution">
          <div className="sticky top-0 z-50 bg-background py-2">
            <div className="flex gap-2 items-center justify-end flex-1 px-2">
              <AnalyticsFilterBar
                columnFilters={statusFilters}
                setColumnFilters={setStatusFilters}
                merchants={merchants}
                payMethods={payMethods}
                countries={countries}
                providers={providers}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4 mt-4">
              <Skeleton className="h-[300px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : data ? (
            <div className="space-y-4 mt-4">
              <StatusPieChart data={data.statusDistribution} />

              <MatrixTable
                title="Merchant Matrix"
                description="Transaction status breakdown by merchant"
                rows={merchantMatrixRows}
                nameColumnLabel="Merchant"
              />

              <MatrixTable
                title="Provider Matrix"
                description="Transaction status breakdown by provider"
                rows={providerMatrixRows}
                nameColumnLabel="Provider"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-sm text-muted-foreground">No data available</p>
            </div>
          )}
        </TabsContent>

        {/* -- Section 2: Performance Trends -- */}
        <TabsContent value="performance-trends">
          <div className="sticky top-0 z-50 bg-background py-2">
            <div className="flex gap-2 items-center justify-end flex-1 px-2">
              <AnalyticsFilterBar
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
            <EffectivenessLineChart
              filters={trendFilters}
            />

            <VolumeBarChart
              filters={trendFilters}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
