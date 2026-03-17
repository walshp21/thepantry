"use client";

import { useState } from "react";

type PantryItem = {
  id: number;
  name: string;
  category: string | null;
  in_stock: number;
};

type GroupedItems = Record<string, PantryItem[]>;

const CATEGORY_EMOJI: Record<string, string> = {
  dairy: "🥛",
  bakery: "🍞",
  meat: "🥩",
  staples: "🌾",
  produce: "🥦",
  drinks: "☕",
};

function getCategoryEmoji(cat: string): string {
  return CATEGORY_EMOJI[cat.toLowerCase()] ?? "📦";
}

function groupByCategory(items: PantryItem[]): GroupedItems {
  return items.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as GroupedItems);
}

export default function PantryList({ initial }: { initial: PantryItem[] }) {
  const [items, setItems] = useState<PantryItem[]>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [catSuggestions, setCatSuggestions] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const grouped = groupByCategory(items);
  const categories = Object.keys(grouped).sort();

  function onCatChange(val: string) {
    setNewCategory(val);
    const matches = categories.filter(
      (c) =>
        c.toLowerCase().includes(val.toLowerCase()) &&
        c.toLowerCase() !== val.toLowerCase()
    );
    setCatSuggestions(val.trim() ? matches : categories);
  }

  function onCatFocus() {
    setCatSuggestions(
      newCategory.trim()
        ? categories.filter((c) =>
            c.toLowerCase().includes(newCategory.toLowerCase())
          )
        : categories
    );
  }

  function onCatBlur() {
    setTimeout(() => setCatSuggestions([]), 150);
  }

  async function toggle(item: PantryItem) {
    const next = item.in_stock === 1 ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, in_stock: next } : i))
    );
    await fetch(`/api/pantry/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ in_stock: next === 1 }),
    });
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        category: newCategory.trim() || null,
      }),
    });
    const created: PantryItem = await res.json();
    setItems((prev) => [...prev, created]);
    setNewName("");
    setNewCategory("");
    setAdding(false);
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {categories.map((cat) => {
        const catItems = grouped[cat];
        const inStockCount = catItems.filter((i) => i.in_stock === 1).length;
        const isOpen = expanded === cat;

        return (
          <div
            key={cat}
            className="bg-white rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setExpanded(isOpen ? null : cat)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50"
            >
              <span className="text-2xl leading-none">
                {getCategoryEmoji(cat)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{cat}</p>
                <p
                  className={`text-xs ${
                    inStockCount === catItems.length
                      ? "text-green-600"
                      : inStockCount === 0
                      ? "text-red-500"
                      : "text-orange-500"
                  }`}
                >
                  {inStockCount}/{catItems.length} in stock
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
              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                {catItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggle(item)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-left active:opacity-70 ${
                      item.in_stock === 1
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span className="truncate">{item.name}</span>
                    <span
                      className={`w-2 h-2 rounded-full ml-2 shrink-0 ${
                        item.in_stock === 1 ? "bg-green-500" : "bg-red-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Add item */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Add item</p>
        <form onSubmit={addItem} className="space-y-2">
          <input
            type="text"
            placeholder="Item name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="relative">
            <input
              type="text"
              placeholder="Category"
              value={newCategory}
              onChange={(e) => onCatChange(e.target.value)}
              onFocus={onCatFocus}
              onBlur={onCatBlur}
              className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {catSuggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 overflow-hidden">
                {catSuggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onMouseDown={() => {
                        setNewCategory(s);
                        setCatSuggestions([]);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>{getCategoryEmoji(s)}</span>
                      <span>{s}</span>
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
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
      </div>
    </div>
  );
}
