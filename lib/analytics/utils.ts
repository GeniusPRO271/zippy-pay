import { getMerchantName } from "@/components/reports/reportGeneration/reportForm/paths/financialReport/step-1";
import { CountryProviders } from "../types/providers/getProvidersByCountry";
import {
  BaseTransaction,
  ChartDataItem,
  ChartDataWeekly,
  CountryTransactionSummary,
  DailyTransactionSummary,
  MonthlyRevenue,
  RevenueCountry
} from "../types/transaction";
import { ReportFinanceStep1Schema } from "../zod/reportFinancePath";
import z from "zod";

export const timestampToDate = (timestamp: Date): Date => {
  return new Date(timestamp);
};

export function generateGcpLogLink(trxid: string, duration: string = "P30D", authuser: number = 1): string {
  const projectId = "stratech-pay";
  const encodedQuery = encodeURIComponent(trxid);
  return `https://console.cloud.google.com/logs/query;query=${encodedQuery};duration=${duration}?authuser=${authuser}&project=${projectId}`;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

export type ChartConfigEntry = { label: string; color: string };
export type ChartConfig = { [key: string]: ChartConfigEntry };

export function calculateAOV(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let totalValue = 0;
  let count = 0;

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;

    const txMs = tx.dateRequest.getTime();
    if (txMs < startMs || txMs > endMs) continue;

    totalValue += parseFloat(tx.quantity);
    count++;
  }

  return count === 0 ? 0 : totalValue / count;
}

export function calculateSuccessRate(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let total = 0;
  let successful = 0;

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs < startMs || txMs > endMs) continue;

    total++;
    if (tx.status === "ok") successful++;
  }

  return total === 0 ? 0 : (successful / total) * 100;
}

export function getNewTransactions(transactions: BaseTransaction[], startDate: Date, endDate: Date): BaseTransaction[] {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  return transactions.filter(tx => {
    const txMs = tx.dateRequest.getTime();
    return txMs >= startMs && txMs <= endMs;
  });
}

export function getTotalTransactions(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  return transactions.filter(tx => {
    const txMs = tx.dateRequest.getTime();
    return txMs >= startMs && txMs <= endMs;
  }).length;
}

export function aggregateTransactionsByDay(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): DailyTransactionSummary[] {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const dailyStats: Record<string, { success: number; pending: number; fail: number }> = {};

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs < startMs || txMs > endMs) continue;

    const dateKey = formatDate(new Date(txMs));
    dailyStats[dateKey] ||= { success: 0, pending: 0, fail: 0 };

    if (tx.status === "ok") dailyStats[dateKey].success++;
    else if (tx.status === "pending") dailyStats[dateKey].pending++;
    else if (tx.status === "error") dailyStats[dateKey].fail++;
  }

  return Object.entries(dailyStats)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupTransactionsByCountry(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): CountryTransactionSummary[] {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();
  const countryStats: Record<string, number> = {};

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs >= startMs && txMs <= endMs) {
      countryStats[tx.country] = (countryStats[tx.country] || 0) + 1;
    }
  }

  return Object.keys(countryStats).map(country => ({
    country,
    transactions: countryStats[country],
    fill: "#2B9D90"
  }));
}

export function generateChartConfig(transactions: BaseTransaction[]): ChartConfig {
  const uniqueCountries = [...new Set(transactions.map(tx => tx.country))];

  const config: ChartConfig = {};
  uniqueCountries.forEach((country, index) => {
    config[country] = { label: country, color: `var(--chart-${index + 1})` };
  });

  return config;
}

export function calculateTotalRevenue(transactions: BaseTransaction[], startDate: Date, endDate: Date): number {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let total = 0;

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;

    const txMs = tx.dateRequest.getTime();
    if (txMs < startMs || txMs > endMs) continue;

    total += parseFloat(tx.quantity);
  }

  return total;
}

export function aggregateRevenueByMonth(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): MonthlyRevenue[] {
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  const monthlyRevenue: Record<number, number> = {};

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;

    const txMs = tx.dateRequest.getTime();
    if (txMs < startMs || txMs > endMs) continue;

    const month = new Date(txMs).getMonth();
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(tx.quantity);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return Object.keys(monthlyRevenue).map(k => {
    const month = parseInt(k);
    return { month: monthNames[month], revenue: monthlyRevenue[month] };
  });
}

