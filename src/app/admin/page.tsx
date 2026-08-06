import Link from 'next/link';
import { ArrowRight, Inbox, TriangleAlert } from 'lucide-react';
import { hasDb } from '@/lib/db';
import {
  countLeadsSince,
  countLeadsByStatus,
  countStaleNew,
  countLeadsStatusIn,
  countWonSince,
  countPendingReviews,
  countProducts,
  latestLeads,
  leadTypeBreakdownSince,
} from '@/lib/repo';
import { LEAD_TYPE_LABEL, type LeadType } from '@/lib/site';
import { formatDateTime, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60 * 1000;

export default async function AdminDashboard() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Database not configured</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel-600">
          Set <code className="font-mono">TURSO_DATABASE_URL</code> in your environment and run{' '}
          <code className="font-mono">npm run seed</code> to create the admin user and load the catalogue. The public
          site runs from the static seed until then.
        </p>
      </div>
    );
  }

  const now = Date.now();
  const weekAgo = new Date(now - 7 * DAY).toISOString();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const staleCutoff = new Date(now - DAY).toISOString();

  const [newThisWeek, awaiting, stale, quotesInPlay, wonThisMonth, pendingReviews, needsPhoto, latest, byType] =
    await Promise.all([
      countLeadsSince(weekAgo),
      countLeadsByStatus('new'),
      countStaleNew(staleCutoff),
      countLeadsStatusIn(['quoted', 'negotiation']),
      countWonSince(monthStart),
      countPendingReviews(),
      countProducts({ needsPhoto: true, status: 'published' }),
      latestLeads(5),
      leadTypeBreakdownSince(new Date(now - 14 * DAY).toISOString()),
    ]);

  const maxByType = Math.max(1, ...byType.map((row) => row.n));

  const cards = [
    { label: 'New this week', value: newThisWeek, href: '/admin/inbox' },
    {
      label: 'Awaiting first response',
      value: awaiting,
      href: '/admin/inbox?status=new',
      alert: stale > 0,
      note: stale > 0 ? `${stale} older than 24h` : undefined,
    },
    { label: 'Quotes in play', value: quotesInPlay, href: '/admin/inbox?status=quoted' },
    { label: 'Won this month', value: wonThisMonth, href: '/admin/inbox?status=won' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Dashboard</h1>
        <p className="mt-2 text-sm text-steel-600">Everything that came in through the website.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={cn(
              'rounded-card border bg-paper p-5 transition-colors hover:border-ink-800',
              card.alert ? 'border-danger/40' : 'border-line',
            )}
          >
            <p className="text-xs uppercase tracking-[0.1em] text-steel-600">{card.label}</p>
            <p className={cn('mt-2 font-mono text-3xl', card.alert ? 'text-danger' : 'text-ink-950')}>{card.value}</p>
            {card.note ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-danger">
                <TriangleAlert aria-hidden className="h-3 w-3" />
                {card.note}
              </p>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-card border border-line bg-paper p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-950">Latest queries</h2>
            <Link href="/admin/inbox" className="inline-flex items-center gap-1 text-sm font-semibold text-decart-700">
              Open inbox <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {latest.length ? (
            <ul className="mt-4 divide-y divide-line">
              {latest.map((lead) => (
                <li key={lead._id}>
                  <Link href={`/admin/inbox/${lead._id}`} className="flex items-center gap-3 py-3 hover:bg-porcelain">
                    <span
                      className={cn('h-2 w-2 shrink-0 rounded-full', lead.isRead ? 'bg-line' : 'bg-decart-500')}
                      aria-label={lead.isRead ? 'Read' : 'Unread'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-950">
                        {lead.name}
                        {lead.company ? <span className="font-normal text-steel-600"> · {lead.company}</span> : null}
                      </p>
                      <p className="truncate text-xs text-steel-600">
                        {LEAD_TYPE_LABEL[lead.type as LeadType]} · {lead.phone}
                        {lead.productCode ? ` · ${lead.productCode}` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">
                      {formatDateTime(lead.createdAt as unknown as Date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 flex items-center gap-2 text-sm text-steel-600">
              <Inbox className="h-4 w-4" /> No queries yet.
            </p>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">By type · last 14 days</h2>
            {byType.length ? (
              <ul className="mt-4 space-y-3">
                {byType.map((row) => (
                  <li key={row._id}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="text-steel-600">{LEAD_TYPE_LABEL[row._id as LeadType] ?? row._id}</span>
                      <span className="font-mono text-ink-950">{row.n}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-porcelain">
                      <div
                        className="h-full rounded-full bg-decart-500"
                        style={{ width: `${(row.n / maxByType) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-steel-600">Nothing in the last fortnight.</p>
            )}
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Needs you</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/admin/reviews?status=pending" className="flex justify-between hover:text-decart-700">
                  <span className="text-steel-600">Reviews awaiting moderation</span>
                  <span className="font-mono text-ink-950">{pendingReviews}</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/products?needsPhoto=1" className="flex justify-between hover:text-decart-700">
                  <span className="text-steel-600">Published models without a photo</span>
                  <span className="font-mono text-ink-950">{needsPhoto}</span>
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
