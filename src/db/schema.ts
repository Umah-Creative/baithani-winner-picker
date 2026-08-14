import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
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
  accentColor: text("accent_color").notNull().default("#d076b4"),
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

export const adminAuditLogs = pgTable(
  "admin_audit_logs",
  {
    id: serial("id").primaryKey().notNull(),
    action: text("action").notNull(),
    outcome: text("outcome").notNull(),
    actor: text("actor").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    acceptLanguage: text("accept_language"),
    requestId: text("request_id"),
    metadata: jsonb("metadata").notNull().default({}),
  },
  (table) => [
    index("admin_audit_logs_occurred_at_idx").on(table.occurredAt),
    index("admin_audit_logs_action_occurred_at_idx").on(
      table.action,
      table.occurredAt
    ),
    index("admin_audit_logs_request_id_idx").on(table.requestId),
  ]
);
