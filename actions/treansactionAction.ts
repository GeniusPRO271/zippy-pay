"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transactions } from "@/db/schema/transactions";
import type { Transaction } from "@/types/transaction";

export const getTransactions = async (): Promise<Transaction[]> => {
  const data = await db.select().from(transactions);

  const typedData: Transaction[] = data.map((t) => ({
    id: t.id,
    merchantId: t.merchantId,
    transactionId: t.transactionId,
    amount: t.amount.toString(), // convert numeric to string
    currency: t.currency as Transaction["currency"],
    country: t.country as Transaction["country"],
    payMethod: t.payMethod as Transaction["payMethod"],
    documentId: t.documentId ?? undefined,
    email: t.email,
    name: t.name,
    status: t.status as Transaction["status"],
    message: t.message ?? undefined,
    zippyId: t.zippyId ?? undefined,
    sign: t.sign ?? undefined,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  console.log("[DEBUG] getTransactions:", typedData);
  return typedData;
};

export const addTransaction = async (transaction: Transaction) => {
  await db.insert(transactions).values(transaction);
  console.log("[DEBUG] addTransaction:", transaction);
};

export const deleteTransaction = async (id: string) => {
  await db.delete(transactions).where(eq(transactions.id, id));
  console.log("[DEBUG] deleteTransaction id:", id);
  revalidatePath("/");
};

export const updateTransactionStatus = async (
  id: string,
  status: Transaction["status"]
) => {
  await db
    .update(transactions)
    .set({ status })
    .where(eq(transactions.id, id));
  console.log("[DEBUG] updateTransactionStatus:", { id, status });
  revalidatePath("/");
};

export const updateTransactionMessage = async (
  id: string,
  message: string
) => {
  await db
    .update(transactions)
    .set({ message })
    .where(eq(transactions.id, id));
  console.log("[DEBUG] updateTransactionMessage:", { id, message });
  revalidatePath("/");
};

export const editTransaction = async (
  id: string,
  updates: Partial<Omit<Transaction, "id" | "createdAt" | "updatedAt">>
) => {
  await db
    .update(transactions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(transactions.id, id));
  console.log("[DEBUG] editTransaction:", { id, updates });
  revalidatePath("/");
};
