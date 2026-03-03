import {
  TransactionFilters,
  TransactionsResponse,
} from "@/lib/types/transactions"
import { axiosWithAuth } from "../config"
import { fromZonedTime } from "date-fns-tz"

const CHILE_TIMEZONE = "America/Santiago"

function chileDayToUTCISOString(
  date: string | Date,
  type: "start" | "end"
): string {
  const d = typeof date === "string" ? new Date(date) : new Date(date)

  if (type === "start") {
    d.setHours(0, 0, 0, 0)
  } else {
    d.setHours(23, 59, 59, 999)
  }

  const utcDate = fromZonedTime(d, CHILE_TIMEZONE)
  return utcDate.toISOString()
}

function buildParams(
  filters?: TransactionFilters,
  page?: number,
  pageSize?: number
): URLSearchParams {
  const params = new URLSearchParams()

  if (page !== undefined) params.append("page", String(page))
  if (pageSize !== undefined) params.append("pageSize", String(pageSize))

  if (!filters) return params

  if (filters.methodType) params.append("methodType", filters.methodType)

  filters.payMethodId?.forEach((id) => params.append("payMethodId", id))
  filters.status?.forEach((s) => params.append("status", s))
  filters.merchantId?.forEach((id) => params.append("merchantId", id))
  filters.providerId?.forEach((id) => params.append("providerId", id))
  filters.countryId?.forEach((id) => params.append("countryId", id))

  if (filters.requestDateFrom) {
    params.append("requestDateFrom", chileDayToUTCISOString(filters.requestDateFrom, "start"))
  }
  if (filters.requestDateTo) {
    params.append("requestDateTo", chileDayToUTCISOString(filters.requestDateTo, "end"))
  }
  if (filters.transferDateFrom) {
    params.append("transferDateFrom", chileDayToUTCISOString(filters.transferDateFrom, "start"))
  }
  if (filters.transferDateTo) {
    params.append("transferDateTo", chileDayToUTCISOString(filters.transferDateTo, "end"))
  }

  if (filters.searchName) params.append("name", filters.searchName)
  if (filters.searchEmail) params.append("email", filters.searchEmail)
  if (filters.searchIdDocument) params.append("idDocument", filters.searchIdDocument)
  if (filters.amountMin !== undefined) params.append("amountMin", String(filters.amountMin))
  if (filters.amountMax !== undefined) params.append("amountMax", String(filters.amountMax))
  if (filters.searchZippyId) params.append("zippyId", filters.searchZippyId)
  if (filters.searchMerchantId) params.append("commerceReqId", filters.searchMerchantId)

  return params
}

export async function getTransactions(
  filters?: TransactionFilters,
  page = 1,
  pageSize = 25
): Promise<TransactionsResponse> {
  try {
    const params = buildParams(filters, page, pageSize)
    const api = await axiosWithAuth()
    const { data } = await api.get<TransactionsResponse>(
      `/api/transactions?${params.toString()}`
    )
    return data
  } catch (error) {
    console.error("[getTransactions] Error:", error)
    throw error
  }
}

export async function exportTransactions(
  filters?: TransactionFilters
): Promise<Blob> {
  try {
    const params = buildParams(filters)
    params.append("format", "csv")
    const api = await axiosWithAuth()
    const { data } = await api.get(`/api/transactions/export?${params.toString()}`, {
      responseType: "blob",
    })
    return data
  } catch (error) {
    console.error("[exportTransactions] Error:", error)
    throw error
  }
}
