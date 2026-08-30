'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HexSpinner } from '@/components/ui/bits';
import type { QuoteStatus } from '@/lib/quote-calc';

/**
 * What the client can do with a quotation they have been sent: accept it, decline it, or take the
 * PDF. The PDF is rendered on the server and counted as it is served, so the salesperson sees the
 * download without the page having to report it separately.
 */
export function QuoteActions({ slug, status }: { slug: string; status: QuoteStatus }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState('');
  const [done, setDone] = useState<QuoteStatus | null>(null);

  const record = (action: string) =>
    fetch(`/api/q/${slug}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });

  useEffect(() => {
    // kept for links sent out before the PDF existed
    if (params.get('print') !== '1') return;
    window.location.assign(`/api/q/${slug}/pdf`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  async function respond(action: 'accept' | 'reject') {
    const label = action === 'accept' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${label} this quotation?`)) return;

    setBusy(action);
    const res = await record(action);
    setBusy('');
    if (!res.ok) return;
    setDone(action === 'accept' ? 'accepted' : 'rejected');
    router.refresh();
  }

  function download() {
    // the route counts the download as it serves the file
    window.open(`/api/q/${slug}/pdf`, '_blank', 'noopener');
  }

  const closed = done || ['accepted', 'rejected', 'cancelled', 'expired'].includes(status);

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      {closed ? (
        <p className="text-sm font-semibold text-ink-950">
          {(done ?? status) === 'accepted'
            ? 'Thank you — this quotation is accepted. We will be in touch about the order.'
            : (done ?? status) === 'rejected'
              ? 'This quotation has been declined. Tell us what to change and we will re-quote.'
              : 'This quotation is closed. Contact us for a fresh one.'}
        </p>
      ) : (
        <>
          <Button type="button" onClick={() => respond('accept')} disabled={Boolean(busy)}>
            {busy === 'accept' ? <HexSpinner /> : <Check className="h-4 w-4" />}
            Accept quotation
          </Button>
          <Button type="button" variant="secondary" onClick={() => respond('reject')} disabled={Boolean(busy)}>
            <X className="h-4 w-4" />
            Decline
          </Button>
        </>
      )}

      <Button type="button" variant="secondary" onClick={download}>
        <Download className="h-4 w-4" />
        Download PDF
      </Button>
    </div>
  );
}
