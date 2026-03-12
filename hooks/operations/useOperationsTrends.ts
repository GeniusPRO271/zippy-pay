import { useQuery } from "@tanstack/react-query"
import { OperationsTrendsFilters, OperationsTrendsResponse } from "@/lib/types/operations/trends"
import { getOperationsTrends } from "@/lib/api/operations/getOperationsStats"
import { toast } from "sonner"

export function useOperationsTrends(filters: OperationsTrendsFilters, enabled = true) {
  return useQuery<OperationsTrendsResponse>({
    queryKey: ["operations-trends", filters],
    queryFn: async () => {
      const trends = await getOperationsTrends(filters)
      return trends
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
        toast.error("Error loading trends data", {
          description:
            error.message || "Failed to fetch operations trends. Please try again.",
        })
      },
    },
  })
}
