import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn } from '@/lib/utils';
import type { CategoryNode } from '@/lib/taxonomy';

/** "Mesh Office Chair" → "MO". Two letters read as a monogram; more reads as a word. */
const monogram = (name: string) =>
  name
    .split(/[\s/&-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

/**
 * One category, as a card.
 *
 * With a picture it is the same staged cut-out the series cards use. Without one — and most of
 * the client's categories have none yet — it is a typographic tile, not the hexagon placeholder:
 * a row of seven "photo on request" plates reads as a site with something wrong, while a tile
 * that is plainly a label reads as a deliberate one. The count says "Made to order" where no
 * model is online, which is the honest description of every range we build on request.
 */
export function CategoryTile({
  category,
  className,
  priority = false,
}: {
  category: Pick<CategoryNode, 'name' | 'href' | 'cover' | 'count'>;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={category.href}
      data-anim="rise"
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card bg-paper ring-1 ring-line transition-all duration-300 hover:-translate-y-1.5 hover:ring-decart-300 hover:shadow-[0_22px_38px_-22px_rgb(15_19_23/0.35)]',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category.cover ? (
          <>
            <span
              aria-hidden
              className="absolute inset-0"
              style={{ background: 'radial-gradient(60% 55% at 50% 45%, rgb(88 181 224 / 0.10), transparent 70%)' }}
            />
            <ProductImage
              src={category.cover}
              alt={`DecArt ${category.name}`}
              label={category.name}
              priority={priority}
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 240px, 212px"
              imgClassName="p-4 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.05]"
            />
            <span
              aria-hidden
              className="absolute bottom-4 left-1/2 h-2 w-1/2 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-md transition-all duration-500 group-hover:w-[56%] group-hover:bg-ink-950/[0.14]"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-porcelain to-decart-50/70"
          >
            <span className="font-display text-5xl font-semibold tracking-tight text-decart-600/20 transition-colors duration-300 group-hover:text-decart-600/35">
              {monogram(category.name)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 items-end justify-between gap-2 border-t border-line p-4">
        <div className="min-w-0">
          <h4 className="line-clamp-2 text-[0.875rem] font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
            {category.name}
          </h4>
          <span className="mt-1 block font-mono text-[10px] tracking-[0.08em] text-steel-400">
            {category.count > 0 ? `${category.count} ${category.count === 1 ? 'model' : 'models'}` : 'Made to order'}
          </span>
        </div>
        <span
          aria-hidden
          className="flex h-7 w-7 shrink-0 translate-x-1 items-center justify-center rounded-full bg-decart-50 text-decart-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
