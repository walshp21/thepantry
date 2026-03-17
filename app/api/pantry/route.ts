import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const result = await db.execute(
    "SELECT * FROM pantry_items ORDER BY category, name"
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: NextRequest) {
  const { name, category } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const result = await db.execute({
    sql: "INSERT INTO pantry_items (name, category, in_stock) VALUES (?, ?, 1) RETURNING *",
    args: [name.trim(), category?.trim() || null],
  });
  return NextResponse.json(result.rows[0], { status: 201 });
}
