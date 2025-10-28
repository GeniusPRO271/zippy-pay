import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { providers } from "./providers";

export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providers.id),
  name: varchar("name", { length: 100 }).notNull(),   // e.g., WebPay, PIX
  code: varchar("code", { length: 50 }).notNull(),    // internal code
  capabilities: jsonb("capabilities"),               // e.g., refund, capture
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

