"use client";

import * as React from "react";
import type { ColumnFiltersState } from "@tanstack/react-table";
import type { BaseTransaction } from "@/lib/types/transaction";

import type {
  ChartConfig,
  RevenueChartData,
  LastWeekIncreaseResult,
} from "@/lib/analytics/utils";


export interface AnalyticsData {
  totalTransactions: number;
  avgOrderValue: number;
  successRate: number;
  totalRevenue: number;

  transactionByDateRange: BaseTransaction[];

  monthlyRevenue: { month: string; revenue: number }[];
  revenueChange: number;
  revenueByCountry: RevenueCountry[];

  transactionsForChart: DailyTransactionSummary[];
  countriesData: CountryTransactionSummary[];
  revenuByDay: { data: RevenueChartData[]; config: ChartConfig };
  chartConfig: ChartConfig;
  trxRate: ChartDataItem[];

  last5WeeksData: ChartDataWeekly[];
  last5WeeksAOVData: ChartDataWeekly[];
  last5WeeksSuccessRateData: ChartDataWeekly[];

  lastWeekIncreaseCount: LastWeekIncreaseResult;
  lastWeekIncreaseAOV: LastWeekIncreaseResult;
  lastWeekIncreaseSuccessRate: LastWeekIncreaseResult;
}

export interface DailyTransactionSummary {
  date: string;
  success: number;
  pending: number;
  fail: number;
}

export interface CountryTransactionSummary {
  country: string;
  transactions: number;
  fill: string;
}

export interface RevenueCountry {
  country: string;
  totalRevenue: number;
  lastWeekIncrease: number;
}

export interface ChartDataItem {
  status: string;
  count: number;
  fill: string;
}

export interface ChartDataWeekly {
  week: string;
  amount: number;
}


type AnalyticsWorkerResultPayload = {
  totalTransactions: number;
  avgOrderValue: number;
  successRate: number;
  totalRevenue: number;

  monthlyRevenue: { month: string; revenue: number }[];
  revenueChange: number;
  revenueByCountry: RevenueCountry[];

  transactionsForChart: DailyTransactionSummary[];
  countriesData: CountryTransactionSummary[];
  revenuByDay: { data: RevenueChartData[]; config: ChartConfig };
  chartConfig: ChartConfig;
  trxRate: ChartDataItem[];

  last5WeeksData: ChartDataWeekly[];
  last5WeeksAOVData: ChartDataWeekly[];
  last5WeeksSuccessRateData: ChartDataWeekly[];

  lastWeekIncreaseCount: LastWeekIncreaseResult;
  lastWeekIncreaseAOV: LastWeekIncreaseResult;
  lastWeekIncreaseSuccessRate: LastWeekIncreaseResult;

  rowIndices: number[];
};

type AnalyticsWorkerResponse =
  | { type: "result"; payload: AnalyticsWorkerResultPayload }
  | { type: "error"; message: string };

interface UseAnalyticsWorkerOptions {
  data: BaseTransaction[];
  from: Date;
  to: Date;
  filters: ColumnFiltersState;
}

const MAX_DETAIL_ROWS = 5000;

