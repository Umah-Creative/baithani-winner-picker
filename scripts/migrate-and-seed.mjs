import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

await migrate(db, { migrationsFolder: "drizzle/migrations" });

await db.execute(
  `INSERT INTO event_settings (id, title, description, accent_color, min_range, max_range, excluded_numbers)
   VALUES (1, 'Doorprize HUT 50th Baithani 2025', 'Baithani''s Doorprize Picker', '#f0b429', 1, 1000, '{}')
   ON CONFLICT (id) DO NOTHING`,
);

await pool.end();
