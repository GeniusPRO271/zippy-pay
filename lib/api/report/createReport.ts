import { axiosWithAuth } from "../config"
import { CreateReportRequest } from "@/lib/types/reports"

export interface ReportJob {
  id: string
  status: "queued" | "processing" | "done" | "failed"
  resultUrl?: string
}

export async function createReport(
  reportData: CreateReportRequest
): Promise<ReportJob> {
  const api = await axiosWithAuth()
  const { data } = await api.post<ReportJob>(
    "/api/reports",
    reportData
  )
  return data
}
