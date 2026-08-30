'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUp, ArrowDown, GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { cn } from '@/lib/utils';

export type ArrangeRow = { slug: string; code: string; name: string; hero: string };

/**
 * Fixes the running order of the models inside one category.
 *
 * The client asked to be able to put a model in 1st or 2nd position. The catalogue already
 * sorts on `order`, so this writes the arrangement back as 0,1,2… Nothing is saved until they
 * press Save, and Reset restores the order the page was loaded with.
 */
export function ProductArranger({
  family,
  familyName,
  rows,
}: {
  family: string;
  familyName: string;
  rows: ArrangeRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState(rows);
  const [busy, setBusy] = useState(false);

  const dirty = order.some((row, i) => row.slug !== rows[i]?.slug);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setOrder(next);
  };

  async function save() {
    setBusy(true);
    const res = await fetch('/api/products/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ family, slugs: order.map((row) => row.slug) }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      toast.push(`Order saved — ${familyName} now shows in this sequence.`, 'success');
      router.refresh();
    } else {
      toast.push(json?.error || 'Could not save the order.', 'error');
    }
  }

  if (!rows.length) return null;

  return (
    <section className="rounded-card border border-line bg-paper p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink-950">Arrange {familyName}</h2>
          <p className="mt-1 text-sm text-steel-600">
            The order here is the order buyers see on the category page. Position 1 shows first.
          </p>
        </div>
        <div className="flex gap-2">
          {dirty ? (
            <Button variant="secondary" size="sm" onClick={() => setOrder(rows)} disabled={busy}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          ) : null}
          <Button size="sm" onClick={save} disabled={busy || !dirty}>
            {busy ? <HexSpinner /> : null}
            {dirty ? 'Save order' : 'Saved'}
          </Button>
        </div>
      </div>

      <ol className="mt-5 flex flex-col gap-2">
        {order.map((row, i) => (
          <li
            key={row.slug}
            className={cn(
              'flex items-center gap-3 rounded-btn border bg-paper p-2.5 transition-colors',
              row.slug !== rows[i]?.slug ? 'border-decart-300 bg-decart-50' : 'border-line',
            )}
          >
            <GripVertical aria-hidden className="h-4 w-4 shrink-0 text-steel-400" />
            <span className="w-7 shrink-0 text-center font-mono text-sm font-semibold text-decart-700">
              {i + 1}
            </span>

            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-btn bg-paper">
              {row.hero ? (
                <Image src={row.hero} alt="" fill sizes="44px" className="object-contain p-1" />
              ) : null}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink-950">{row.name}</span>
              <span className="block font-mono text-[10px] tracking-[0.08em] text-steel-400">{row.code}</span>
            </span>

            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Move ${row.name} up`}
                className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-steel-600 transition-colors hover:border-ink-800 hover:text-ink-950 disabled:opacity-35"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === order.length - 1}
                aria-label={`Move ${row.name} down`}
                className="flex h-9 w-9 items-center justify-center rounded-btn border border-line text-steel-600 transition-colors hover:border-ink-800 hover:text-ink-950 disabled:opacity-35"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
