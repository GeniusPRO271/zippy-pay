"use client"

import * as React from "react"
import { BaseTransaction, ChartDataItem, ChartDataWeekly, CountryTransactionSummary, DailyTransactionSummary, RevenueCountry } from "@/lib/types/transaction"
import { ColumnDef, ColumnFiltersState, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table"
import { aggregateRevenueByMonth, aggregateTransactionsByDay, calculateAOV, calculateLastWeekIncrease, calculateRevenueByCountry, calculateRevenueChangeValue, calculateSuccessRate, calculateTotalRevenue, ChartConfig, filterTransactionsByDateRange, generateChartConfig, generateRevenueChartData, getLast5WeeksAOVChartData, getLast5WeeksChartData, getLast5WeeksSuccessRateChartData, getTotalTransactions, groupTransactionsByCountry, LastWeekIncreaseResult, processTransactionData, RevenueChartData } from "@/lib/analytics/utils"
import { DateRange } from "react-day-picker"
import { IconCaretDownFilled, IconFlagCheck, IconMenuOrder, IconSubscript } from "@tabler/icons-react"
import TransactionsChartFilters from "@/components/dashboard/transactions-chart/filters"
import AnalyticsCard from "@/components/dashboard/analyticsCard"
import AnalyticChart from "@/components/dashboard/chart/analyticChart"
import AnalyticsCard2 from "@/components/dashboard/analyticsCard2"
import AnalyticsCard3 from "@/components/dashboard/transactions-chart/analyticsCard3"
import AnalyticChart3 from "@/components/dashboard/chart/analyticChart3"
import { AnalyticsCard5 } from "@/components/dashboard/transactions-revenue-chart/analyticsCard5"
import DashbaordTable from "@/components/dashboard/table/table"

interface AnalyticsData {
  totalTransactions: number
  avgOrderValue: number
  successRate: number
  totalRevenue: number
  transactionByDateRange: BaseTransaction[]

  monthlyRevenue: { month: string; revenue: number }[]
  revenueChange: number
  revenueByCountry: RevenueCountry[]

  transactionsForChart: DailyTransactionSummary[]
  countriesData: CountryTransactionSummary[]
  revenuByDay: { data: RevenueChartData[]; config: ChartConfig }
  chartConfig: ChartConfig
  trxRate: ChartDataItem[]

  last5WeeksData: ChartDataWeekly[]
  last5WeeksAOVData: ChartDataWeekly[]
  last5WeeksSuccessRateData: ChartDataWeekly[]

  lastWeekIncreaseCount: LastWeekIncreaseResult
  lastWeekIncreaseAOV: LastWeekIncreaseResult
  lastWeekIncreaseSuccessRate: LastWeekIncreaseResult
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  countries: string[]
  payMethods: string[]
  dateRange: DateRange | undefined
  dateRangeTrx: DateRange
  providers: string[]
}

export function PageDashoard<TData, TValue>({
  columns,
  data,
  payMethods,
  dateRange,
  dateRangeTrx,
  countries,
  providers
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    initialState: {
      columnFilters,
      columnVisibility: {
        commerceReqId: false
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      columnFilters
    },
  })

  const filteredData = React.useMemo(() => {
    const rows = table.getFilteredRowModel().rows
    return rows.map((row) => row.original) as BaseTransaction[]
  }, [table.getFilteredRowModel().rows])

  const activeDateRange = React.useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to }
    }
    return { from: dateRangeTrx.from!, to: dateRangeTrx.to! }
  }, [dateRange, dateRangeTrx])

  const [filters, setFilters] = React.useState<{
    dateRange?: DateRange
    dateRangeTrx: DateRange
  }>({
    dateRangeTrx: {
      from: new Date(2025, 5, 9),
      to: new Date(2025, 5, 26),
    },
  })

  const analyticsData = React.useMemo<AnalyticsData>(() => {
    const { from, to } = activeDateRange
    const dataToUse = filteredData.length > 0 ? filteredData : (data as BaseTransaction[])

    return {
      totalTransactions: getTotalTransactions(dataToUse, from, to),
      avgOrderValue: calculateAOV(dataToUse, from, to),
      successRate: calculateSuccessRate(dataToUse, from, to),
      totalRevenue: calculateTotalRevenue(dataToUse, from, to),
      transactionByDateRange: filterTransactionsByDateRange(dataToUse, from, to),
      monthlyRevenue: aggregateRevenueByMonth(dataToUse, from, to),
      revenueChange: calculateRevenueChangeValue(dataToUse, from, to),
      revenueByCountry: calculateRevenueByCountry(dataToUse, from, to),
      transactionsForChart: aggregateTransactionsByDay(dataToUse, from, to),
      countriesData: groupTransactionsByCountry(dataToUse, from, to),
      revenuByDay: generateRevenueChartData(dataToUse, from, to),
      chartConfig: generateChartConfig(dataToUse),
      trxRate: processTransactionData(dataToUse, from, to),
      last5WeeksData: getLast5WeeksChartData(dataToUse, to),
      last5WeeksAOVData: getLast5WeeksAOVChartData(dataToUse, to),
      last5WeeksSuccessRateData: getLast5WeeksSuccessRateChartData(dataToUse, to),
      lastWeekIncreaseCount: calculateLastWeekIncrease(dataToUse, to, "count"),
      lastWeekIncreaseAOV: calculateLastWeekIncrease(dataToUse, to, "aov"),
      lastWeekIncreaseSuccessRate: calculateLastWeekIncrease(dataToUse, to, "successRate")
    }
  }, [filteredData, data, activeDateRange])

  return (
    <div className="w-full h-full">
      <div className="sticky top-0 z-50 bg-background py-2 ">
        <div className="items-center justify-between flex">
          <div className="flex gap-2 items-center justify-between flex-1 px-2">
            <span className="text-xs text-muted-foreground">
              All monetary values have been converted to U.S. dollars (USD) for consistency.
            </span>
            {data.length > 0 && (
              <TransactionsChartFilters
                table={table}
                payMethods={payMethods}
                countries={countries}
                columnFilters={columnFilters}
                providers={providers}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-4">
        <AnalyticsCard
          icon={IconSubscript}
          title="New Transactions"
          tooltip="Total number of new transactions"
          value={analyticsData.totalTransactions}
          description={dateRange?.from && dateRange?.to ? "From Period selected" : "Since Last week"}
          footerLabel="Details"
          footerValue={analyticsData.lastWeekIncreaseCount.percentage.toFixed(1)}
          chart={<AnalyticChart chartData={analyticsData.last5WeeksData} />}
        />

        <AnalyticsCard
          icon={IconMenuOrder}
          title="Avg Order Value"
          tooltip="Avg transaction of value"
          value={
            new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(Number(analyticsData.avgOrderValue))
          }
          description={dateRange?.from && dateRange?.to ? "From Period selected" : "Since Last week"}
          footerLabel="Details"
          footerValue={analyticsData.lastWeekIncreaseAOV.percentage.toFixed(1)}
          footerIcon={dateRange?.from && dateRange?.to ? undefined : IconCaretDownFilled}
          chart={<AnalyticChart chartData={analyticsData.last5WeeksAOVData} />}
        />

        <AnalyticsCard
          icon={IconFlagCheck}
          title="Sucess Rate"
          tooltip="Sucess rate of transactions"
          value={analyticsData.successRate.toFixed(2) + "%"}
          description={dateRange?.from && dateRange?.to ? "From Period selected" : "Since Last week"}
          footerLabel="Details"
          footerValue={analyticsData.lastWeekIncreaseSuccessRate.percentage.toFixed(1)}
          chart={<AnalyticChart chartData={analyticsData.last5WeeksSuccessRateData} />}
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
        <AnalyticsCard5 countries={countries} data={analyticsData.revenuByDay} revenueByCountry={analyticsData.revenueByCountry} />
      </div>
      <DashbaordTable
        countries={countries}
        transactions={analyticsData.transactionByDateRange}
        payMethods={payMethods}
      />
    </div>
  )
}

export default PageDashoard
