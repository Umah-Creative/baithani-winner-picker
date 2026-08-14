import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { pool } from "./pool.mjs";

const seedersDir = dirname(fileURLToPath(import.meta.url));
const seederFiles = (await readdir(seedersDir))
  .filter(
    (file) => file.endsWith(".mjs") && file !== "run.mjs" && file !== "pool.mjs"
  )
  .sort();

for (const file of seederFiles) {
  const seeder = await import(join(seedersDir, file));
  await seeder.run(pool);
}

await pool.end();
