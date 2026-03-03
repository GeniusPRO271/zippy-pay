import { AggregationLevel } from "@/lib/types/operations/trends"

export interface TrendDataPoint {
  date: string
  effectivenessPercent: number
  approved: number
  pending: number
  failed: number
}

export interface TransactionAnalyticsTrendsFilters {
  from: string
  to: string
  aggregation: AggregationLevel
  methodType?: "payin" | "payout"
  payMethodId?: string[]
  merchantId?: string[]
  providerId?: string[]
  countryId?: string[]
}

export interface TransactionAnalyticsTrendsResponse {
  data: TrendDataPoint[]
}
