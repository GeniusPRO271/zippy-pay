import { pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { providers } from "./providers";
import { countries } from "./countries";

export const providerCountries = pgTable("provider_countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id").notNull().references(() => providers.id),
  countryId: uuid("country_id").notNull().references(() => countries.id),
  config: jsonb("config"), // e.g., currency, limits
});

