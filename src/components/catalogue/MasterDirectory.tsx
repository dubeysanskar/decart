import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryTile } from './CategoryTile';
import type { MasterNode } from '@/lib/taxonomy';

/**
 * The browse structure as the client drew it: each master category is a band, and the categories
 * inside it are a swipeable row of tiles. This is what the home page and /products show, and the
 * same tiles reappear as a grid on a master category's own page.
 *
 * Alternating grounds give the run some rhythm instead of one uninterrupted wall of white cards,
 * and the band heading links to the master's own page, so the whole group is reachable without
 * picking one of its categories.
 */
export function MasterDirectory({ masters }: { masters: MasterNode[] }) {
  if (!masters.length) return null;

  return (
    <div className="flex flex-col">
      {masters.map((master, index) => (
        <div key={master.slug} className={index % 2 === 1 ? 'bg-porcelain py-10 md:py-12' : 'bg-paper py-10 md:py-12'}>
          <div className="container-x min-w-0">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex min-w-0 items-baseline gap-4">
                <span className="font-display text-4xl font-semibold leading-none text-decart-600/25 md:text-5xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-2xl font-semibold text-ink-950 md:text-3xl">
                    <Link href={master.href} className="hover:text-decart-700">
                      {master.name}
                    </Link>
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                    {master.categories.length} {master.categories.length === 1 ? 'category' : 'categories'}
                    {master.count > 0 ? ` · ${master.count} models` : ''}
                    <span className="ml-2 lg:hidden">· swipe →</span>
                  </p>
                </div>
              </div>
              <span aria-hidden className="hidden h-px flex-1 bg-line md:block" />
              <Link
                href={master.href}
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 hover:text-decart-700"
              >
                All {master.name.toLowerCase()}
                <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div
              className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-7 md:px-7 lg:mx-0 lg:gap-5 lg:px-0"
              data-stagger="0.05"
            >
              {master.categories.map((category) => (
                <CategoryTile
                  key={category.slug}
                  category={category}
                  className="w-[46vw] shrink-0 snap-start sm:w-[240px] lg:w-[212px]"
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
