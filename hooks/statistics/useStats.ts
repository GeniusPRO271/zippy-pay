import { useQuery } from "@tanstack/react-query"
import { DashboardStatsType, StatsFilters } from "@/lib/types/statistics"
import { getDashboardStats } from "@/lib/api/statistics/getStats"
import { toast } from "sonner"
import { useRef } from "react"

export function useDashboardStats(filters?: StatsFilters, enabled = true) {
  const isInitialLoad = useRef(true)

  return useQuery<DashboardStatsType>({
    queryKey: ["dashboard-stats", filters],
    queryFn: async () => {
      console.debug("[useDashboardStats] Fetching stats with filters:", filters)
      const stats = await getDashboardStats(filters)
      console.debug("[useDashboardStats] Stats fetched successfully", stats)
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
        toast.error("Error loading dashboard", {
          description: error.message || "Failed to fetch analytics data. Please try again.",
        })
      },
    },
  })
}
