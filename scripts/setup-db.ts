import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function main() {
  console.log("Creating tables...");

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS pantry_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      in_stock INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      added_by TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
      ingredient_name TEXT NOT NULL
    );
  `);

  console.log("Tables created. Seeding pantry items...");

  const items = [
    { name: "Milk", category: "Dairy" },
    { name: "Eggs", category: "Dairy" },
    { name: "Butter", category: "Dairy" },
    { name: "Cheese", category: "Dairy" },
    { name: "Yoghurt", category: "Dairy" },
    { name: "Bread", category: "Bakery" },
    { name: "Chicken", category: "Meat" },
    { name: "Rice", category: "Staples" },
    { name: "Pasta", category: "Staples" },
    { name: "Flour", category: "Staples" },
    { name: "Sugar", category: "Staples" },
    { name: "Olive Oil", category: "Staples" },
    { name: "Onions", category: "Produce" },
    { name: "Garlic", category: "Produce" },
    { name: "Tomatoes", category: "Produce" },
    { name: "Potatoes", category: "Produce" },
    { name: "Bananas", category: "Produce" },
    { name: "Apples", category: "Produce" },
    { name: "Coffee", category: "Drinks" },
    { name: "Tea", category: "Drinks" },
  ];

  // Only seed if table is empty
  const existing = await db.execute("SELECT COUNT(*) as count FROM pantry_items");
  const count = existing.rows[0].count as number;

  if (count === 0) {
    for (const item of items) {
      await db.execute({
        sql: "INSERT INTO pantry_items (name, category, in_stock) VALUES (?, ?, 1)",
        args: [item.name, item.category],
      });
    }
    console.log(`Seeded ${items.length} pantry items.`);
  } else {
    console.log(`Pantry already has ${count} items, skipping seed.`);
  }

  console.log("Done.");
}

main().catch(console.error);