export function useAnalyticsWorker({ data, from, to, filters }: UseAnalyticsWorkerOptions) {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const workerRef = React.useRef<Worker | null>(null);
  const rangeRef = React.useRef<{ from: Date; to: Date } | null>(null);
  const filtersRef = React.useRef<ColumnFiltersState>([]);
  const dataRef = React.useRef<BaseTransaction[]>([]);

  React.useEffect(() => {
    rangeRef.current = { from, to };
  }, [from, to]);

  React.useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  React.useEffect(() => {
    dataRef.current = data;
  }, [data]);

  React.useEffect(() => {
    const worker = new Worker(
      new URL("./analyticsWorker.js", import.meta.url),
      { type: "module" }
    );
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<AnalyticsWorkerResponse>) => {
      const { data: message } = event;

      if (message.type === "result") {
        const core = message.payload;
        const currentData = dataRef.current;

        const indices = core.rowIndices || [];
        const limitedIndices =
          indices.length > MAX_DETAIL_ROWS ? indices.slice(0, MAX_DETAIL_ROWS) : indices;

        const rows: BaseTransaction[] = limitedIndices.map((idx) => currentData[idx]);

        const {
          rowIndices,
          ...restCore
        } = core;

        setAnalyticsData({
          ...restCore,
          transactionByDateRange: rows,
        });

        setLoading(false);
      } else if (message.type === "error") {
        console.error("Analytics worker error:", message.message);
        setError(message.message);
        setLoading(false);
      }
    };

    worker.onerror = (e) => {
      console.error("Analytics worker crashed:", e);
      setError("Analytics worker crashed");
      setLoading(false);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Send dataset to worker when data changes
  React.useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    if (!data || data.length === 0) {
      setAnalyticsData(null);
      return;
    }

    const length = data.length;

    console.log("LENGTH OF ARRAY: ", length)
    const timestamps = new Float64Array(length);
    const quantities = new Float32Array(length);
    const statuses = new Uint8Array(length);
    const countryIndex = new Uint16Array(length);
    const methodIndex = new Uint16Array(length);
    const providerIndex = new Uint16Array(length);

    const countryDict: string[] = [];
    const methodDict: string[] = [];
    const providerDict: string[] = [];

    const countryMap = new Map<string, number>();
    const methodMap = new Map<string, number>();
    const providerMap = new Map<string, number>();

    for (let i = 0; i < length; i++) {
      const tx = data[i];

      const ts = tx.dateRequest ? new Date(tx.dateRequest).getTime() : 0;
      timestamps[i] = ts;

      const qty = Number(tx.quantity);
      quantities[i] = Number.isFinite(qty) ? qty : 0;

      statuses[i] = tx.status === "ok" ? 1 : tx.status === "pending" ? 0 : 2;

      // country
      let cIdx = countryMap.get(tx.country);
      if (cIdx === undefined) {
        cIdx = countryDict.length;
        countryDict.push(tx.country);
        countryMap.set(tx.country, cIdx);
      }
      countryIndex[i] = cIdx;

      // payment method (adapt to your field name)
      const methodKey = (tx as any).payMethod ?? (tx as any).paymentMethod ?? "";
      let mIdx = methodMap.get(methodKey);
      if (mIdx === undefined) {
        mIdx = methodDict.length;
        methodDict.push(methodKey);
        methodMap.set(methodKey, mIdx);
      }
      methodIndex[i] = mIdx;

      // provider
      const providerKey = (tx as any).provider ?? "";
      let pIdx = providerMap.get(providerKey);
      if (pIdx === undefined) {
        pIdx = providerDict.length;
        providerDict.push(providerKey);
        providerMap.set(providerKey, pIdx);
      }
      providerIndex[i] = pIdx;
    }

    // Send typed arrays via transferables (zero-copy)
    worker.postMessage(
      {
        type: "init",
        length,
        timestamps: timestamps.buffer,
        quantities: quantities.buffer,
        statuses: statuses.buffer,
        countryIndex: countryIndex.buffer,
        methodIndex: methodIndex.buffer,
        providerIndex: providerIndex.buffer,
        countries: countryDict,
        methods: methodDict,
        providers: providerDict,
      },
      [
        timestamps.buffer,
        quantities.buffer,
        statuses.buffer,
        countryIndex.buffer,
        methodIndex.buffer,
        providerIndex.buffer,
      ],
    );
  }, [data]);

  // Recompute analytics when range or filters change
  React.useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;
    if (!from || !to) return;
    if (!data || data.length === 0) {
      setAnalyticsData(null);
      return;
    }

    setLoading(true);
    setError(null);

    worker.postMessage({
      type: "compute",
      from: from.getTime(),
      to: to.getTime(),
      filters,
    });
  }, [from, to, data.length, filters]);

  return { analyticsData, loading, error };
}
