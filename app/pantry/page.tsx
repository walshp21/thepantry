import { db } from "@/lib/db";
import PantryList from "@/components/PantryList";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader title="Pantry" />
      <PantryList initial={items} />
    </div>
  );
}
