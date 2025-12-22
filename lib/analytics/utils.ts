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

export const timestampToDate = (d: Date): Date => d;

export function generateGcpLogLink(trxid: string, duration = "P30D", authuser = 1): string {
  const projectId = "stratech-pay";
  const encodedQuery = encodeURIComponent(trxid);
  return `https://console.cloud.google.com/logs/query;query=${encodedQuery};duration=${duration}?authuser=${authuser}&project=${projectId}`;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

const getTxMs = (tx: BaseTransaction) => new Date(tx.dateRequest).getTime();

export type ChartConfigEntry = { label: string; color: string };
export type ChartConfig = { [key: string]: ChartConfigEntry };

export function calculateAOV(transactions: BaseTransaction[], start: Date, end: Date): number {
  const s = start.getTime();
  const e = end.getTime();

  let total = 0;
  let count = 0;

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;
    const ms = getTxMs(tx);
    if (ms < s || ms > e) continue;

    total += Number(tx.quantity);
    count++;
  }

  return count === 0 ? 0 : total / count;
}

export function calculateSuccessRate(transactions: BaseTransaction[], start: Date, end: Date): number {
  const from = start.getTime();
  const to = end.getTime();

  let total = 0;
  let ok = 0;

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < from || ms > to) continue;

    total++;
    if (tx.status === "ok") ok++;
  }

  return total === 0 ? 0 : (ok / total) * 100;
}

export function getNewTransactions(transactions: BaseTransaction[], start: Date, end: Date) {
  const s = start.getTime();
  const e = end.getTime();

  return transactions.filter(tx => {
    const ms = getTxMs(tx);
    return ms >= s && ms <= e;
  });
}

export function getTotalTransactions(transactions: BaseTransaction[], start: Date, end: Date): number {
  const s = start.getTime();
  const e = end.getTime();

  return transactions.filter(tx => {
    const ms = getTxMs(tx);
    return ms >= s && ms <= e;
  }).length;
}

export function aggregateTransactionsByDay(
  transactions: BaseTransaction[],
  start: Date,
  end: Date
): DailyTransactionSummary[] {
  const s = start.getTime();
  const e = end.getTime();

  const map: Record<string, { success: number; pending: number; fail: number }> = {};

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < s || ms > e) continue;

    const key = formatDate(new Date(ms));

    if (!map[key]) map[key] = { success: 0, pending: 0, fail: 0 };

    if (tx.status === "ok") map[key].success++;
    else if (tx.status === "pending") map[key].pending++;
    else map[key].fail++;
  }

  return Object.entries(map)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function groupTransactionsByCountry(
  transactions: BaseTransaction[],
  start: Date,
  end: Date
): CountryTransactionSummary[] {
  const s = start.getTime();
  const e = end.getTime();
  const map: Record<string, number> = {};

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < s || ms > e) continue;
    map[tx.country] = (map[tx.country] || 0) + 1;
  }

  return Object.keys(map).map(country => ({
    country,
    transactions: map[country],
    fill: "#2B9D90"
  }));
}

export function generateChartConfig(transactions: BaseTransaction[]): ChartConfig {
  const countries = [...new Set(transactions.map(t => t.country))];
  const cfg: ChartConfig = {};

  countries.forEach((c, i) => {
    cfg[c] = { label: c, color: `var(--chart-${i + 1})` };
  });

  return cfg;
}

export function calculateTotalRevenue(transactions: BaseTransaction[], start: Date, end: Date): number {
  const s = start.getTime();
  const e = end.getTime();
  let total = 0;

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;
    const ms = getTxMs(tx);
    if (ms < s || ms > e) continue;

    total += Number(tx.quantity);
  }

  return total;
}

export function aggregateRevenueByMonth(
  transactions: BaseTransaction[],
  start: Date,
  end: Date
): MonthlyRevenue[] {
  const s = start.getTime();
  const e = end.getTime();

  const m: Record<number, number> = {};

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;

    const ms = getTxMs(tx);
    if (ms < s || ms > e) continue;

    const month = new Date(ms).getMonth();
    m[month] = (m[month] || 0) + Number(tx.quantity);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return Object.keys(m).map(k => ({
    month: monthNames[Number(k)],
    revenue: m[Number(k)]
  }));
}

