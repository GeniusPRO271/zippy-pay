"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DateRange } from "react-day-picker";
import {
  IconCaretDownFilled,
  IconFlagCheck,
  IconMenuOrder,
  IconSubscript,
} from "@tabler/icons-react";

import type { BaseTransaction } from "@/lib/types/transaction";
import { useAnalyticsWorker } from "@/lib/analytics/useAnalyticsWorker";

import TransactionsChartFilters from "@/components/dashboard/transactions-chart/filters";
import AnalyticsCard from "@/components/dashboard/analyticsCard";
import AnalyticChart from "@/components/dashboard/chart/analyticChart";
import AnalyticsCard2 from "@/components/dashboard/analyticsCard2";
import AnalyticsCard3 from "@/components/dashboard/transactions-chart/analyticsCard3";
import AnalyticChart3 from "@/components/dashboard/chart/analyticChart3";
import { AnalyticsCard5 } from "@/components/dashboard/transactions-revenue-chart/analyticsCard5";
import DashbaordTable from "@/components/dashboard/table/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  countries: string[];
  payMethods: string[];
  dateRange: DateRange | undefined;
  dateRangeTrx: DateRange;
  providers: string[];
}

export function PageDashoard<TData extends BaseTransaction, TValue>({
  columns,
  data,
  payMethods,
  dateRange,
  dateRangeTrx,
  countries,
  providers,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    initialState: {
      columnFilters,
      columnVisibility: {
        commerceReqId: false,
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
      columnFilters,
    },
  });

  const activeDateRange = React.useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return { from: dateRange.from, to: dateRange.to };
    }
    return { from: dateRangeTrx.from!, to: dateRangeTrx.to! };
  }, [dateRange, dateRangeTrx]);

  const { analyticsData, loading, error } = useAnalyticsWorker({
    data: data as BaseTransaction[],
    from: activeDateRange.from,
    to: activeDateRange.to,
    filters: columnFilters,
  });
  console.log("DATA ANALYTIC: ", analyticsData)

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-sm text-red-500">Analytics error: {error}</span>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-xs text-muted-foreground">
          {loading ? "Computing analytics..." : "No analytics available for current filters."}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="sticky top-0 z-50 bg-background py-2">
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

      {/* Top summary cards */}
      <div className="flex gap-4 mt-4">
        <AnalyticsCard
          icon={IconSubscript}
          title="New Transactions"
          tooltip="Total number of new transactions"
          value={analyticsData.totalTransactions}
          description={
            dateRange?.from && dateRange?.to ? "From period selected" : "Since last week"
          }
          footerLabel="Details"
          footerValue={analyticsData.lastWeekIncreaseCount.percentage.toFixed(1)}
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
          description={
            dateRange?.from && dateRange?.to ? "From period selected" : "Since last week"
          }
          footerLabel="Details"
          footerValue={analyticsData.lastWeekIncreaseAOV.percentage.toFixed(1)}
          footerIcon={dateRange?.from && dateRange?.to ? undefined : IconCaretDownFilled}
          chart={<AnalyticChart chartData={analyticsData.last5WeeksAOVData} />}
        />

        <AnalyticsCard
          icon={IconFlagCheck}
          title="Success Rate"
          tooltip="Success rate of transactions"
          value={analyticsData.successRate.toFixed(2) + "%"}
          description={
            dateRange?.from && dateRange?.to ? "From period selected" : "Since last week"
          }
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

      {/* Middle charts */}
      <div className="flex space-x-4 mt-4">
        <AnalyticsCard3 data={analyticsData.transactionsForChart} />
        <AnalyticChart3 data={analyticsData.trxRate} />
      </div>

      {/* Revenue by country + day */}
      <div className="flex space-x-4 mt-4">
        <AnalyticsCard5
          countries={countries}
          data={analyticsData.revenuByDay}
          revenueByCountry={analyticsData.revenueByCountry}
        />
      </div>

      {/* Analytics-specific table: we show at most e.g. 5k rows for safety */}
      <DashbaordTable
        countries={countries}
        transactions={analyticsData.transactionByDateRange}
        payMethods={payMethods}
      />
    </div>
  );
}

export default PageDashoard;
