import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  isoCode: varchar("iso_code", { length: 2 }).notNull().unique(),
});

