import { axiosWithAuth } from "../config";
import type { ImportResult } from "@/lib/types/import";

export async function importTransactions(
  transactions: Record<string, unknown>[]
): Promise<ImportResult[]> {
  const api = await axiosWithAuth();
  const { data } = await api.post<ImportResult[]>(
    "/api/transactions/import",
    transactions
  );
  return data;
}
