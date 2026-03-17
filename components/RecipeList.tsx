"use client";

import { useState } from "react";

type Ingredient = { name: string; in_stock: boolean };
type Recipe = { id: number; name: string; ingredients: Ingredient[] };

export default function RecipeList({
  initial,
  pantryNames,
}: {
  initial: Recipe[];
  pantryNames: string[];
}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initial);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newIngredients, setNewIngredients] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  function toggleRecipe(id: number) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  // Comma-aware: autocomplete the token after the last comma
  function onIngredientChange(val: string) {
    setNewIngredients(val);
    const tokens = val.split(",");
    const current = tokens[tokens.length - 1].trim();
    if (current.length > 0) {
      const alreadyAdded = tokens
        .slice(0, -1)
        .map((t) => t.trim().toLowerCase());
      setSuggestions(
        pantryNames.filter(
          (n) =>
            n.toLowerCase().includes(current.toLowerCase()) &&
            !alreadyAdded.includes(n.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }

  function selectSuggestion(name: string) {
    const tokens = newIngredients.split(",");
    tokens[tokens.length - 1] = " " + name;
    setNewIngredients(tokens.join(",") + ", ");
    setSuggestions([]);
  }

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newIngredients.trim()) return;
    setAdding(true);
    const ingredients = newIngredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), ingredients }),
    });
    const created: Recipe = await res.json();
    setRecipes((prev) => [...prev, created]);
    setNewName("");
    setNewIngredients("");
    setSuggestions([]);
    setAdding(false);
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {recipes.map((recipe) => {
        const inStock = recipe.ingredients.filter((i) => i.in_stock).length;
        const total = recipe.ingredients.length;
        const isOpen = expanded === recipe.id;
        const allIn = inStock === total;

        return (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => toggleRecipe(recipe.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
            >
              <span className="text-2xl leading-none">📖</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{recipe.name}</p>
                <p
                  className={`text-xs ${
                    allIn
                      ? "text-green-600"
                      : inStock === 0
                      ? "text-red-500"
                      : "text-orange-500"
                  }`}
                >
                  {inStock}/{total} in stock
                </p>
              </div>
              <svg
                className={`w-4 h-4 text-gray-300 transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="flex flex-wrap gap-2 px-4 pb-4">
                {recipe.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ing.in_stock
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ing.in_stock ? "✓" : "✗"} {ing.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add recipe */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add recipe</p>
        <form onSubmit={addRecipe} className="space-y-2">
          <input
            type="text"
            placeholder="Recipe name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Ingredients (comma-separated)"
              value={newIngredients}
              onChange={(e) => onIngredientChange(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
              className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden max-h-40 overflow-y-auto">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => selectSuggestion(s)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add Recipe"}
          </button>
        </form>
      </div>
    </div>
  );
}
