import {
  getMerchantFinanceOptions,
  MerchantFinanceOptions,
} from "@/lib/api/merchant/getMerchantFinanceOptions"
import { useQuery } from "@tanstack/react-query"

export function useMerchantFinanceOptions(id: string) {
  return useQuery<MerchantFinanceOptions>({
    queryKey: ["merchant-finance-options", id],
    queryFn: () => getMerchantFinanceOptions(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  })
}