export function calculateRevenueChangeValue(
  transactions: BaseTransaction[],
  startDate: Date,
  endDate: Date
): number {
  const monthlyData = aggregateRevenueByMonth(transactions, startDate, endDate);
  if (monthlyData.length === 0) return 0;

  const sorted = [...monthlyData].sort(
    (a, b) => new Date(`${a.month} 1, 2024`).getTime() - new Date(`${b.month} 1, 2024`).getTime()
  );

  const last = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  return last.revenue - (previous?.revenue ?? 0);
}

export function getTransactionDateRange(
  transactions: BaseTransaction[]
): { from: Date | null; to: Date | null } {
  if (transactions.length === 0) return { from: null, to: null };

  let min = getTxMs(transactions[0]);
  let max = min;

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < min) min = ms;
    if (ms > max) max = ms;
  }

  return { from: new Date(min), to: new Date(max) };
}

export function getLast5WeeksChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const endMs = endDate.getTime();
  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + 86400000;

    const count = transactions.filter(tx => {
      const txMs = tx.dateRequest.getTime();
      return txMs >= weekStart && txMs <= weekEnd;
    }).length;

    data.push({ week: `Week ${5 - i}`, amount: count });
  }

  return data;
}

export function getLast5WeeksAOVChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const endMs = endDate.getTime();
  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + 86400000;

    const avg = calculateAOV(transactions, new Date(weekStart), new Date(weekEnd));

    data.push({ week: `Week ${5 - i}`, amount: avg });
  }

  return data;
}

export type WeekValueType = "count" | "aov" | "successRate";

export interface LastWeekIncreaseResult {
  current: number;
  previous: number;
  percentage: number;
  successRateCurrent: number;
  successRatePrevious: number;
}

export function calculateLastWeekIncrease(
  transactions: BaseTransaction[],
  endDate: Date,
  type: WeekValueType = "count"
): LastWeekIncreaseResult {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const DAY = 24 * 60 * 60 * 1000;

  const endMs = endDate.getTime();
  const currentStart = endMs - WEEK + DAY;
  const previousEnd = currentStart - DAY;
  const previousStart = previousEnd - WEEK + DAY;

  const currentTx = transactions.filter(tx => {
    const t = tx.dateRequest.getTime();
    return t >= currentStart && t <= endMs;
  });

  const previousTx = transactions.filter(tx => {
    const t = tx.dateRequest.getTime();
    return t >= previousStart && t <= previousEnd;
  });

  const calcSuccessRate = (txs: BaseTransaction[]) =>
    txs.length === 0 ? 0 : (txs.filter(t => t.status === "ok").length / txs.length) * 100;

  const calcAOV = (txs: BaseTransaction[]) =>
    txs.length === 0 ? 0 : txs.reduce((s, t) => s + Number(t.quantity), 0) / txs.length;

  let current: number;
  let previous: number;

  if (type === "count") {
    current = currentTx.length;
    previous = previousTx.length;
  } else if (type === "aov") {
    current = calcAOV(currentTx);
    previous = calcAOV(previousTx);
  } else {
    current = calcSuccessRate(currentTx);
    previous = calcSuccessRate(previousTx);
  }

  const percentage = previous === 0 ? (current === 0 ? 0 : Infinity) : ((current - previous) / previous) * 100;

  return {
    current,
    previous,
    percentage,
    successRateCurrent: calcSuccessRate(currentTx),
    successRatePrevious: calcSuccessRate(previousTx)
  };
}

export function getLast5WeeksSuccessRateChartData(
  transactions: BaseTransaction[],
  endDate: Date
): ChartDataWeekly[] {
  const WEEK = 7 * 24 * 60 * 60 * 1000;
  const DAY = 24 * 60 * 60 * 1000;
  const endMs = endDate.getTime();

  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + DAY;

    const txs = transactions.filter(tx => {
      const t = tx.dateRequest.getTime();
      return t >= weekStart && t <= weekEnd;
    });

    const successCount = txs.filter(t => t.status === "ok").length;
    const successRate = txs.length === 0 ? 0 : (successCount / txs.length) * 100;

    data.push({ week: `Week ${5 - i}`, amount: successRate });
  }

  return data;
}

export interface RevenueChartData {
  date: string;
  total: number;
  [countryCode: string]: string | number;
}

