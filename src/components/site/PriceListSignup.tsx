'use client';

import { useRef, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { HexSpinner } from '@/components/ui/bits';
import { SITE } from '@/lib/site';

/**
 * "Send me the price list" — the footer capture.
 *
 * The catalogue PDF is already a free download, so asking for an email to hand over the same
 * file would be a toll booth. What a dealer or a buying team actually cannot download is the
 * trade price list, so that is what this offers, and it lands in the inbox as an ordinary lead
 * the sales desk can qualify.
 *
 * Two fields only. Every additional box on a footer form costs completions, and the desk can
 * ask the rest when it replies.
 */
export function PriceListSignup() {
  const startedAt = useRef(Date.now());
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [honey, setHoney] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setError('');
    setState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'contact',
          // the desk replies to the address, so the name is the company when we have one
          name: company.trim() || 'Price list request',
          company: company.trim(),
          email: email.trim(),
          phone: '',
          message: 'Requested the trade price list and current catalogue from the footer.',
          extra: { subject: 'Price list request' },
          page: '/footer',
          website: honey,
          startedAt: startedAt.current,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setError(json?.error ?? 'That did not go through. Please email us instead.');
        setState('error');
        return;
      }
      setState('sent');
    } catch {
      setError('That did not go through. Please email us instead.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="flex items-start gap-2.5 rounded-card border border-white/15 bg-white/[0.04] p-4">
        <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-300" />
        <p className="text-sm text-steel-400">
          Thanks — the price list is on its way from{' '}
          <span className="text-porcelain">{SITE.emailSales}</span> on the next working day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0">
      <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-300">Trade price list</p>
      <p className="mt-2 max-w-sm text-sm text-steel-400">
        Dealer and project pricing, plus the current catalogue. Sent by a person, not a mailing list.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="pricelist-company">
          Company
        </label>
        <input
          id="pricelist-company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Company (optional)"
          autoComplete="organization"
          className="h-11 min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-sm text-porcelain placeholder:text-steel-400 focus:border-decart-300 focus:outline-none"
        />
        <label className="sr-only" htmlFor="pricelist-email">
          Work email
        </label>
        <input
          id="pricelist-email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder="Work email"
          className="h-11 min-w-0 flex-1 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-sm text-porcelain placeholder:text-steel-400 focus:border-decart-300 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-porcelain px-5 text-sm font-semibold text-ink-950 transition-colors hover:bg-white disabled:opacity-70"
        >
          {state === 'sending' ? <HexSpinner /> : <ArrowRight aria-hidden className="h-4 w-4" />}
          Send it
        </button>
      </div>

      {/* same honeypot the main forms use: a bot fills it, a person never sees it */}
      <input
        type="text"
        name="website"
        value={honey}
        onChange={(event) => setHoney(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </form>
  );
}
