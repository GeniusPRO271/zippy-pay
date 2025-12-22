import { getAllTransactions } from "@/lib/api/transactions"
import { useQuery } from "@tanstack/react-query"
import type { BaseTransaction } from "@/lib/types/transaction"

export function useTransactions() {
  return useQuery<BaseTransaction[]>({
    queryKey: ["transactions"],
    queryFn: () => getAllTransactions(),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })
}
