import { useQuery } from "@tanstack/react-query"
import {
  TransactionAnalyticsFilters,
  TransactionAnalyticsResponse,
} from "@/lib/types/transactionAnalytics"
import {
  TransactionAnalyticsTrendsFilters,
  TransactionAnalyticsTrendsResponse,
} from "@/lib/types/transactionAnalytics/trends"
import {
  getTransactionAnalytics,
  getTransactionAnalyticsTrends,
} from "@/lib/api/transactionAnalytics/getTransactionAnalytics"
import { toast } from "sonner"

export function useTransactionAnalytics(
  filters?: TransactionAnalyticsFilters,
  enabled = true
) {
  return useQuery<TransactionAnalyticsResponse>({
    queryKey: ["transaction-analytics", filters],
    queryFn: async () => {
      const data = await getTransactionAnalytics(filters)
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast.error("Error loading transaction analytics", {
          description:
            error.message || "Failed to fetch transaction analytics data.",
        })
      },
    },
  })
}

export function useTransactionAnalyticsTrends(
  filters?: TransactionAnalyticsTrendsFilters,
  enabled = true
) {
  return useQuery<TransactionAnalyticsTrendsResponse>({
    queryKey: ["transaction-analytics-trends", filters],
    queryFn: async () => {
      const data = await getTransactionAnalyticsTrends(filters!)
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: enabled && !!filters,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        toast.error("Error loading analytics trends", {
          description:
            error.message || "Failed to fetch analytics trend data.",
        })
      },
    },
  })
}
