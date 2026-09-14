import Link from 'next/link';
import { Plus, FileText } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { currentUser, isMaster } from '@/lib/auth';
import { listQuotations, quoteStats } from '@/lib/repo-quotes';
import { formatINR, QUOTE_STATUS_LABEL, QUOTE_STATUSES, type QuoteStatus } from '@/lib/quote-calc';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/bits';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_TONE: Record<QuoteStatus, string> = {
  draft: 'bg-porcelain text-steel-600',
  generated: 'bg-decart-50 text-decart-700',
  sent: 'bg-decart-100 text-decart-700',
  viewed: 'bg-warning/10 text-warning',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-danger/10 text-danger',
  expired: 'bg-porcelain text-steel-600',
  cancelled: 'bg-porcelain text-steel-400',
};

type Search = { status?: string; q?: string };

export default async function AdminQuotationsPage({ searchParams }: { searchParams: Search }) {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Quotations unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">
          Set <code className="font-mono">TURSO_DATABASE_URL</code> to raise quotations.
        </p>
      </div>
    );
  }

  const user = await currentUser();
  if (!user) return null;

  // a sales user only ever sees their own; a master sees the whole business
  const scope = isMaster(user.role) ? undefined : user.id;
  const [rows, stats] = await Promise.all([
    listQuotations({ ownerId: scope, status: searchParams.status, search: searchParams.q }),
    quoteStats(scope),
  ]);

  const accepted = stats.byStatus.accepted?.value ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Quotations</h1>
          <p className="mt-1 text-sm text-steel-600">
            {isMaster(user.role)
              ? 'Every quotation raised across the team.'
              : 'The quotations you have raised.'}
          </p>
        </div>
        <ButtonLink href="/admin/quotations/new">
          <Plus className="h-4 w-4" />
          Create quotation
        </ButtonLink>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-line bg-paper p-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Quotations</dt>
          <dd className="mt-1 font-display text-2xl text-ink-950">{stats.count}</dd>
        </div>
        <div className="rounded-card border border-line bg-paper p-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Value quoted</dt>
          <dd className="mt-1 font-display text-2xl text-ink-950">{formatINR(stats.value)}</dd>
        </div>
        <div className="rounded-card border border-line bg-paper p-4">
          <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Accepted</dt>
          <dd className="mt-1 font-display text-2xl text-success">{formatINR(accepted)}</dd>
        </div>
      </dl>

      <form className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-paper p-3">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Quotation number, client or creator"
          aria-label="Search quotations"
          className="h-11 min-w-0 flex-1 rounded-btn border border-line px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={searchParams.status ?? ''}
          aria-label="Filter by status"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">All statuses</option>
          {QUOTE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {QUOTE_STATUS_LABEL[status]}
            </option>
          ))}
        </select>
        <button type="submit" className="h-11 rounded-btn bg-ink-900 px-4 text-sm font-semibold text-porcelain">
          Apply
        </button>
      </form>

      {rows.length ? (
        <div className="overflow-x-auto rounded-card border border-line bg-paper">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line bg-porcelain text-left">
              <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel-600">
                <th className="p-3">Number</th>
                <th className="p-3">Client</th>
                {isMaster(user.role) ? <th className="p-3">Raised by</th> : null}
                <th className="p-3">Status</th>
                <th className="p-3">Opens</th>
                <th className="p-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row._id} className="border-b border-line last:border-0 hover:bg-porcelain/60">
                  <td className="p-3">
                    <Link href={`/admin/quotations/${row._id}`} className="font-mono text-xs font-semibold text-decart-700 hover:underline">
                      {row.number}
                    </Link>
                    <span className="mt-0.5 block text-[11px] text-steel-400">
                      {new Date(row.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="max-w-[220px] p-3">
                    <span className="block truncate font-semibold text-ink-950">{row.client?.company ?? '—'}</span>
                    {row.title ? <span className="block truncate text-xs text-steel-600">{row.title}</span> : null}
                  </td>
                  {isMaster(user.role) ? (
                    <td className="p-3 text-steel-600">
                      {row.createdByName || '—'}
                      {row.office ? <span className="block text-[11px] text-steel-400">{row.office}</span> : null}
                    </td>
                  ) : null}
                  <td className="p-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                        STATUS_TONE[row.status],
                      )}
                    >
                      {QUOTE_STATUS_LABEL[row.status]}
                    </span>
                  </td>
                  <td className="p-3 text-steel-600">
                    {row.viewCount}
                    {row.downloadCount ? <span className="text-steel-400"> · {row.downloadCount} pdf</span> : null}
                  </td>
                  <td className="p-3 text-right font-semibold text-ink-950">{formatINR(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No quotations yet"
          body="Create one and it gets a number, a shareable link and a tracked open history."
          action={
            <ButtonLink href="/admin/quotations/new">
              <FileText className="h-4 w-4" />
              Create the first quotation
            </ButtonLink>
          }
        />
      )}
    </div>
  );
}