export function calculateRevenueChangeValue(
  transactions: BaseTransaction[],
  start: Date,
  end: Date
): number {
  const monthly = aggregateRevenueByMonth(transactions, start, end);
  if (monthly.length <= 1) return 0;

  const sorted = monthly.sort(
    (a, b) =>
      new Date(`${a.month} 1, 2024`).getTime() -
      new Date(`${b.month} 1, 2024`).getTime()
  );

  const last = sorted[sorted.length - 1].revenue;
  const prev = sorted.length > 1 ? sorted[sorted.length - 2].revenue : 0;

  return last - prev;
}

export function getTransactionDateRange(transactions: BaseTransaction[]) {
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
  end: Date
): ChartDataWeekly[] {
  const WEEK = 604800000;
  const DAY = 86400000;
  const endMs = end.getTime();

  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + DAY;

    const count = transactions.filter(t => {
      const ms = getTxMs(t);
      return ms >= weekStart && ms <= weekEnd;
    }).length;

    data.push({ week: `Week ${5 - i}`, amount: count });
  }

  return data;
}

export function getLast5WeeksAOVChartData(
  transactions: BaseTransaction[],
  end: Date
): ChartDataWeekly[] {
  const WEEK = 604800000;
  const DAY = 86400000;
  const endMs = end.getTime();

  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + DAY;

    const value = calculateAOV(transactions, new Date(weekStart), new Date(weekEnd));
    data.push({ week: `Week ${5 - i}`, amount: value });
  }

  return data;
}

export function getLast5WeeksSuccessRateChartData(
  transactions: BaseTransaction[],
  end: Date
): ChartDataWeekly[] {
  const WEEK = 604800000;
  const DAY = 86400000;
  const endMs = end.getTime();

  const data: ChartDataWeekly[] = [];

  for (let i = 4; i >= 0; i--) {
    const weekEnd = endMs - i * WEEK;
    const weekStart = weekEnd - WEEK + DAY;

    const txs = transactions.filter(t => {
      const ms = getTxMs(t);
      return ms >= weekStart && ms <= weekEnd;
    });

    const ok = txs.filter(t => t.status === "ok").length;
    const rate = txs.length === 0 ? 0 : (ok / txs.length) * 100;

    data.push({ week: `Week ${5 - i}`, amount: rate });
  }

  return data;
}

export interface LastWeekIncreaseResult {
  current: number;
  previous: number;
  percentage: number;
  successRateCurrent: number;
  successRatePrevious: number;
}

export function calculateLastWeekIncrease(
  transactions: BaseTransaction[],
  end: Date,
  type: "count" | "aov" | "successRate" = "count"
): LastWeekIncreaseResult {
  const WEEK = 604800000;
  const DAY = 86400000;

  const endMs = end.getTime();
  const currentStart = endMs - WEEK + DAY;
  const prevEnd = currentStart - DAY;
  const prevStart = prevEnd - WEEK + DAY;

  const currentTx = transactions.filter(t => {
    const ms = getTxMs(t);
    return ms >= currentStart && ms <= endMs;
  });

  const prevTx = transactions.filter(t => {
    const ms = getTxMs(t);
    return ms >= prevStart && ms <= prevEnd;
  });

  const success = (txs: BaseTransaction[]) =>
    txs.length === 0 ? 0 : (txs.filter(t => t.status === "ok").length / txs.length) * 100;

  const aov = (txs: BaseTransaction[]) =>
    txs.length === 0 ? 0 : txs.reduce((s, t) => s + Number(t.quantity), 0) / txs.length;

  let curr: number;
  let prev: number;

  if (type === "count") {
    curr = currentTx.length;
    prev = prevTx.length;
  } else if (type === "aov") {
    curr = aov(currentTx);
    prev = aov(prevTx);
  } else {
    curr = success(currentTx);
    prev = success(prevTx);
  }

  const pct = prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  return {
    current: curr,
    previous: prev,
    percentage: pct,
    successRateCurrent: success(currentTx),
    successRatePrevious: success(prevTx)
  };
}

