import { AxiosError } from "axios"
import { ReportRecord } from "../types/reports/reportTable"
import { CreateReportSchemaType } from "../zod/createReport"
import { axiosWithAuth } from "./config"

export interface CreateReportResponse {
  id: string
  status: string
}

type ApiErrorResponse = {
  error?: {
    message?: string
  }
}

export async function createReport(
  payload: CreateReportSchemaType
): Promise<CreateReportResponse> {
  try {
    const client = await axiosWithAuth()
    const { data } = await client.post<CreateReportResponse>(
      "/api/reports",
      payload
    )
    return data
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>

    const message =
      error.response?.data?.error?.message ??
      `Failed to create report (${error.response?.status})`

    throw new Error(message)
  }
}

export async function getAllReports(): Promise<ReportRecord[]> {
  try {
    const client = await axiosWithAuth()
    const { data } = await client.get<ReportRecord[]>("/api/reports")
    return data
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>

    throw new Error(
      error.response?.data?.error?.message ?? "Failed to fetch reports"
    )
  }
}

export interface DownloadReportResponse {
  url: string
  fileName: string
}

export async function downloadReport(
  reportId: string
): Promise<DownloadReportResponse> {
  try {
    const client = await axiosWithAuth()
    const { data } = await client.get<DownloadReportResponse>(
      `/api/reports/${reportId}/download`
    )
    return data
  } catch (err) {
    const error = err as AxiosError<ApiErrorResponse>

    throw new Error(
      error.response?.data?.error?.message ?? "Failed to download report"
    )
  }
}
