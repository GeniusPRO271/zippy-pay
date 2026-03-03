import { useQuery } from "@tanstack/react-query"
import {
  TransactionFilters,
  TransactionsResponse,
} from "@/lib/types/transactions"
import { getTransactions } from "@/lib/api/transactions/getTransactions"
import { toast } from "sonner"

export function useTransactions(
  filters?: TransactionFilters,
  page = 1,
  pageSize = 25,
  enabled = true
) {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", filters, page, pageSize],
    queryFn: async () => {
      const data = await getTransactions(filters, page, pageSize)
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
        toast.error("Error loading transactions", {
          description:
            error.message || "Failed to fetch transactions data.",
        })
      },
    },
  })
}
