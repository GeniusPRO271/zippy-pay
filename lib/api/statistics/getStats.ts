import {
  DashboardStatsType,
  StatsFilters,
  ApprovalRatesResponse,
} from "@/lib/types/statistics";
import { axiosWithAuth } from "../config";
import { fromZonedTime } from "date-fns-tz";

const CHILE_TIMEZONE = "America/Santiago";

/**
 * Convert a date to Chile local time
 * and force start or end of day, then convert to UTC ISO string.
 */
function chileDayToUTCISOString(
  date: string | Date,
  type: "start" | "end"
): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date);

  if (type === "start") {
    d.setHours(0, 0, 0, 0);
  } else {
    d.setHours(23, 59, 59, 999);
  }

  // Interpret the date as Chile local time → convert to UTC
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

    // ✅ Chile day boundaries → UTC ISO
    if (filters?.from) {
      params.append(
        "from",
        chileDayToUTCISOString(filters.from, "start")
      );
    }

    if (filters?.to) {
      params.append(
        "to",
        chileDayToUTCISOString(filters.to, "end")
      );
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

export async function getApprovalRates(
  page: number,
  pageSize: number,
  filters?: StatsFilters
): Promise<ApprovalRatesResponse> {
  try {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    const merchantIds = filters?.merchantId ?? [];
    const providerIds = filters?.providerId ?? [];
    const countryIds = filters?.countryId ?? [];
    const payMethodIds = filters?.payMethodId ?? [];

    merchantIds.forEach((id) => params.append("merchantId", id));
    providerIds.forEach((id) => params.append("providerId", id));
    countryIds.forEach((id) => params.append("countryId", id));
    payMethodIds.forEach((id) => params.append("payMethodId", id));

    const api = await axiosWithAuth();

    const { data } = await api.get<ApprovalRatesResponse>(
      `/api/stats/approval-rates?${params.toString()}`
    );

    return data;
  } catch (error) {
    console.error(
      "[getApprovalRates] Error fetching approval rates:",
      error
    );
    throw error;
  }
}
