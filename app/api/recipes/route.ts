import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const [recipes, ingredients, pantry] = await Promise.all([
    db.execute("SELECT * FROM recipes ORDER BY name"),
    db.execute("SELECT * FROM recipe_ingredients"),
    db.execute("SELECT name, in_stock FROM pantry_items"),
  ]);

  const pantryMap: Record<string, number> = {};
  for (const row of pantry.rows) {
    pantryMap[(row.name as string).toLowerCase()] = row.in_stock as number;
  }

  const ingredientsByRecipe: Record<
    number,
    { name: string; in_stock: boolean }[]
  > = {};
  for (const row of ingredients.rows) {
    const rid = row.recipe_id as number;
    if (!ingredientsByRecipe[rid]) ingredientsByRecipe[rid] = [];
    const name = row.ingredient_name as string;
    ingredientsByRecipe[rid].push({
      name,
      in_stock: pantryMap[name.toLowerCase()] === 1,
    });
  }

  const result = recipes.rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    ingredients: ingredientsByRecipe[r.id as number] ?? [],
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const { name, ingredients } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json(
      { error: "At least one ingredient is required" },
      { status: 400 }
    );
  }

  const result = await db.execute({
    sql: "INSERT INTO recipes (name) VALUES (?) RETURNING *",
    args: [name.trim()],
  });
  const recipeId = result.rows[0].id as number;

  // Batch insert all ingredients in a single round trip
  await db.batch(
    ingredients.map((ingredient: string) => ({
      sql: "INSERT INTO recipe_ingredients (recipe_id, ingredient_name) VALUES (?, ?)",
      args: [recipeId, ingredient.trim()],
    }))
  );

  // Fetch pantry to compute in_stock for response
  const pantry = await db.execute("SELECT name, in_stock FROM pantry_items");
  const pantryMap: Record<string, number> = {};
  for (const row of pantry.rows) {
    pantryMap[(row.name as string).toLowerCase()] = row.in_stock as number;
  }

  return NextResponse.json(
    {
      id: recipeId,
      name: name.trim(),
      ingredients: ingredients.map((i: string) => ({
        name: i.trim(),
        in_stock: pantryMap[i.trim().toLowerCase()] === 1,
      })),
    },
    { status: 201 }
  );
}
