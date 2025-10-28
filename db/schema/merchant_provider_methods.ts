import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { merchants } from "./merchants";
import { countries } from "./countries";
import { providers } from "./providers";
import { paymentMethods } from "./payment_methods";

export const merchantProviderMethods = pgTable("merchant_provider_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: varchar("merchant_id", { length: 50 })
    .notNull()
    .references(() => merchants.id),
  countryId: uuid("country_id").notNull().references(() => countries.id),
  providerId: uuid("provider_id").notNull().references(() => providers.id),
  paymentMethodId: uuid("payment_method_id").notNull().references(() => paymentMethods.id),
  status: varchar("status", { length: 20 }).default("enabled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
