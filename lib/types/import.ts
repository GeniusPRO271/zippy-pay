export interface ImportResultSuccess {
  success: true;
  id: string;
  type: "PAYIN" | "PAYOUT";
  commerceReqId: string;
}

export interface ImportResultDuplicate {
  success: false;
  skipped: true;
  reason: string;
  commerceReqId: string;
  type: "PAYIN" | "PAYOUT";
}

export interface ImportResultError {
  success: false;
  skipped?: undefined;
  type: "PAYIN" | "PAYOUT";
  error: string;
  errorCode?: string;
  errorDetail?: string;
  errorConstraint?: string;
  data?: unknown;
}

export type ImportResult =
  | ImportResultSuccess
  | ImportResultDuplicate
  | ImportResultError;

export interface ImportSummary {
  total: number;
  successes: number;
  duplicates: number;
  errors: number;
  results: ImportResult[];
}
