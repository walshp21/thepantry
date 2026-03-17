import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const recipes = [
  { name: "Pasta Aglio e Olio", ingredients: ["Pasta", "Garlic", "Olive Oil"] },
  { name: "Omelette", ingredients: ["Eggs", "Butter", "Cheese"] },
  { name: "Chicken Stir Fry", ingredients: ["Chicken", "Rice", "Onions", "Garlic", "Olive Oil"] },
  { name: "Banana Pancakes", ingredients: ["Bananas", "Eggs", "Flour", "Milk", "Butter"] },
];

async function main() {
  const existing = await db.execute("SELECT COUNT(*) as count FROM recipes");
  const count = existing.rows[0].count as number;

  if (count > 0) {
    console.log(`Recipes already seeded (${count} found), skipping.`);
    return;
  }

  for (const recipe of recipes) {
    const result = await db.execute({
      sql: "INSERT INTO recipes (name) VALUES (?) RETURNING id",
      args: [recipe.name],
    });
    const recipeId = result.rows[0].id as number;

    for (const ingredient of recipe.ingredients) {
      await db.execute({
        sql: "INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES (?, ?)",
        args: [recipeId, ingredient],
      });
    }
    console.log(`Seeded: ${recipe.name}`);
  }

  console.log("Done.");
}

main().catch(console.error);
