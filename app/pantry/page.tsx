import { db } from "@/lib/db";
import PantryList from "@/components/PantryList";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const result = await db.execute(
    "SELECT * FROM pantry_items ORDER BY category, name"
  );

  const items = result.rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    category: r.category as string | null,
    in_stock: r.in_stock as number,
  }));

  return (
    <div>
      <header className="px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold">Pantry</h1>
      </header>
      <PantryList initial={items} />
    </div>
  );
}
