import {
  pgTable,
  uuid,
  varchar,
  numeric,
  jsonb,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

//
// COUNTRIES
//
export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  isoCode: varchar("iso_code", { length: 2 }).notNull().unique(),
  currencyCode: varchar("currency_code", { length: 3 }),
});

export const countriesRelations = relations(countries, ({ many }) => ({
  merchants: many(merchants),
  providerCountries: many(providerCountries),
}));

//
// PROVIDERS
//
export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const providersRelations = relations(providers, ({ many }) => ({
  providerCountries: many(providerCountries),
}));

//
// PROVIDER COUNTRIES
//
export const providerCountries = pgTable("provider_countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providers.id),
  countryId: uuid("country_id").notNull().references(() => countries.id),
  config: jsonb("config"),
});

export const providerCountriesRelations = relations(providerCountries, ({ one, many }) => ({
  provider: one(providers, {
    fields: [providerCountries.providerId],
    references: [providers.id],
  }),
  country: one(countries, {
    fields: [providerCountries.countryId],
    references: [countries.id],
  }),
  paymentMethods: many(providerCountryPaymentMethods),
}));

//
// PAYMENT METHODS
//
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  capabilities: jsonb("capabilities"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  providerCountryPaymentMethods: many(providerCountryPaymentMethods),
}));

//
// PROVIDER COUNTRY PAYMENT METHODS
//
export const providerCountryPaymentMethods = pgTable(
  "provider_country_payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerCountryId: uuid("provider_country_id")
      .notNull()
      .references(() => providerCountries.id),
    paymentMethodId: uuid("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id),
    minLimit: numeric("min_limit", { precision: 20, scale: 2 }),
    maxLimit: numeric("max_limit", { precision: 20, scale: 2 }),
    config: jsonb("config"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("provider_country_payment_methods_unique").on(
      table.providerCountryId,
      table.paymentMethodId
    ),
  ]
);

export const providerCountryPaymentMethodsRelations = relations(
  providerCountryPaymentMethods,
  ({ one, many }) => ({
    providerCountry: one(providerCountries, {
      fields: [providerCountryPaymentMethods.providerCountryId],
      references: [providerCountries.id],
    }),
    paymentMethod: one(paymentMethods, {
      fields: [providerCountryPaymentMethods.paymentMethodId],
      references: [paymentMethods.id],
    }),
    merchantProviderMethods: many(merchantProviderMethods),
  })
);

//
// MERCHANTS
//
export const merchants = pgTable("merchants", {
  id: varchar("id", { length: 50 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  registeredCountryId: uuid("registered_country_id")
    .notNull()
    .references(() => countries.id),
  businessType: varchar("business_type", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  registeredCountry: one(countries, {
    fields: [merchants.registeredCountryId],
    references: [countries.id],
  }),
  merchantConfig: one(merchantConfig),
  merchantProviderMethods: many(merchantProviderMethods),
}));

//
// MERCHANT CONFIG
//
export const merchantConfig = pgTable("merchant_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: varchar("merchant_id", { length: 50 })
    .notNull()
    .references(() => merchants.id)
    .unique(),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  callbackUrl: varchar("callback_url", { length: 500 }),
  successUrl: varchar("success_url", { length: 500 }),
  failUrl: varchar("fail_url", { length: 500 }),
  websiteUrl: varchar("website_url", { length: 500 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const merchantConfigRelations = relations(merchantConfig, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantConfig.merchantId],
    references: [merchants.id],
  }),
}));

//
// MERCHANT PROVIDER METHODS
//
export const merchantProviderMethods = pgTable("merchant_provider_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: varchar("merchant_id", { length: 50 })
    .notNull()
    .references(() => merchants.id),
  providerCountryPaymentMethodId: uuid("provider_country_payment_method_id")
    .notNull()
    .references(() => providerCountryPaymentMethods.id),
  status: varchar("status", { length: 20 }).default("enabled"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const merchantProviderMethodsRelations = relations(
  merchantProviderMethods,
  ({ one }) => ({
    merchant: one(merchants, {
      fields: [merchantProviderMethods.merchantId],
      references: [merchants.id],
    }),
    providerCountryPaymentMethod: one(providerCountryPaymentMethods, {
      fields: [merchantProviderMethods.providerCountryPaymentMethodId],
      references: [providerCountryPaymentMethods.id],
    }),
  })
);
