'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn } from 'lucide-react';
import { PlaceholderImage } from '@/components/ui/ProductImage';
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
function swatchColours(slug: string) {
  const parts = slug.split('-with-');
  const pick = (value?: string) => {
    if (!value) return null;
    const key = Object.keys(SWATCH).find((k) => value.includes(k));
    return key ? SWATCH[key] : null;
  };
  const base = pick(parts[0]) ?? '#5C6670';
  const accent = pick(parts[1]) ?? base;
  return { base, accent };
}

export function ProductGallery({
  images,
  colourways,
  name,
  code,
}: {
  images: { src: string; alt: string }[];
  colourways: Colourway[];
  name: string;
  code: string;
}) {
  const hasColourways = colourways.length > 1;
  const [colour, setColour] = useState(colourways[0]?.slug ?? '');
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const active = useMemo(() => {
    if (!hasColourways) return images.map((img) => img.src);
    const found = colourways.find((c) => c.slug === colour);
    return found?.images ?? images.map((img) => img.src);
  }, [colour, colourways, hasColourways, images]);

  const current = active[Math.min(index, active.length - 1)];
  const colourLabel = colourways.find((c) => c.slug === colour)?.label;
  const alt = `DecArt ${name} (${code})${colourLabel ? ` in ${colourLabel}` : ''} — office chair manufacturer, Faridabad`;

  return (
    // min-w-0: as a grid item this defaults to min-width:auto, so the thumbnail strip below
    // would force the whole PDP wider than a 390px phone.
    <div className="flex min-w-0 flex-col gap-4">
      <div className="hex-frame relative aspect-square overflow-hidden rounded-img bg-porcelain">
        {current ? (
          <>
            <Image
              src={current}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              className="rounded-[18px] object-contain p-6"
            />
            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label="Zoom image"
              className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-900 backdrop-blur hover:bg-paper"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </>
        ) : (
          <PlaceholderImage label={code} />
        )}
      </div>

      {active.length > 1 ? (
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
          {active.slice(0, 10).map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                'relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] border bg-porcelain transition-colors',
                i === index ? 'border-ink-900' : 'border-line hover:border-steel-400',
              )}
            >
              <Image src={src} alt="" fill sizes="72px" className="rounded-lg object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}

      {hasColourways ? (
        <div>
          <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-steel-600">
            Colourways · <span className="text-ink-900">{colourLabel}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {colourways.map((option) => {
              const { base, accent } = swatchColours(option.slug);
              const selected = option.slug === colour;
              return (
                <button
                  key={option.slug}
                  type="button"
                  title={option.label}
                  aria-label={option.label}
                  aria-pressed={selected}
                  onClick={() => {
                    setColour(option.slug);
                    setIndex(0);
                  }}
                  className={cn(
                    'h-9 w-9 overflow-hidden rounded-full border-2 transition-transform',
                    selected ? 'border-ink-900 scale-105' : 'border-line hover:border-steel-400',
                  )}
                >
                  <span className="flex h-full w-full">
                    <span className="h-full w-1/2" style={{ background: base }} />
                    <span className="h-full w-1/2" style={{ background: accent }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {zoom && current ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/95 p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-porcelain hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image src={current} alt={alt} fill sizes="100vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