const colorPalette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function generateRevenueChartData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): { data: RevenueChartData[]; config: ChartConfig } {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  const countries = new Set<string>();
  const dateMap = new Map<string, Map<string, number>>();

  for (const t of transactions) {
    if (t.status !== "ok") continue;

    const txMs = t.dateRequest.getTime();
    if (txMs < fromMs || txMs > toMs) continue;

    const dateStr = new Date(txMs).toISOString().split("T")[0];
    const qty = parseFloat(t.quantity);
    if (isNaN(qty)) continue;

    countries.add(t.country);

    if (!dateMap.has(dateStr)) dateMap.set(dateStr, new Map());

    const countryMap = dateMap.get(dateStr)!;
    countryMap.set(t.country, (countryMap.get(t.country) || 0) + qty);
  }

  const sortedDates = [...dateMap.keys()].sort();
  const data: RevenueChartData[] = [];

  for (const dateStr of sortedDates) {
    const entry: RevenueChartData = { date: dateStr, total: 0 };
    const map = dateMap.get(dateStr)!;

    [...countries].sort().forEach(country => {
      const revenue = map.get(country) || 0;
      entry[country] = parseFloat(revenue.toFixed(2));
      entry.total += revenue;
    });

    entry.total = parseFloat(entry.total.toFixed(2));
    data.push(entry);
  }

  const config: ChartConfig = {
    total: { label: "Total Revenue", color: "hsl(var(--chart-3))" }
  };

  [...countries].forEach((country, i) => {
    config[country] = {
      label: country,
      color: colorPalette[i % colorPalette.length]
    };
  });

  return { data, config };
}

const USD_PER_UNIT: Record<string, number> = {
  USD: 1,
  BRL: 0.19,
  MXN: 0.056,
  CLP: 0.0011,
  COP: 0.00026,
  GTQ: 0.13
};

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  usdPerUnit: Record<string, number> = USD_PER_UNIT
): number {
  if (!isFinite(amount)) return 0;

  const fromRate = usdPerUnit[from.toUpperCase()];
  const toRate = usdPerUnit[to.toUpperCase()];

  if (!fromRate || !toRate) return amount;

  return (amount * fromRate) / toRate;
}

export function convertTransactionsToCurrency(
  transactions: BaseTransaction[],
  targetCurrency: string,
  options?: { decimals?: number; usdPerUnit?: Record<string, number> }
): BaseTransaction[] {
  const decimals = options?.decimals ?? 2;
  const table = options?.usdPerUnit ?? USD_PER_UNIT;
  const target = targetCurrency.toUpperCase();

  return transactions.map(tx => {
    const amount = parseFloat(tx.quantity);
    const converted = convertCurrency(amount, tx.currency, target, table);

    return {
      ...tx,
      quantity: converted.toFixed(decimals),
      currency: target
    };
  });
}

export function calculateRevenueByCountry(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): RevenueCountry[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  const WEEK = 7 * 24 * 60 * 60 * 1000;

  const lastWeekStart = toMs - WEEK;
  const prevWeekStart = toMs - 2 * WEEK;
  const prevWeekEnd = toMs - WEEK;

  const countryData = new Map<
    string,
    { totalRevenue: number; lastWeekRevenue: number; previousWeekRevenue: number }
  >();

  for (const t of transactions) {
    if (t.status !== "ok") continue;

    const txMs = t.dateRequest.getTime();
    if (txMs < fromMs || txMs > toMs) continue;

    const qty = parseFloat(t.quantity);
    if (isNaN(qty)) continue;

    if (!countryData.has(t.country)) {
      countryData.set(t.country, {
        totalRevenue: 0,
        lastWeekRevenue: 0,
        previousWeekRevenue: 0
      });
    }

    const ref = countryData.get(t.country)!;
    ref.totalRevenue += qty;

    if (txMs >= lastWeekStart && txMs <= toMs) ref.lastWeekRevenue += qty;
    if (txMs >= prevWeekStart && txMs < prevWeekEnd) ref.previousWeekRevenue += qty;
  }

  return [...countryData.entries()].map(([country, data]) => {
    let increase =
      data.previousWeekRevenue === 0
        ? data.lastWeekRevenue > 0
          ? 100
          : 0
        : ((data.lastWeekRevenue - data.previousWeekRevenue) / data.previousWeekRevenue) * 100;

    return {
      country,
      totalRevenue: parseFloat(data.totalRevenue.toFixed(2)),
      lastWeekIncrease: parseFloat(increase.toFixed(2))
    };
  });
}

