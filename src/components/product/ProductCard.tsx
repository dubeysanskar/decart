import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { SpecPlate } from '@/components/ui/SpecPlate';
import { cn } from '@/lib/utils';
import type { CatalogueProduct } from '@/lib/catalogue';

const LEATHER_FAMILIES = new Set(['director', 'ceo', 'executive', 'imported']);

/** Colourway slugs → a two-stop chip, so a card shows the range at a glance. */
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
};

function swatch(slug: string) {
  const [base, accent] = slug.split('-with-');
  const pick = (value?: string) => {
    if (!value) return null;
    const key = Object.keys(SWATCH).find((k) => value.includes(k));
    return key ? SWATCH[key] : null;
  };
  return { base: pick(base) ?? '#5C6670', accent: pick(accent) ?? pick(base) ?? '#5C6670' };
}

export function ProductCard({
  product,
  familyName,
  priority = false,
  className,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
}: {
  product: CatalogueProduct;
  familyName?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const hero = product.images?.[0];
  const colourways = product.colourways ?? [];

  return (
    <Link
      href={`/products/${product.family}/${product.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card bg-paper',
        'shadow-[0_0_0_1px_rgb(227_231_236)] transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(15_19_23/0.14),0_24px_40px_-24px_rgb(15_19_23/0.35)]',
        className,
      )}
    >
      {/* image well — a recessed porcelain stage, not a bordered box */}
      <div className="relative aspect-[4/5] overflow-hidden bg-porcelain">
        <ProductImage
          src={hero?.src}
          alt={hero?.alt || `DecArt ${product.name} (${product.code})`}
          label={product.code}
          priority={priority}
          sizes={sizes}
          imgClassName="p-4 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />

        {product.bestSeller ? (
          <span className="absolute left-3 top-3 rounded-full bg-ink-950/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-porcelain backdrop-blur">
            Best seller
          </span>
        ) : null}

        {/* nameplate parked on the image, the way a tag sits on a showroom piece */}
        <SpecPlate
          code={product.code}
          size="sm"
          cognac={LEATHER_FAMILIES.has(product.family)}
          className="absolute bottom-3 left-3 shadow-sm"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {familyName ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-decart-600">{familyName}</p>
        ) : null}

        <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
          {product.name}
        </h3>

        {product.summary ? (
          <p className="line-clamp-2 text-[0.8125rem] leading-snug text-steel-600">{product.summary}</p>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {colourways.length > 1 ? (
            <span className="flex items-center gap-1.5" aria-label={`${colourways.length} colourways`}>
              {colourways.slice(0, 5).map((colour) => {
                const { base, accent } = swatch(colour.slug);
                return (
                  <span
                    key={colour.slug}
                    title={colour.label}
                    className="flex h-3.5 w-3.5 overflow-hidden rounded-full ring-1 ring-line"
                  >
                    <span className="h-full w-1/2" style={{ background: base }} />
                    <span className="h-full w-1/2" style={{ background: accent }} />
                  </span>
                );
              })}
              {colourways.length > 5 ? (
                <span className="font-mono text-[10px] text-steel-400">+{colourways.length - 5}</span>
              ) : null}
            </span>
          ) : (
            <span className="text-[0.8125rem] text-steel-600">Price on request</span>
          )}

          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-decart-700 transition-transform duration-300 group-hover:translate-x-0.5">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
