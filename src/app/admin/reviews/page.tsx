import { hasDb } from '@/lib/db';
import { listReviews, reviewCountsByStatus } from '@/lib/repo';
import { ReviewQueue, type ReviewRow } from '@/components/admin/ReviewQueue';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage({ searchParams }: { searchParams: { status?: string } }) {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Reviews unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to collect and moderate reviews.</p>
      </div>
    );
  }

  const status = searchParams.status ?? 'pending';
  const [docs, tally] = await Promise.all([listReviews(status), reviewCountsByStatus()]);

  const rows: ReviewRow[] = docs.map((doc) => JSON.parse(JSON.stringify(doc)));

  return <ReviewQueue rows={rows} status={status} counts={tally} />;
}
