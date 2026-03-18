"use client";

import { useEffect, useState } from "react";
import Card from "./ui/Card";
import Input from "./ui/Input";
import Button from "./ui/Button";
import { useToast } from "./Toast";
import { useRequestCount } from "./RequestCountContext";

type Request = {
  id: number;
  text: string;
  added_by: string | null;
  created_at: string;
};

export default function RequestList({ initial }: { initial: Request[] }) {
  const { toast } = useToast();
  const { setCount } = useRequestCount();
  const [requests, setRequests] = useState<Request[]>(initial);

  useEffect(() => {
    setCount(requests.length);
  }, [requests.length, setCount]);
  const [text, setText] = useState("");
  const [addedBy, setAddedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  async function addRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          added_by: addedBy.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created: Request = await res.json();
      setRequests((prev) => [created, ...prev]);
      setText("");
    } catch {
      toast("Failed to add request");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRequest(id: number) {
    const snapshot = requests.find((r) => r.id === id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      if (snapshot) setRequests((prev) => [snapshot, ...prev]);
      toast("Failed to delete request");
    }
  }

  async function clearAll() {
    const snapshot = requests;
    setRequests([]);
    setConfirmClear(false);
    try {
      const res = await fetch("/api/requests", { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      setRequests(snapshot);
      toast("Failed to clear requests");
    }
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {/* Add form */}
      <Card className="px-4 py-4">
        <form onSubmit={addRequest} className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="What do you need?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={submitting}
              className="px-4 shrink-0"
            >
              Add
            </Button>
          </div>
          <Input
            type="text"
            placeholder="Your name (optional)"
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value)}
            className="w-full"
          />
        </form>
      </Card>

      {/* List */}
      {requests.length === 0 ? (
        <Card className="px-4 py-8 text-center">
          <p className="text-3xl mb-2">🛒</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No requests yet.
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            {requests.map((r, idx) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3.5"
                style={{
                  borderBottom:
                    idx < requests.length - 1
                      ? "1px solid var(--border)"
                      : undefined,
                }}
              >
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {r.text}
                  </p>
                  {r.added_by && (
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {r.added_by}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteRequest(r.id)}
                  className="ml-4 w-7 h-7 rounded-full text-sm flex items-center justify-center shrink-0 active:opacity-70"
                  style={{
                    backgroundColor: "var(--red-light)",
                    color: "var(--red)",
                  }}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </Card>

          {confirmClear ? (
            <div className="flex items-center justify-center gap-3 py-1">
              <span
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                Clear everything?
              </span>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white active:opacity-70"
                style={{ backgroundColor: "var(--red)" }}
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
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
              onClick={() => setConfirmClear(true)}
              className="w-full text-sm font-medium py-2"
              style={{ color: "var(--red)" }}
            >
              Clear all after shop
            </button>
          )}
        </>
      )}
    </div>
  );
}
