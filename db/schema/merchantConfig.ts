import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { merchants } from "./merchants";

export const merchantConfig = pgTable("merchant_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: varchar("merchant_id", { length: 50 })
    .notNull()
    .references(() => merchants.id).unique(),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  callbackUrl: varchar("callback_url", { length: 500 }),
  successUrl: varchar("success_url", { length: 500 }),
  failUrl: varchar("fail_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