export interface RevenueChartData {
  date: string;
  total: number;
  [country: string]: string | number;
}

const palette = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function generateRevenueChartData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
) {
  const f = from.getTime();
  const t = to.getTime();

  const countries = new Set<string>();
  const map = new Map<string, Map<string, number>>();

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;
    const ms = getTxMs(tx);
    if (ms < f || ms > t) continue;

    const date = new Date(ms).toISOString().split("T")[0];
    const qty = Number(tx.quantity);
    if (isNaN(qty)) continue;

    countries.add(tx.country);

    if (!map.has(date)) map.set(date, new Map());

    const m = map.get(date)!;
    m.set(tx.country, (m.get(tx.country) || 0) + qty);
  }

  const sorted = [...map.keys()].sort();
  const data: RevenueChartData[] = [];

  for (const date of sorted) {
    const entry: RevenueChartData = { date, total: 0 };
    const m = map.get(date)!;

    [...countries].sort().forEach(c => {
      const v = m.get(c) || 0;
      entry[c] = Number(v.toFixed(2));
      entry.total += v;
    });

    entry.total = Number(entry.total.toFixed(2));
    data.push(entry);
  }

  const config: ChartConfig = {
    total: { label: "Total Revenue", color: "hsl(var(--chart-3))" }
  };

  [...countries].forEach((c, i) => {
    config[c] = { label: c, color: palette[i % palette.length] };
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

export function convertCurrency(amount: number, from: string, to: string, table = USD_PER_UNIT): number {
  if (!isFinite(amount)) return 0;

  const fromRate = table[from.toUpperCase()];
  const toRate = table[to.toUpperCase()];

  if (!fromRate || !toRate) return amount;

  return (amount * fromRate) / toRate;
}

export function convertTransactionsToCurrency(
  transactions: BaseTransaction[],
  target: string,
  options?: { decimals?: number; usdPerUnit?: Record<string, number> }
): BaseTransaction[] {
  const decimals = options?.decimals ?? 2;
  const table = options?.usdPerUnit ?? USD_PER_UNIT;
  const tgt = target.toUpperCase();

  return transactions.map(tx => {
    const qty = Number(tx.quantity);
    const converted = convertCurrency(qty, tx.currency, tgt, table);

    return {
      ...tx,
      quantity: converted.toFixed(decimals),
      currency: tgt
    };
  });
}

export function calculateRevenueByCountry(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): RevenueCountry[] {
  const f = from.getTime();
  const t = to.getTime();

  const WEEK = 604800000;
  const lastWeekStart = t - WEEK;
  const prevWeekStart = t - 2 * WEEK;
  const prevWeekEnd = t - WEEK;

  const map = new Map<
    string,
    { total: number; lastWeek: number; prevWeek: number }
  >();

  for (const tx of transactions) {
    if (tx.status !== "ok") continue;

    const ms = getTxMs(tx);
    if (ms < f || ms > t) continue;

    const qty = Number(tx.quantity);
    if (!isFinite(qty)) continue;

    if (!map.has(tx.country)) {
      map.set(tx.country, { total: 0, lastWeek: 0, prevWeek: 0 });
    }

    const ref = map.get(tx.country)!;

    ref.total += qty;

    if (ms >= lastWeekStart) ref.lastWeek += qty;
    if (ms >= prevWeekStart && ms < prevWeekEnd) ref.prevWeek += qty;
  }

  return [...map.entries()].map(([country, r]) => {
    const pct =
      r.prevWeek === 0 ? (r.lastWeek > 0 ? 100 : 0) : ((r.lastWeek - r.prevWeek) / r.prevWeek) * 100;

    return {
      country,
      totalRevenue: Number(r.total.toFixed(2)),
      lastWeekIncrease: Number(pct.toFixed(2))
    };
  });
}

export function processTransactionData(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): ChartDataItem[] {
  const f = from.getTime();
  const t = to.getTime();

  let ok = 0;
  let pending = 0;
  let fail = 0;

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < f || ms > t) continue;

    if (tx.status === "ok") ok++;
    else if (tx.status === "pending") pending++;
    else fail++;
  }

  return [
    { status: "success", count: ok, fill: "var(--color-success)" },
    { status: "pending", count: pending, fill: "var(--color-pending)" },
    { status: "fail", count: fail, fill: "var(--color-fail)" }
  ];
}

