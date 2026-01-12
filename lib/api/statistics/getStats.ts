import { DashboardStatsType, StatsFilters } from "@/lib/types/statistics"
import { axiosWithAuth } from "../config"

export async function getDashboardStats(
  filters?: StatsFilters
): Promise<DashboardStatsType> {

  try {
    const params = new URLSearchParams()

    const merchantIds = filters?.merchantIds ? ([] as string[]).concat(filters.merchantIds) : []
    const providerIds = filters?.providerIds ? ([] as string[]).concat(filters.providerIds) : []
    const countryIds = filters?.countryIds ? ([] as string[]).concat(filters.countryIds) : []
    const payMethodIds = filters?.payMethodIds ? ([] as string[]).concat(filters.payMethodIds) : []

    merchantIds.forEach(id => params.append("merchantId", id))
    providerIds.forEach(id => params.append("providerId", id))
    countryIds.forEach(id => params.append("countryId", id))
    payMethodIds.forEach(id => params.append("payMethodId", id))

    const now = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const from = filters?.dateRange?.from ?? thirtyDaysAgo.toISOString()
    const to = filters?.dateRange?.to ?? now.toISOString()

    params.append("from", from)
    params.append("to", to)

    const api = await axiosWithAuth()

    const { data } = await api.get<DashboardStatsType>(`/api/stats?${params.toString()}`)

    return data
  } catch (error) {
    console.error("[getDashboardStats] Error fetching dashboard stats:", error)
    throw error
  }
}
