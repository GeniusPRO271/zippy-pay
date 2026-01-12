import { getMerchants } from "@/lib/api/merchant/getMerchant";
import { Merchant } from "@/lib/types/merchant";
import { useQuery } from "@tanstack/react-query";

export function useMerchants() {
  return useQuery<Merchant[]>({
    queryKey: ["merchants"],
    queryFn: getMerchants,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

