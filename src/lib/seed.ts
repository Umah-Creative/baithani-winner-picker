import { config } from "dotenv";

// Load env before importing anything that reads process.env at module scope.
config({ path: ".env" });
config({ path: ".env.local", override: true });

async function main() {
  const { db } = await import("./db");
  const { eventSettings } = await import("./schema");
  const { eq } = await import("drizzle-orm");

  const [existing] = await db
    .select({ id: eventSettings.id })
    .from(eventSettings)
    .where(eq(eventSettings.id, 1))
    .limit(1);

  if (!existing) {
    await db.insert(eventSettings).values({
      id: 1,
      title: "Doorprize HUT 50th Baithani 2025",
      description: "Baithani's Doorprize Picker",
      accentColor: "#f0b429",
      minRange: 1,
      maxRange: 1000,
      excludedNumbers: [],
    });
    console.log("Seeded default event settings row.");
  } else {
    console.log("Event settings row already exists; skipping seed.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
