import {
  customType,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const eventSettings = pgTable("event_settings", {
  id: integer("id").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  accentColor: text("accent_color").notNull().default("#f0b429"),
  logoBytes: bytea("logo_bytes"),
  logoMime: text("logo_mime"),
  logoAlt: text("logo_alt"),
  minRange: integer("min_range").notNull().default(1),
  maxRange: integer("max_range").notNull().default(1000),
  excludedNumbers: integer("excluded_numbers").array().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
