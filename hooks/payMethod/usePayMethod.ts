import { getPayMethods } from "@/lib/api/payMethod/getPayMethod";
import { PayMethod } from "@/lib/types/payMethod";
import { useQuery } from "@tanstack/react-query";

export function usePayMethods() {
  return useQuery<PayMethod[]>({
    queryKey: ["pay-methods"],
    queryFn: getPayMethods,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
