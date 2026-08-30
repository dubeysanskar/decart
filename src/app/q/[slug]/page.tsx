import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { hasDb } from '@/lib/db';
import { getQuotationByToken, recordQuoteView } from '@/lib/repo-quotes';
import { parseQuoteSlug, formatINR } from '@/lib/quote-calc';
import { QuoteDocument } from '@/components/quote/QuoteDocument';
import { QuoteActions } from '@/components/quote/QuoteActions';
import { SITE } from '@/lib/site';

// every open is a tracked event, so this can never be cached
export const dynamic = 'force-dynamic';

/** A quotation is private to whoever holds the link — keep it out of search results. */
export const metadata: Metadata = {
  title: `Quotation — ${SITE.brandName}`,
  robots: { index: false, follow: false },
};

export default async function PublicQuotationPage({ params }: { params: { slug: string } }) {
  if (!hasDb()) notFound();

  const parsed = parseQuoteSlug(params.slug);
  if (!parsed) notFound();

  const quotation = await getQuotationByToken(parsed.number, parsed.token);
  if (!quotation) notFound();

  if (quotation.status === 'cancelled') {
    return (
      <main className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <h1 className="font-display text-h3 text-ink-950">This quotation has been withdrawn</h1>
        <p className="mt-3 max-w-md text-[0.9375rem] text-steel-600">
          Quotation {quotation.number} is no longer valid. Call {SITE.phone} and we will send you a
          current one.
        </p>
      </main>
    );
  }

  // recorded before the document renders, so a salesperson sees the open even if the client
  // closes the tab immediately
  await recordQuoteView(quotation._id, quotation.status);

  return (
    <main className="bg-porcelain py-8 print:bg-paper print:py-0">
      <div className="container-x flex max-w-4xl flex-col gap-5 px-4 print:max-w-none print:p-0">
        <header className="flex flex-wrap items-end justify-between gap-3 print:hidden">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">
              Quotation for {quotation.client?.company}
            </p>
            <h1 className="mt-1 font-display text-h3 text-ink-950">{quotation.number}</h1>
          </div>
          <p className="font-display text-2xl font-semibold text-decart-700">{formatINR(quotation.total)}</p>
        </header>

        <div className="overflow-hidden rounded-card border border-line bg-paper print:rounded-none print:border-0">
          <QuoteDocument quotation={quotation} />
        </div>

        <Suspense fallback={null}>
          <QuoteActions slug={params.slug} status={quotation.status} />
        </Suspense>
      </div>
    </main>
  );
}
