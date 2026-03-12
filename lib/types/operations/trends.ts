export type AggregationLevel = "day" | "week" | "month"

export interface TrendDataPoint {
  date: string
  transactionCount: number
  amount: number | null
}

export interface OperationsTrendsFilters {
  from: string
  to: string
  aggregation: AggregationLevel
  methodType?: "payin" | "payout"
  status?: string[]
  payMethodId?: string[]
  merchantId?: string[]
  providerId?: string[]
  countryId?: string[]
  currency?: string
}

export interface OperationsTrendsResponse {
  data: TrendDataPoint[]
  currency: string | null
}

export const AGGREGATION_MAX_RANGE: Record<AggregationLevel, number> = {
  day: 30,
  week: 182,   // 26 weeks
  month: 730,  // ~24 months
}

export const AGGREGATION_LABELS: Record<AggregationLevel, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
}