export function processTransactionData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): ChartDataItem[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  let success = 0;
  let pending = 0;
  let fail = 0;

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs < fromMs || txMs > toMs) continue;

    if (tx.status === "ok") success++;
    else if (tx.status === "pending") pending++;
    else if (tx.status === "error") fail++;
  }

  return [
    { status: "success", count: success, fill: "var(--color-success)" },
    { status: "pending", count: pending, fill: "var(--color-pending)" },
    { status: "fail", count: fail, fill: "var(--color-fail)" }
  ];
}

export function filterTransactionsByDateRange(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): BaseTransaction[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  return transactions.filter(tx => {
    const txMs = tx.dateRequest.getTime();
    return txMs >= fromMs && txMs <= toMs;
  });
}

export function capitalizeFirstLetter(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export function extractCountryProviders(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): CountryProviders[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();

  const countries = new Map<string, CountryProviders>();

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs < fromMs || txMs > toMs) continue;

    const iso = tx.country.toUpperCase();

    if (!countries.has(iso)) {
      countries.set(iso, {
        id: iso.toLowerCase(),
        name: iso,
        isoCode: iso,
        currencyCode: tx.currency || null,
        providers: []
      });
    }

    const country = countries.get(iso)!;

    let provider = country.providers.find(p => p.id === tx.provider.toLowerCase());
    if (!provider) {
      provider = {
        id: tx.provider.toLowerCase(),
        name: capitalizeFirstLetter(tx.provider),
        description: null,
        methods: []
      };
      country.providers.push(provider);
    }

    const methodId = tx.payMethod.toLowerCase();
    if (!provider.methods.some(m => m.id === methodId)) {
      provider.methods.push({
        id: methodId,
        name: capitalizeFirstLetter(tx.payMethod),
        code: methodId,
        minLimit: null,
        maxLimit: null
      });
    }
  }

  return [...countries.values()];
}

export function extractCountryProvidersByMerchant(
  transactions: BaseTransaction[],
  from: Date,
  to: Date,
  merchantName: string
): CountryProviders[] {
  const fromMs = from.getTime();
  const toMs = to.getTime();
  const merchant = merchantName.toLowerCase();

  const countries = new Map<string, CountryProviders>();

  for (const tx of transactions) {
    const txMs = tx.dateRequest.getTime();
    if (txMs < fromMs || txMs > toMs) continue;

    if (getMerchantName(tx.merchantName).toLowerCase() !== merchant) continue;

    const iso = tx.country.toUpperCase();

    if (!countries.has(iso)) {
      countries.set(iso, {
        id: iso.toLowerCase(),
        name: iso,
        isoCode: iso,
        currencyCode: tx.currency || null,
        providers: []
      });
    }

    const country = countries.get(iso)!;

    let provider = country.providers.find(p => p.id === tx.provider.toLowerCase());
    if (!provider) {
      provider = {
        id: tx.provider.toLowerCase(),
        name: capitalizeFirstLetter(tx.provider),
        description: null,
        methods: []
      };
      country.providers.push(provider);
    }

    const methodId = tx.payMethod.toLowerCase();
    if (!provider.methods.some(m => m.id === methodId)) {
      provider.methods.push({
        id: methodId,
        name: capitalizeFirstLetter(tx.payMethod),
        code: methodId,
        minLimit: null,
        maxLimit: null
      });
    }
  }

  return [...countries.values()];
}

export function filterTransactionsByCriteria(
  transactions: BaseTransaction[],
  params: z.infer<typeof ReportFinanceStep1Schema>
): BaseTransaction[] {
  const merchant = params.merchantName.toLowerCase();
  const country = params.countryId.toUpperCase();

  const allowedProviders = new Map<string, Set<string>>();

  for (const p of params.providers) {
    const providerId = p.providerId.toLowerCase();
    const methods = new Set(p.methods.map(m => m.methodId.toLowerCase()));
    allowedProviders.set(providerId, methods);
  }

  return transactions.filter(tx => {
    if (getMerchantName(tx.merchantName).toLowerCase() !== merchant) return false;
    if (tx.country.toUpperCase() !== country) return false;

    const providerId = tx.provider.toLowerCase();
    const methodId = tx.payMethod.toLowerCase();

    return allowedProviders.has(providerId) && allowedProviders.get(providerId)!.has(methodId);
  });
}
