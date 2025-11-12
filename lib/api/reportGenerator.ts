import { ReportRecord } from "../types/reports/reportTable";
import { BaseTransaction } from "../types/transaction";
import { FinalMerchantCommissionType } from "../zod/reportForm";
import { ReportResumeType } from "../zod/reportResumeForm";

const API_URL = 'http://localhost:3110';

export interface CreateReportRequest {
  reportType: 'financial' | 'resume';
  application?: FinalMerchantCommissionType | ReportResumeType
  transactions: BaseTransaction[];
}

export interface CreateReportResponse {
  id: string;
  status: string;
}

export async function createReport(
  payload: CreateReportRequest
): Promise<CreateReportResponse> {
  const res = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create report (${res.status})`);
  }

  return res.json();
}


export async function getAllReports(): Promise<ReportRecord[]> {
  const res = await fetch(`${API_URL}/reports`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function downloadReport(reportId: string): Promise<Blob> {
  const res = await fetch(`${API_URL}/reports/${reportId}/download`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Failed to download report: ${res.statusText}`);
  }

  return await res.blob();
}

export async function downloadReportFile(reportId: string, fileName?: string) {
  const blob = await downloadReport(reportId);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || `report_${reportId}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
