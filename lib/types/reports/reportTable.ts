export interface ReportRecord {
  id: string;
  merchantName: string;
  reportType: "financial" | "resume";
  country: string;
  status: 'queued' | 'processing' | 'done' | 'failed';
  resultUrl: string;
  createdAt: string;
  updatedAt: string;
}
