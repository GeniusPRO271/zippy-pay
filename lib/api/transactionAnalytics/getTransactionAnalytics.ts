import {
  TransactionAnalyticsFilters,
  TransactionAnalyticsResponse,
} from "@/lib/types/transactionAnalytics"
import {
  TransactionAnalyticsTrendsFilters,
  TransactionAnalyticsTrendsResponse,
} from "@/lib/types/transactionAnalytics/trends"
import { axiosWithAuth } from "../config"
import { fromZonedTime } from "date-fns-tz"

const CHILE_TIMEZONE = "America/Santiago"

function chileDayToUTCISOString(
  date: string | Date,
  type: "start" | "end"
): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date)

  if (type === "start") {
    d.setHours(0, 0, 0, 0)
  } else {
    d.setHours(23, 59, 59, 999)
  }

  const utcDate = fromZonedTime(d, CHILE_TIMEZONE)
  return utcDate.toISOString()
}

export async function getTransactionAnalytics(
  filters?: TransactionAnalyticsFilters
): Promise<TransactionAnalyticsResponse> {
  try {
    const params = new URLSearchParams()

    if (filters?.from) {
      params.append("from", chileDayToUTCISOString(filters.from, "start"))
    }
    if (filters?.to) {
      params.append("to", chileDayToUTCISOString(filters.to, "end"))
    }
    if (filters?.methodType) {
      params.append("methodType", filters.methodType)
    }

    const merchantIds = filters?.merchantId ?? []
    merchantIds.forEach((id) => params.append("merchantId", id))

    const providerIds = filters?.providerId ?? []
    providerIds.forEach((id) => params.append("providerId", id))

    const countryIds = filters?.countryId ?? []
    countryIds.forEach((id) => params.append("countryId", id))

    const payMethodIds = filters?.payMethodId ?? []
    payMethodIds.forEach((id) => params.append("payMethodId", id))

    const api = await axiosWithAuth()
    const { data } = await api.get<TransactionAnalyticsResponse>(
      `/api/stats/transaction-analytics?${params.toString()}`
    )
    return data
  } catch (error) {
    console.error("[getTransactionAnalytics] Error:", error)
    throw error
  }
}

export async function getTransactionAnalyticsTrends(
  filters: TransactionAnalyticsTrendsFilters
): Promise<TransactionAnalyticsTrendsResponse> {
  try {
    const params = new URLSearchParams()

    params.append("from", chileDayToUTCISOString(filters.from, "start"))
    params.append("to", chileDayToUTCISOString(filters.to, "end"))
    params.append("aggregation", filters.aggregation)

    if (filters.methodType) {
      params.append("methodType", filters.methodType)
    }

    const merchantIds = filters.merchantId ?? []
    merchantIds.forEach((id) => params.append("merchantId", id))

    const providerIds = filters.providerId ?? []
    providerIds.forEach((id) => params.append("providerId", id))

    const countryIds = filters.countryId ?? []
    countryIds.forEach((id) => params.append("countryId", id))

    const payMethodIds = filters.payMethodId ?? []
    payMethodIds.forEach((id) => params.append("payMethodId", id))

    const api = await axiosWithAuth()
    const { data } = await api.get<TransactionAnalyticsTrendsResponse>(
      `/api/stats/transaction-analytics/trends?${params.toString()}`
    )
    return data
  } catch (error) {
    console.error("[getTransactionAnalyticsTrends] Error:", error)
    throw error
  }
}
