"use client";

import { useState } from "react";

type Request = {
  id: number;
  text: string;
  added_by: string | null;
  created_at: string;
};

export default function RequestList({ initial }: { initial: Request[] }) {
  const [requests, setRequests] = useState<Request[]>(initial);
  const [text, setText] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function addRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.trim(),
        added_by: addedBy.trim() || null,
      }),
    });
    const created: Request = await res.json();
    setRequests((prev) => [created, ...prev]);
    setText("");
    setSubmitting(false);
  }

  async function deleteRequest(id: number) {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
  }

  async function clearAll() {
    if (!confirm("Delete all requests?")) return;
    setRequests([]);
    await fetch("/api/requests", { method: "DELETE" });
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Add form */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-4">
        <form onSubmit={addRequest} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="What do you need?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50 shrink-0"
            >
              Add
            </button>
          </div>
          <input
            type="text"
            placeholder="Your name (optional)"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            className="w-full bg-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>

      {/* List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm px-4 py-8 text-center">
          <p className="text-3xl mb-2">🛒</p>
          <p className="text-sm text-gray-400">No requests yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {requests.map((r, idx) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-4 py-3.5 ${
                  idx < requests.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {r.text}
                  </p>
                  {r.added_by && (
                    <p className="text-xs text-gray-400 mt-0.5">{r.added_by}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteRequest(r.id)}
                  className="ml-4 w-7 h-7 rounded-full bg-red-100 text-red-500 text-sm flex items-center justify-center shrink-0 active:opacity-70"
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={clearAll}
            className="w-full text-red-500 text-sm font-medium py-2"
          >
            Clear all after shop
          </button>
        </>
      )}
    </div>
  );
}
