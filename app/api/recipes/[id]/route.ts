import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // CASCADE in the schema handles recipe_ingredients cleanup
  await db.execute({ sql: "DELETE FROM recipes WHERE id = ?", args: [id] });
  return NextResponse.json({ ok: true });
}
