import { pgTable, uuid, numeric, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const providerCountryPaymentMethods = pgTable(
  "provider_country_payment_methods",
  {
    id: uuid("id").primaryKey(),
    providerCountryId: uuid("provider_country_id").notNull(),
    paymentMethodId: uuid("payment_method_id").notNull(),
    minLimit: numeric("min_limit", { precision: 20, scale: 2 }),
    maxLimit: numeric("max_limit", { precision: 20, scale: 2 }),
    config: jsonb("config"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("provider_country_payment_methods_unique")
      .on(table.providerCountryId, table.paymentMethodId),
  ]
);
