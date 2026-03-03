import { useQuery } from "@tanstack/react-query"
import { OperationsFilters, OperationsStatsResponse } from "@/lib/types/operations"
import { getOperationsStats } from "@/lib/api/operations/getOperationsStats"
import { toast } from "sonner"

export function useOperationsStats(filters?: OperationsFilters, enabled = true) {
  return useQuery<OperationsStatsResponse>({
    queryKey: ["operations-stats", filters],
    queryFn: async () => {
      const stats = await getOperationsStats(filters)
      return stats
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
        toast.error("Error loading operations data", {
          description:
            error.message || "Failed to fetch operations stats. Please try again.",
        })
      },
    },
  })
}
