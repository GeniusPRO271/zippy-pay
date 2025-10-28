import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { countries } from "./countries";

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

