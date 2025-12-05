"use client"

import { BaseTransaction } from "../types/transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface CreateReportResponse {
  id: string;
  status: string;
}


export async function getAllTransactions(): Promise<BaseTransaction[]> {
  const res = await fetch(`${API_URL}/transactions/v2`, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch reports');

  const data: BaseTransaction[] = await res.json();
  console.log("TRANSACTIONS FROM API:", data);

  return data;
}
