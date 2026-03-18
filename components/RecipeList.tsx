"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import ChevronIcon from "./ui/ChevronIcon";
import AutocompleteInput from "./ui/AutocompleteInput";
import { useToast } from "./Toast";
import { useRequestCount } from "./RequestCountContext";

type Ingredient = { name: string; in_stock: boolean };
type Recipe = { id: number; name: string; ingredients: Ingredient[] };

export default function RecipeList({
  initial,
  pantryNames,
}: {
  initial: Recipe[];
  pantryNames: string[];
}) {
  const { toast } = useToast();
  const { count: requestCount, setCount } = useRequestCount();
  const [recipes, setRecipes] = useState<Recipe[]>(initial);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newIngredients, setNewIngredients] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  function toggleRecipe(id: number) {
    if (confirmDelete !== null) {
      setConfirmDelete(null);
      return;
    }
    setExpanded((prev) => (prev === id ? null : id));
  }

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

  async function deleteRecipe(id: number) {
    const snapshot = recipes.find((r) => r.id === id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete(null);
    if (expanded === id) setExpanded(null);
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      if (snapshot) setRecipes((prev) => [...prev, snapshot]);
      toast("Failed to delete recipe");
    }
  }

  async function addMissingToCart(recipe: Recipe) {
    const missing = recipe.ingredients.filter((i) => !i.in_stock);
    if (missing.length === 0) return;
    setAddingToCart(recipe.id);
    try {
      await Promise.all(
        missing.map((ing) =>
          fetch("/api/requests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: ing.name, added_by: null }),
          })
        )
      );
      setCount(requestCount + missing.length);
      toast(
        `Added ${missing.length} item${missing.length === 1 ? "" : "s"} to requests`,
        "success"
      );
    } catch {
      toast("Failed to add items to requests");
    } finally {
      setAddingToCart(null);
    }
  }

  async function addRecipe(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newIngredients.trim()) return;
    setAdding(true);
    try {
      const ingredients = newIngredients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), ingredients }),
      });
      if (!res.ok) throw new Error();
      const created: Recipe = await res.json();
      setRecipes((prev) => [...prev, created]);
      setNewName("");
      setNewIngredients("");
      setSuggestions([]);
      toast("Recipe added", "success");
    } catch {
      toast("Failed to add recipe");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {recipes.length === 0 && (
        <Card className="px-4 py-8 text-center">
          <p className="text-3xl mb-2">📖</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No recipes yet. Add one below.
          </p>
        </Card>
      )}

      {recipes.map((recipe) => {
        const inStock = recipe.ingredients.filter((i) => i.in_stock).length;
        const total = recipe.ingredients.length;
        const isOpen = expanded === recipe.id;
        const allIn = inStock === total;
        const isPendingDelete = confirmDelete === recipe.id;

        return (
          <Card key={recipe.id} className="overflow-hidden">
            <div className="flex items-center">
              <button
                onClick={() => toggleRecipe(recipe.id)}
                className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left active:opacity-80 min-w-0"
              >
                <span className="text-2xl leading-none">📖</span>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {recipe.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{
                      color: allIn
                        ? "var(--green)"
                        : inStock === 0
                        ? "var(--red)"
                        : "var(--amber)",
                    }}
                  >
                    {inStock}/{total} in stock
                  </p>
                </div>
                <ChevronIcon open={isOpen} />
              </button>

              {/* Delete button */}
              {isPendingDelete ? (
                <div className="flex items-center gap-1 pr-3 shrink-0">
                  <button
                    onClick={() => deleteRecipe(recipe.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white active:opacity-70"
                    style={{ backgroundColor: "var(--red)" }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium active:opacity-70"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(recipe.id)}
                  className="pr-4 py-3.5 shrink-0 active:opacity-70"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Delete recipe"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.75}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>

            {isOpen && (
              <div
                className="px-4 pb-4 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {recipe.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: ing.in_stock
                          ? "var(--green-light)"
                          : "var(--red-light)",
                        color: ing.in_stock ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {ing.in_stock ? "✓" : "✗"} {ing.name}
                    </span>
                  ))}
                </div>
                {recipe.ingredients.some((i) => !i.in_stock) && (
                  <button
                    onClick={() => addMissingToCart(recipe)}
                    disabled={addingToCart === recipe.id}
                    className="w-full py-2 rounded-xl text-sm font-medium disabled:opacity-50 active:opacity-70"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {addingToCart === recipe.id
                      ? "Adding…"
                      : `🛒 Add missing to requests`}
                  </button>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {/* Add recipe */}
      <Card className="px-4 py-4">
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Add recipe
        </p>
        <form onSubmit={addRecipe} className="space-y-2">
          <Input
            type="text"
            placeholder="Recipe name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full"
            required
          />
          <AutocompleteInput
            value={newIngredients}
            onChange={onIngredientChange}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            suggestions={suggestions}
            onSelect={selectSuggestion}
            renderSuggestion={(s) => <span>{s}</span>}
            getKey={(s) => s}
            placeholder="Ingredients (comma-separated)"
            required
          />
          <Button type="submit" disabled={adding} className="w-full">
            {adding ? "Adding…" : "Add Recipe"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
