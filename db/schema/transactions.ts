import { pgTable, varchar, text, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  merchantId: varchar("merchant_id", { length: 50 }).notNull(),
  transactionId: varchar("transaction_id", { length: 100 }).notNull().unique(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(), // ISO 4217
  country: varchar("country", { length: 2 }).notNull(), // ISO 3166-1 alpha-2
  payMethod: varchar("pay_method", { length: 20 }).notNull(),
  documentId: varchar("document_id", { length: 50 }),
  email: varchar("email", { length: 255 }).notNull(),
  name: text("name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, validated, error
  message: text("message"),
  zippyId: varchar("zippy_id", { length: 100 }),
  sign: varchar("sign", { length: 64 }), // MD5 hash length = 32, doubled for safety
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

