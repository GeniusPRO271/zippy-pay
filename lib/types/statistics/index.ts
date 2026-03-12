import z from "zod";

export interface PaymentBreakdown {
  total: number;
  payInTotal: number;
  payOutTotal: number;
  net: number;
}

export interface ComparisonData {
  from: string;
  to: string;
  deltaTransactions: number;
  deltaAOV: number;
  deltaSuccessRate: number;
  deltaRevenue: number;
}

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
  paymentBreakdown: PaymentBreakdown;
  comparison?: ComparisonData;
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

export interface MerchantMethodDayData {
  date: string;
  approvalRate: number;
  numTransactions: number;
  providersUsed: string[];
}

export interface MerchantMethodRow {
  method: string;
  dailyData: MerchantMethodDayData[];
}

export interface MerchantApprovalData {
  merchantName: string;
  methods: MerchantMethodRow[];
}

export interface ApprovalRatesPagination {
  page: number;
  pageSize: number;
  totalDays: number;
  totalPages: number;
}

export interface ProviderDayData {
  date: string;
  approvalRate: number;
  numTransactions: number;
}

export interface ProviderApprovalData {
  providerName: string;
  dailyData: ProviderDayData[];
}

export interface ApprovalRatesResponse {
  data: MerchantApprovalData[];
  providerApprovalData: ProviderApprovalData[];
  pagination: ApprovalRatesPagination;
}


export const StatsFilterSchema = z.object({
  merchantId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  providerId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  countryId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  payMethodId: z
    .union([z.string().uuid(), z.array(z.string().uuid())])
    .optional()
    .transform((val) => (val ? ([] as string[]).concat(val) : [])),

  from: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  to: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),

  comparisonType: z
    .enum(["previous_period", "previous_month", "previous_year"])
    .optional(),
}).transform((filters) => ({
  ...filters,
  from: filters.from || undefined,
  to: filters.to || undefined,
}))

export type StatsFilters = z.infer<typeof StatsFilterSchema>
