'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ClipboardList, CheckCircle2 } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { LeadForm } from '@/components/forms/LeadForm';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/bits';
import { useToast } from '@/components/ui/Toast';
import { useEnquiry } from './EnquiryProvider';
import { MAX_LINES } from '@/lib/enquiry';
import { formatINR } from '@/lib/quote-calc';

/**
 * The enquiry list itself: what is on it, in what quantity, and one form that sends the lot.
 *
 * Quantities are editable here rather than only on the product page, because a buyer settles
 * the floor by looking at the whole list — "sixty of these, so forty of those" — and going back
 * to eight product pages to change eight numbers is how a list gets abandoned.
 */
export function EnquirySheet() {
  const { items, summary, ready, setQty, remove, clear } = useEnquiry();
  const toast = useToast();
  /**
   * What was sent, captured before the list is emptied.
   *
   * Sending clears the list, which would otherwise drop the buyer straight onto the "your list
   * is empty" panel — the one screen that reads like the submission was lost. This holds the
   * totals so the page can confirm what went, and the form's own success panel is not the one
   * doing the talking because it unmounts with the list.
   */
  const [sent, setSent] = useState<{ lines: number; units: number } | null>(null);

  // localStorage has not been read yet on the first frame; a skeleton beats a false "empty"
  if (!ready) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="h-64 animate-pulse rounded-card bg-porcelain" />
        <div className="h-64 animate-pulse rounded-card bg-porcelain" />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="rounded-card border border-success/25 bg-success/5 p-6 md:p-8">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 aria-hidden className="h-5 w-5 shrink-0 text-success" />
          <h2 className="font-display text-xl text-ink-950">Sent — we have your list.</h2>
        </div>
        <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-steel-600">
          {sent.lines} {sent.lines === 1 ? 'model' : 'models'} and {sent.units} {sent.units === 1 ? 'unit' : 'units'} are
          with the sales desk. You will have a written quotation covering the whole list, usually the same working day —
          sooner if you WhatsApp us.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/products">Keep browsing</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Talk to the desk
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title="Your enquiry list is empty"
        body="Add the models you are considering — with quantities — and send them as one enquiry. It is the fastest way to get a quotation for a whole floor rather than a chair at a time."
        action={
          <>
            <ButtonLink href="/products">Browse the catalogue</ButtonLink>
            <ButtonLink href="/quote" variant="secondary">
              Or tell us what you need
            </ButtonLink>
          </>
        }
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-12">
      {/* ---------------------------------------------------------------- the lines */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">
            {summary.lines} {summary.lines === 1 ? 'model' : 'models'} · {summary.units}{' '}
            {summary.units === 1 ? 'unit' : 'units'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm('Remove everything from the enquiry list?')) return;
              clear();
              toast.push('Enquiry list cleared.', 'info');
            }}
            className="text-xs font-semibold text-steel-600 underline hover:text-danger"
          >
            Clear the list
          </button>
        </div>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.slug} className="flex min-w-0 gap-4 py-4">
              <Link
                href={`/products/${item.family}/${item.slug}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-img border border-line bg-paper"
              >
                <ProductImage
                  src={item.image}
                  alt={item.name}
                  label={item.code}
                  sizes="80px"
                  imgClassName="p-1.5"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.family}/${item.slug}`}
                  className="text-[0.9375rem] font-semibold leading-snug text-ink-950 hover:text-decart-700"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-steel-400">{item.code}</p>
                <p className="mt-1 text-xs text-steel-600">
                  {item.price ? `${formatINR(item.price)} each · indicative` : 'Price on request'}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex h-9 items-center overflow-hidden rounded-btn border border-line bg-paper">
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty - 1)}
                    disabled={item.qty <= 1}
                    aria-label={`Reduce the quantity of ${item.code}`}
                    className="flex h-full w-8 items-center justify-center text-ink-900 transition-colors hover:bg-porcelain disabled:text-steel-400"
                  >
                    <Minus aria-hidden className="h-3.5 w-3.5" />
                  </button>
                  <input
                    value={item.qty}
                    inputMode="numeric"
                    aria-label={`Quantity of ${item.code}`}
                    onChange={(event) => {
                      const next = Number(event.target.value.replace(/[^\d]/g, ''));
                      setQty(item.slug, next || 1);
                    }}
                    className="h-full w-12 border-x border-line bg-paper text-center font-mono text-xs text-ink-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQty(item.slug, item.qty + 1)}
                    aria-label={`Increase the quantity of ${item.code}`}
                    className="flex h-full w-8 items-center justify-center text-ink-900 transition-colors hover:bg-porcelain"
                  >
                    <Plus aria-hidden className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    remove(item.slug);
                    toast.push(`${item.code} removed.`, 'info');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-steel-600 hover:text-danger"
                >
                  <Trash2 aria-hidden className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        {items.length >= MAX_LINES ? (
          <p className="mt-3 rounded-btn border border-line bg-porcelain px-3 py-2 text-xs text-steel-600">
            That is the most the list holds. Send it and we will start a fresh one for the rest.
          </p>
        ) : null}

        <Link href="/products" className="mt-5 inline-block text-sm font-semibold text-decart-700 hover:underline">
          ← Add more models
        </Link>
      </div>

      {/* ------------------------------------------------------- the totals and the form */}
      <div className="min-w-0">
        <div className="rounded-card border border-line bg-porcelain p-5">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">
            <ClipboardList aria-hidden className="h-3.5 w-3.5 text-decart-600" />
            What we will quote
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-card border border-line bg-paper p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Models</dt>
              <dd className="mt-1 font-display text-xl text-ink-950">{summary.lines}</dd>
            </div>
            <div className="rounded-card border border-line bg-paper p-3">
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Units</dt>
              <dd className="mt-1 font-display text-xl text-ink-950">{summary.units}</dd>
            </div>
          </dl>

          {/*
            An indicative figure is shown only for the lines the catalogue actually prices, and
            it is labelled as indicative. Pretending to total a list where most lines are quoted
            per requirement would be a number nobody could stand behind.
          */}
          {summary.pricedLines ? (
            <p className="mt-3 text-sm text-steel-600">
              <strong className="font-semibold text-ink-950">{formatINR(summary.pricedTotal)}</strong> indicative for{' '}
              {summary.pricedLines} priced {summary.pricedLines === 1 ? 'line' : 'lines'}, before GST and freight.
              {summary.onRequestLines
                ? ` The other ${summary.onRequestLines} ${summary.onRequestLines === 1 ? 'line is' : 'lines are'} quoted per requirement.`
                : ''}
            </p>
          ) : (
            <p className="mt-3 text-sm text-steel-600">
              Every line here is quoted per requirement — quantity, finish and freight decide the price. You will have
              a written quotation, usually the same working day.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-card border border-line bg-paper p-5 md:p-6">
          <h2 className="font-display text-h3 text-ink-950">Send the list</h2>
          <p className="mt-2 text-[0.9375rem] text-steel-600">
            We will price these models against your quantities and come back with a quotation.
          </p>
          <div className="mt-5">
            {/* the lines ride along in the lead, so the desk sees the floor without asking */}
            <LeadForm
              type="bulk"
              items={items}
              onSent={() => {
                setSent({ lines: summary.lines, units: summary.units });
                clear();
              }}
              alwaysAskCompany
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
