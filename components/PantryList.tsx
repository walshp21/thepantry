"use client";

import { useRef, useState } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import ChevronIcon from "./ui/ChevronIcon";
import AutocompleteInput from "./ui/AutocompleteInput";
import { useToast } from "./Toast";

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
  const { toast } = useToast();
  const [items, setItems] = useState<PantryItem[]>(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [catSuggestions, setCatSuggestions] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function startHold(itemId: number) {
    holdTimer.current = setTimeout(() => setDeletingId(itemId), 500);
  }

  function cancelHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  }

  async function markCategoryOut(cat: string) {
    const catItems = grouped[cat].filter((i) => i.in_stock === 1);
    if (catItems.length === 0) return;
    setItems((prev) =>
      prev.map((i) =>
        i.category === cat || (!i.category && cat === "Other")
          ? { ...i, in_stock: 0 }
          : i
      )
    );
    try {
      await Promise.all(
        catItems.map((item) =>
          fetch(`/api/pantry/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ in_stock: false }),
          })
        )
      );
    } catch {
      // Rollback: restore original in_stock values
      setItems((prev) =>
        prev.map((i) => {
          const original = catItems.find((c) => c.id === i.id);
          return original ? { ...i, in_stock: original.in_stock } : i;
        })
      );
      toast("Failed to update category");
    }
  }

  async function toggle(item: PantryItem) {
    if (deletingId === item.id) {
      setDeletingId(null);
      return;
    }
    const next = item.in_stock === 1 ? 0 : 1;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, in_stock: next } : i))
    );
    try {
      const res = await fetch(`/api/pantry/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ in_stock: next === 1 }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, in_stock: item.in_stock } : i
        )
      );
      toast("Failed to update item");
    }
  }

  async function deleteItem(item: PantryItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setDeletingId(null);
    try {
      const res = await fetch(`/api/pantry/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setItems((prev) => [...prev, item]);
      toast("Failed to delete item");
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          category: newCategory.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created: PantryItem = await res.json();
      setItems((prev) => [...prev, created]);
      setNewName("");
      setNewCategory("");
      toast("Item added", "success");
    } catch {
      toast("Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {categories.length === 0 && (
        <Card className="px-4 py-8 text-center">
          <p className="text-3xl mb-2">🥫</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No items yet. Add one below.
          </p>
        </Card>
      )}

      {deletingId !== null && (
        <p
          className="text-xs text-center py-1"
          style={{ color: "var(--text-muted)" }}
        >
          Tap the item again to delete it
        </p>
      )}

      {categories.map((cat) => {
        const catItems = grouped[cat];
        const inStockCount = catItems.filter((i) => i.in_stock === 1).length;
        const isOpen = expanded === cat;

        return (
          <Card key={cat} className="overflow-hidden">
            <div className="flex items-center">
            <button
              onClick={() => setExpanded(isOpen ? null : cat)}
              className="flex-1 flex items-center gap-3 px-4 py-3.5 text-left active:opacity-80 min-w-0"
            >
              <span className="text-2xl leading-none">
                {getCategoryEmoji(cat)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "var(--text)" }}>
                  {cat}
                </p>
                <p
                  className="text-xs"
                  style={{
                    color:
                      inStockCount === catItems.length
                        ? "var(--green)"
                        : inStockCount === 0
                        ? "var(--red)"
                        : "var(--amber)",
                  }}
                >
                  {inStockCount}/{catItems.length} in stock
                </p>
              </div>
              <ChevronIcon open={isOpen} />
            </button>

            {isOpen && inStockCount > 0 && (
              <button
                onClick={() => markCategoryOut(cat)}
                className="pr-4 py-3.5 text-xs shrink-0 active:opacity-70"
                style={{ color: "var(--text-muted)" }}
                title="Mark all out of stock"
              >
                All out
              </button>
            )}
            </div>

            {isOpen && (
              <div
                className="grid grid-cols-2 gap-2 px-4 pb-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="col-span-2 h-3" />
                {catItems.map((item) => {
                  const isPendingDelete = deletingId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggle(item)}
                      onPointerDown={() => startHold(item.id)}
                      onPointerUp={cancelHold}
                      onPointerLeave={cancelHold}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-left active:opacity-70 transition-colors"
                      style={{
                        backgroundColor: isPendingDelete
                          ? "var(--red-light)"
                          : item.in_stock === 1
                          ? "var(--green-light)"
                          : "var(--red-light)",
                        color: isPendingDelete
                          ? "var(--red)"
                          : item.in_stock === 1
                          ? "var(--green)"
                          : "var(--red)",
                        outline: isPendingDelete
                          ? "2px solid var(--red)"
                          : undefined,
                      }}
                    >
                      <span className="truncate">
                        {isPendingDelete ? "Delete?" : item.name}
                      </span>
                      {isPendingDelete ? (
                        <span
                          className="text-xs ml-2 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item);
                          }}
                        >
                          ✕
                        </span>
                      ) : (
                        <span
                          className="w-2 h-2 rounded-full ml-2 shrink-0"
                          style={{
                            backgroundColor:
                              item.in_stock === 1
                                ? "var(--green)"
                                : "var(--red)",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {/* Add item */}
      <Card className="px-4 py-4">
        <p
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-muted)" }}
        >
          Add item
        </p>
        <form onSubmit={addItem} className="space-y-2">
          <Input
            type="text"
            placeholder="Item name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full"
            required
          />
          <AutocompleteInput
            value={newCategory}
            onChange={onCatChange}
            onFocus={onCatFocus}
            onBlur={onCatBlur}
            suggestions={catSuggestions}
            onSelect={(s) => {
              setNewCategory(s);
              setCatSuggestions([]);
            }}
            renderSuggestion={(s) => (
              <>
                <span>{getCategoryEmoji(s)}</span>
                <span>{s}</span>
              </>
            )}
            getKey={(s) => s}
            placeholder="Category (optional)"
          />
          <Button type="submit" disabled={adding} className="w-full">
            {adding ? "Adding…" : "Add"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
