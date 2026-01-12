import { getProviders } from "@/lib/api/provider/getProvider";
import { Provider } from "@/lib/types/provider";
import { useQuery } from "@tanstack/react-query";

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ["providers"],
    queryFn: getProviders,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

