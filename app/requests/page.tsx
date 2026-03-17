import { db } from "@/lib/db";
import RequestList from "@/components/RequestList";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const result = await db.execute(
    "SELECT * FROM requests ORDER BY created_at DESC"
  );

  const requests = result.rows.map((r) => ({
    id: r.id as number,
    text: r.text as string,
    added_by: r.added_by as string | null,
    created_at: r.created_at as string,
  }));

  return (
    <div>
      <header className="px-4 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-bold">Requests</h1>
      </header>
      <RequestList initial={requests} />
    </div>
  );
}
