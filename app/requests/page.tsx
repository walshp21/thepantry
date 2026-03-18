import { db } from "@/lib/db";
import RequestList from "@/components/RequestList";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader title="Requests" />
      <RequestList initial={requests} />
    </div>
  );
}
