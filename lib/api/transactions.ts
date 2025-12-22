"use client"

import { BaseTransaction } from "../types/transaction";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export interface CreateReportResponse {
  id: string;
  status: string;
}

export async function getAllTransactions(batchSize = 10000): Promise<BaseTransaction[]> {
  let page = 1;
  const limit = 1000;
  const allData: BaseTransaction[] = [];

  console.log("Starting transaction download...");

  while (true) {
    const res = await fetch(`${API_URL}/transactions/v2?page=${page}&limit=${limit}`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`Failed on page ${page}`);

    const json = await res.json();

    const transactions = json.data as BaseTransaction[];
    const meta = json.meta;

    allData.push(...transactions);

    if (page % 50 === 0) {
      console.log(`Downloaded ${allData.length} transactions so far...`);
    }

    if (allData.length >= batchSize) {
      console.log(`Batch of ${batchSize} reached`);
    }

    if (!meta.hasNextPage) break;

    page++;
  }

  console.log(`Finished: total downloaded = ${allData.length}`);
  return allData;
}
