import z from "zod";

export interface DashboardStatsType {
  totalTransactions: number;
  avgOrderValue: number;
  successRate: number;
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
  revenueChange: number;
  revenueByCountry: RevenueCountry[];
  transactionsForChart: DailyTransactionSummary[];
  countriesData: CountryTransactionSummary[];
  revenuByDay: RevenueEntry[];
  chartConfig: ChartConfig;
  trxRate: ChartDataItem[];
  last5WeeksData: ChartDataWeekly[];
  last5WeeksAOVData: ChartDataWeekly[];
  last5WeeksSuccessRateData: ChartDataWeekly[];
  lastWeekIncreaseCount: number;
  lastWeekIncreaseAOV: number;
  lastWeekIncreaseSuccessRate: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueCountry {
  country: string;
  totalRevenue: number;
  lastWeekIncrease: number;
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

export interface RevenueEntry {
  date: string;
  name: string;
  revenue: number;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
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

export const StatsFilterSchema = z.object({
  merchantIds: z.array(z.string().uuid()).optional(),
  providerIds: z.array(z.string().uuid()).optional(),
  countryIds: z.array(z.string().uuid()).optional(),
  payMethodIds: z.array(z.string().uuid()).optional(),
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
});

export type StatsFilters = z.infer<typeof StatsFilterSchema>;

