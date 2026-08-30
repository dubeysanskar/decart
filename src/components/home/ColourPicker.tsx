'use client';

import { useState } from 'react';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn } from '@/lib/utils';

export type Colourway = { label: string; slug: string; images: string[] };

const SWATCH: Record<string, string> = {
  black: '#1B1B1B',
  grey: '#8E969D',
  white: '#F2F3F4',
  blue: '#2E6FC7',
  green: '#2E9E63',
  red: '#C93A3A',
  orange: '#E07B23',
  silver: '#B9BDC1',
  studio: '#5C6670',
  standard: '#5C6670',
};

/** Reads "black with red" / "grey with orange" into a two-stop chip. */
function swatch(slug: string) {
  const parts = slug.split('-with-');
  const pick = (value?: string) => {
    if (!value) return null;
    const key = Object.keys(SWATCH).find((k) => value.includes(k));
    return key ? SWATCH[key] : null;
  };
  const base = pick(parts[0]) ?? '#5C6670';
  return { base, accent: pick(parts[1]) ?? base };
}

/**
 * The colourway picker on the home page. This was previously static markup — the swatches were
 * plain divs, so clicking one did nothing and the photo never changed. They are real buttons now
 * and the shot swaps with the selection.
 */
export function ColourPicker({
  colourways,
  productName,
  productCode,
}: {
  colourways: Colourway[];
  productName: string;
  productCode: string;
}) {
  const [active, setActive] = useState(colourways[0]?.slug ?? '');
  const current = colourways.find((c) => c.slug === active) ?? colourways[0];

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
      <div
        className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-card bg-paper shadow-podium"
        data-anim="scale"
      >
        <ProductImage
          // keyed on the colourway so the fade-in replays when the shot swaps
          key={current?.slug}
          src={current?.images?.[0]}
          alt={`DecArt ${productName} in ${current?.label ?? 'standard'}`}
          label={productCode}
          sizes="(max-width: 1024px) 90vw, 460px"
          imgClassName="p-6"
        />
        {current?.label ? (
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink-950/85 px-4 py-1.5 text-xs font-medium text-porcelain backdrop-blur">
            {current.label}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {colourways.slice(0, 12).map((colour) => {
          const { base, accent } = swatch(colour.slug);
          const selected = colour.slug === active;
          return (
            <button
              key={colour.slug}
              type="button"
              onClick={() => setActive(colour.slug)}
              aria-pressed={selected}
              className={cn(
                'flex items-center gap-3 rounded-2xl border bg-paper p-3 text-left shadow-card transition-all',
                selected
                  ? 'border-decart-600 ring-1 ring-decart-600'
                  : 'border-line hover:-translate-y-0.5 hover:border-decart-300',
              )}
            >
              <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-line">
                <span className="h-full w-1/2" style={{ background: base }} />
                <span className="h-full w-1/2" style={{ background: accent }} />
              </span>
              <span
                className={cn(
                  'text-xs leading-tight',
                  selected ? 'font-semibold text-ink-950' : 'text-steel-600',
                )}
              >
                {colour.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
