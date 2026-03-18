import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM pantry_items WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { in_stock } = await req.json();
  const result = await db.execute({
    sql: "UPDATE pantry_items SET in_stock = ? WHERE id = ? RETURNING *",
    args: [in_stock ? 1 : 0, id],
  });
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(result.rows[0]);
}
