import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.execute(
    "SELECT * FROM requests ORDER BY created_at DESC"
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { text, added_by } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }
  const result = await db.execute({
    sql: "INSERT INTO requests (text, added_by) VALUES (?, ?) RETURNING *",
    args: [text.trim(), added_by?.trim() || null],
  });
  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE() {
  await db.execute("DELETE FROM requests");
  return NextResponse.json({ ok: true });
}
