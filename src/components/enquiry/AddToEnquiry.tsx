'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ListPlus, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useEnquiry } from './EnquiryProvider';
import { MAX_QTY, type EnquiryItem } from '@/lib/enquiry';
import { cn } from '@/lib/utils';

type Target = Omit<EnquiryItem, 'qty'>;

/**
 * "Add to enquiry" — the card version.
 *
 * The whole card is a link to the model, so this button has to stop the click from navigating;
 * otherwise adding a chair would also walk you off the grid you were shopping.
 */
export function AddToEnquiryIcon({ item, className }: { item: Target; className?: string }) {
  const { add, has, ready } = useEnquiry();
  const toast = useToast();
  const inList = ready && has(item.slug);

  return (
    <button
      type="button"
      aria-label={inList ? `${item.code} is in your enquiry list — add one more` : `Add ${item.code} to the enquiry list`}
      title={inList ? 'In your enquiry list' : 'Add to enquiry list'}
      onClick={(event) => {
        // the card is an <a>: without this the page navigates and the toast never lands
        event.preventDefault();
        event.stopPropagation();
        const result = add({ ...item, qty: 1 });
        if (result === 'full') {
          toast.push('The enquiry list is full — send it and we will start a fresh one.', 'error');
          return;
        }
        toast.push(
          result === 'topped-up' ? `${item.code} — quantity increased.` : `${item.code} added to your enquiry list.`,
          'success',
        );
      }}
      className={cn(
        'absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-colors',
        inList
          ? 'border-decart-600 bg-decart-600 text-white'
          : 'border-line bg-paper/90 text-ink-900 backdrop-blur hover:border-decart-600 hover:text-decart-700',
        className,
      )}
    >
      {inList ? <Check aria-hidden className="h-4 w-4" /> : <ListPlus aria-hidden className="h-4 w-4" />}
    </button>
  );
}

/**
 * The product-page version: a quantity first, then the button.
 *
 * Quantity is the whole point of a B2B enquiry — "a chair" is not an order — so the stepper is
 * on the page rather than left to be typed into a message box later.
 */
export function AddToEnquiryButton({ item }: { item: Target }) {
  const { add, has, ready } = useEnquiry();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inList = ready && has(item.slug);

  const step = (by: number) => setQty((current) => Math.min(MAX_QTY, Math.max(1, current + by)));

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-line bg-paper">
        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Reduce quantity"
          className="flex h-full w-11 items-center justify-center text-ink-900 transition-colors hover:bg-porcelain disabled:text-steel-400"
          disabled={qty <= 1}
        >
          <Minus aria-hidden className="h-4 w-4" />
        </button>
        <label className="sr-only" htmlFor="enquiry-qty">
          Quantity
        </label>
        <input
          id="enquiry-qty"
          value={qty}
          inputMode="numeric"
          onChange={(event) => {
            const next = Number(event.target.value.replace(/[^\d]/g, ''));
            setQty(next ? Math.min(MAX_QTY, next) : 1);
          }}
          className="h-full w-14 border-x border-line bg-paper text-center font-mono text-sm text-ink-900 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Increase quantity"
          className="flex h-full w-11 items-center justify-center text-ink-900 transition-colors hover:bg-porcelain"
        >
          <Plus aria-hidden className="h-4 w-4" />
        </button>
      </div>

      <Button
        type="button"
        size="lg"
        variant="secondary"
        onClick={() => {
          const result = add({ ...item, qty });
          if (result === 'full') {
            toast.push('The enquiry list is full — send it and we will start a fresh one.', 'error');
            return;
          }
          setAdded(true);
          toast.push(`${qty} × ${item.code} on your enquiry list.`, 'success');
        }}
      >
        <ListPlus aria-hidden className="h-4 w-4" />
        Add to enquiry list
      </Button>

      {added || inList ? (
        <Link href="/enquiry" className="text-sm font-semibold text-decart-700 hover:underline">
          Review the list →
        </Link>
      ) : null}
    </div>
  );
}
