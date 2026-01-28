import {
  DashboardStatsType,
  StatsFilters,
} from "@/lib/types/statistics";
import { axiosWithAuth } from "../config";
import { fromZonedTime } from "date-fns-tz";

const CHILE_TIMEZONE = "America/Santiago";

/**
 * Converts a Chile-local date to a UTC ISO string (Z)
 * required by the API / Zod schema.
 */
function chileToUTCISOString(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Interpret the date as Chile local time, then convert to UTC
  const utcDate = fromZonedTime(d, CHILE_TIMEZONE);

  return utcDate.toISOString();
}

export async function getDashboardStats(
  filters?: StatsFilters
): Promise<DashboardStatsType> {
  try {
    console.log("CALLING API WITH FILTERS:", filters);

    const params = new URLSearchParams();

    const merchantIds = filters?.merchantId ?? [];
    const providerIds = filters?.providerId ?? [];
    const countryIds = filters?.countryId ?? [];
    const payMethodIds = filters?.payMethodId ?? [];

    merchantIds.forEach((id) => params.append("merchantId", id));
    providerIds.forEach((id) => params.append("providerId", id));
    countryIds.forEach((id) => params.append("countryId", id));
    payMethodIds.forEach((id) => params.append("payMethodId", id));

    // ✅ Chile timezone → UTC ISO (Zod compatible)
    if (filters?.from) {
      params.append("from", chileToUTCISOString(filters.from));
    }

    if (filters?.to) {
      params.append("to", chileToUTCISOString(filters.to));
    }

    const api = await axiosWithAuth();

    const { data } = await api.get<DashboardStatsType>(
      `/api/stats?${params.toString()}`
    );

    return data;
  } catch (error) {
    console.error(
      "[getDashboardStats] Error fetching dashboard stats:",
      error
    );
    throw error;
  }
}
