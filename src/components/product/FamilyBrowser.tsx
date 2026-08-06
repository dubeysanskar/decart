'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/bits';
import { COPY } from '@/lib/site';
import { cn } from '@/lib/utils';
import type { CatalogueProduct } from '@/lib/catalogue';

type Sort = 'featured' | 'newest' | 'code';
const PAGE = 24;

/** Family listing with in-family search, tag filters and sort. Filters open as a bottom sheet on mobile (§11.3). */
export function FamilyBrowser({
  products,
  familyName,
  tags,
}: {
  products: CatalogueProduct[];
  familyName: string;
  tags: string[];
}) {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>('featured');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (q && !`${product.name} ${product.code}`.toLowerCase().includes(q)) return false;
      if (activeTags.length && !activeTags.every((tag) => product.tags?.includes(tag))) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === 'code') return a.code.localeCompare(b.code, undefined, { numeric: true });
      if (sort === 'newest') return (b.images?.length ?? 0) - (a.images?.length ?? 0) || a.order - b.order;
      // featured: photographed + featured first, then catalogue order
      const rank = (p: CatalogueProduct) => (p.bestSeller ? 0 : p.featured ? 1 : p.images?.length ? 2 : 3);
      return rank(a) - rank(b) || a.order - b.order;
    });
  }, [products, query, activeTags, sort]);

  const toggleTag = (tag: string) =>
    setActiveTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag]));

  const clear = () => {
    setQuery('');
    setActiveTags([]);
  };

  const filters = (
    <>
      <div className="relative">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search in ${familyName}`}
          aria-label={`Search in ${familyName}`}
          className="h-12 w-full rounded-btn border border-line bg-paper pl-10 pr-4 text-base text-ink-900 placeholder:text-steel-400 focus:border-decart-600 md:w-72"
        />
      </div>

      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              aria-pressed={activeTags.includes(tag)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition-colors',
                activeTags.includes(tag)
                  ? 'border-ink-900 bg-ink-900 text-porcelain'
                  : 'border-line bg-paper text-steel-600 hover:border-ink-800 hover:text-ink-900',
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-steel-600">
        Sort
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-11 rounded-btn border border-line bg-paper px-3 text-sm text-ink-900 focus:border-decart-600"
        >
          <option value="featured">Featured</option>
          <option value="newest">Photographed first</option>
          <option value="code">Model code</option>
        </select>
      </label>
    </>
  );

  return (
    <section className="section bg-paper">
      <div className="container-x">
        {/* desktop toolbar */}
        <div className="hidden flex-wrap items-center gap-4 md:flex">{filters}</div>

        {/* mobile toolbar */}
        <div className="flex items-center gap-3 md:hidden">
          <Button variant="secondary" className="flex-1" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal aria-hidden className="h-4 w-4" />
            Filters{activeTags.length ? ` (${activeTags.length})` : ''}
          </Button>
          <span className="font-mono text-xs text-steel-600">{filtered.length}</span>
        </div>

        <p className="mt-6 hidden font-mono text-xs uppercase tracking-[0.1em] text-steel-600 md:block">
          {filtered.length} of {products.length} models
        </p>

        {filtered.length ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {filtered.slice(0, shown).map((product, i) => (
                <ProductCard key={product.slug} product={product} familyName={familyName} priority={i < 4} />
              ))}
            </div>

            {filtered.length > shown ? (
              <div className="mt-10 text-center">
                <Button variant="secondary" onClick={() => setShown((n) => n + PAGE)}>
                  Load more ({filtered.length - shown} left)
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            className="mt-8"
            title={COPY.emptyFamily.split('.')[0]}
            body="Tell us what you need — custom builds are our daily work."
            action={
              <>
                <ButtonLink href="/quote?type=custom">Request a custom build</ButtonLink>
                <Button variant="secondary" onClick={clear}>
                  Clear filters
                </Button>
              </>
            }
          />
        )}
      </div>

      {/* mobile filter sheet */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-ink-950/50"
            onClick={() => setSheetOpen(false)}
          />
          <div className="safe-bottom relative max-h-[80vh] overflow-y-auto rounded-t-card bg-paper p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-950">Filters</h2>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close" className="p-2">
                <X className="h-5 w-5 text-steel-600" />
              </button>
            </div>
            <div className="flex flex-col gap-5">{filters}</div>
            <div className="sticky bottom-0 mt-6 flex gap-3 bg-paper pt-4">
              <Button variant="secondary" className="flex-1" onClick={clear}>
                Clear
              </Button>
              <Button className="flex-1" onClick={() => setSheetOpen(false)}>
                Show {filtered.length}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
