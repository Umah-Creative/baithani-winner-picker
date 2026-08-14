export async function run(pool) {
  const { rows } = await pool.query(
    "SELECT id FROM event_settings WHERE id = 1 LIMIT 1"
  );

  if (rows.length > 0) {
    console.log("Event settings row already exists; skipping seed.");
    return;
  }

  await pool.query(
    `INSERT INTO event_settings
       (id, title, description, accent_color, min_range, max_range, excluded_numbers)
     VALUES ($1, $2, $3, $4, $5, $6, $7::integer[])
     ON CONFLICT (id) DO NOTHING`,
    [
      1,
      "Doorprize HUT 50th Baithani 2025",
      "Baithani's Doorprize Picker",
      "#d076b4",
      1,
      1000,
      [],
    ]
  );

  console.log("Seeded default event settings row.");
}
