import { db } from "@/lib/db";
import RecipeList from "@/components/RecipeList";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
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

  const data = recipes.rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    ingredients: ingredientsByRecipe[r.id as number] ?? [],
  }));

  const pantryNames = pantry.rows.map((r) => r.name as string);

  return (
    <div>
      <PageHeader title="Recipes" />
      <RecipeList initial={data} pantryNames={pantryNames} />
    </div>
  );
}