export function filterTransactionsByDateRange(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): BaseTransaction[] {
  const f = from.getTime();
  const t = to.getTime();

  return transactions.filter(tx => {
    const ms = getTxMs(tx);
    return ms >= f && ms <= t;
  });
}

export function capitalize(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

export function extractCountryProviders(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): CountryProviders[] {
  const f = from.getTime();
  const t = to.getTime();

  const map = new Map<string, CountryProviders>();

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < f || ms > t) continue;

    const iso = tx.country.toUpperCase();
    if (!map.has(iso)) {
      map.set(iso, {
        id: iso.toLowerCase(),
        name: iso,
        isoCode: iso,
        currencyCode: tx.currency,
        providers: []
      });
    }

    const country = map.get(iso)!;

    let provider = country.providers.find(p => p.id === tx.provider.toLowerCase());
    if (!provider) {
      provider = {
        id: tx.provider.toLowerCase(),
        name: capitalize(tx.provider),
        description: null,
        methods: []
      };
      country.providers.push(provider);
    }

    const methodId = tx.payMethod.toLowerCase();
    if (!provider.methods.some(m => m.id === methodId)) {
      provider.methods.push({
        id: methodId,
        name: capitalize(tx.payMethod),
        code: methodId,
        minLimit: null,
        maxLimit: null
      });
    }
  }

  return [...map.values()];
}

export function extractCountryProvidersByMerchant(
  transactions: BaseTransaction[],
  from: Date,
  to: Date,
  merchantName: string
): CountryProviders[] {
  const f = from.getTime();
  const t = to.getTime();
  const merchant = merchantName.toLowerCase();

  const map = new Map<string, CountryProviders>();

  for (const tx of transactions) {
    const ms = getTxMs(tx);
    if (ms < f || ms > t) continue;

    if (getMerchantName(tx.merchantName).toLowerCase() !== merchant) continue;

    const iso = tx.country.toUpperCase();
    if (!map.has(iso)) {
      map.set(iso, {
        id: iso.toLowerCase(),
        name: iso,
        isoCode: iso,
        currencyCode: tx.currency,
        providers: []
      });
    }

    const country = map.get(iso)!;

    let provider = country.providers.find(p => p.id === tx.provider.toLowerCase());
    if (!provider) {
      provider = {
        id: tx.provider.toLowerCase(),
        name: capitalize(tx.provider),
        description: null,
        methods: []
      };
      country.providers.push(provider);
    }

    const methodId = tx.payMethod.toLowerCase();
    if (!provider.methods.some(m => m.id === methodId)) {
      provider.methods.push({
        id: methodId,
        name: capitalize(tx.payMethod),
        code: methodId,
        minLimit: null,
        maxLimit: null
      });
    }
  }

  return [...map.values()];
}

export function filterTransactionsByCriteria(
  transactions: BaseTransaction[],
  params: z.infer<typeof ReportFinanceStep1Schema>
): BaseTransaction[] {
  const merchant = params.merchantName.toLowerCase();
  const country = params.countryId.toUpperCase();

  const allowed = new Map<string, Set<string>>();

  for (const p of params.providers) {
    const providerId = p.providerId.toLowerCase();
    const methods = new Set(p.methods.map(m => m.methodId.toLowerCase()));
    allowed.set(providerId, methods);
  }

  return transactions.filter(tx => {
    if (getMerchantName(tx.merchantName).toLowerCase() !== merchant) return false;
    if (tx.country.toUpperCase() !== country) return false;

    const providerId = tx.provider.toLowerCase();
    const methodId = tx.payMethod.toLowerCase();

    return allowed.has(providerId) && allowed.get(providerId)!.has(methodId);
  });
}
