import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { currentUser, isMaster } from '@/lib/auth';
import { getQuotation, listActivity } from '@/lib/repo-quotes';
import { formatINR, quotePath } from '@/lib/quote-calc';
import { QuoteDocument } from '@/components/quote/QuoteDocument';
import { QuoteShare } from '@/components/admin/QuoteShare';
import { SITE } from '@/lib/site';
import { absoluteUrl } from '@/lib/origin';

export const dynamic = 'force-dynamic';

const EVENT_LABEL: Record<string, string> = {
  created: 'Quotation created',
  generated: 'Generated',
  sent: 'Marked sent',
  emailed: 'Emailed to the client',
  'email-failed': 'Email failed',
  'shared-whatsapp': 'Shared on WhatsApp',
  'link-copied': 'Link copied',
  viewed: 'Opened by the client',
  downloaded: 'PDF downloaded',
  accepted: 'Accepted',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export default async function QuotationDetailPage({ params }: { params: { id: string } }) {
  if (!hasDb()) notFound();

  const user = await currentUser();
  if (!user) notFound();

  const quotation = await getQuotation(params.id);
  // a sales user must not be able to read someone else's quotation by guessing the id
  if (!quotation || (!isMaster(user.role) && quotation.createdBy !== user.id)) notFound();

  const activity = await listActivity(params.id);
  // built from the serving host, not SITE.url: that domain still runs the old WordPress site
  const link = absoluteUrl(quotePath(quotation.number, quotation.token));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Link
          href="/admin/quotations"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel-600 hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" />
          All quotations
        </Link>
        <h1 className="mt-3 font-display text-3xl text-ink-950">{quotation.number}</h1>
        <p className="mt-1 text-sm text-steel-600">
          {quotation.client?.company} · {formatINR(quotation.total)} · raised by{' '}
          {quotation.createdByName || 'unknown'}
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="min-w-0 overflow-hidden rounded-card border border-line">
          <QuoteDocument quotation={quotation} />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <QuoteShare
            id={quotation._id}
            number={quotation.number}
            link={link}
            status={quotation.status}
            clientEmail={quotation.client?.email ?? ''}
            clientPhone={quotation.client?.phone ?? ''}
            total={formatINR(quotation.total)}
          />

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Engagement</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-card border border-line p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Opens</dt>
                <dd className="mt-1 font-display text-xl text-ink-950">{quotation.viewCount}</dd>
              </div>
              <div className="rounded-card border border-line p-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Downloads</dt>
                <dd className="mt-1 font-display text-xl text-ink-950">{quotation.downloadCount}</dd>
              </div>
            </dl>
            {quotation.viewedAt ? (
              <p className="mt-3 text-xs text-steel-600">
                First opened {new Date(quotation.viewedAt).toLocaleString('en-IN')}
              </p>
            ) : (
              <p className="mt-3 text-xs text-steel-600">Not opened yet.</p>
            )}
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Audit trail</h2>
            <ol className="mt-4 flex flex-col gap-3">
              {activity.map((entry) => (
                <li key={entry._id} className="flex gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-decart-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink-950">
                      {EVENT_LABEL[entry.event] ?? entry.event}
                    </p>
                    <p className="text-xs text-steel-600">
                      {entry.actor ? `${entry.actor} · ` : ''}
                      {new Date(entry.at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </li>
              ))}
              {!activity.length ? <li className="text-sm text-steel-600">Nothing recorded yet.</li> : null}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
