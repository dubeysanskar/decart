import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { MasterNode } from '@/lib/taxonomy';

/**
 * The catalogue's own navigation, pinned under the site header on every /categories page.
 *
 * Row one is the master categories as tabs; row two is the categories inside the current one.
 * Both rows scroll sideways on a phone rather than wrapping, so the bar stays one thumb tall and
 * the products underneath stay on the first screen.
 */
export function CatalogueNav({
  masters,
  activeMaster,
  activeCategory,
}: {
  masters: MasterNode[];
  activeMaster: string;
  activeCategory?: string;
}) {
  const current = masters.find((m) => m.slug === activeMaster);

  return (
    <nav
      aria-label="Product categories"
      className="sticky top-16 z-30 border-b border-line bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85"
    >
      <div className="container-x">
        <ul className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto py-2">
          <li className="shrink-0">
            <Link
              href="/products"
              className="block rounded-full px-3.5 py-2 text-sm font-medium text-steel-600 transition-colors hover:bg-porcelain hover:text-ink-950"
            >
              All products
            </Link>
          </li>
          {masters.map((master) => {
            const active = master.slug === activeMaster;
            return (
              <li key={master.slug} className="shrink-0">
                <Link
                  href={master.href}
                  aria-current={active && !activeCategory ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors',
                    active ? 'bg-ink-950 text-porcelain' : 'text-ink-900 hover:bg-porcelain',
                  )}
                >
                  {master.name}
                  <span className={cn('font-mono text-[10px] font-normal', active ? 'text-steel-400' : 'text-steel-400')}>
                    {master.categories.length}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {current ? (
          <ul className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto border-t border-line py-2">
            {current.categories.map((category) => {
              const active = category.slug === activeCategory;
              return (
                <li key={category.slug} className="shrink-0">
                  <Link
                    href={category.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-full border px-3 py-1.5 text-[13px] transition-colors',
                      active
                        ? 'border-decart-600 bg-decart-50 font-semibold text-decart-700'
                        : 'border-line text-steel-600 hover:border-decart-300 hover:text-decart-700',
                    )}
                  >
                    {category.name}
                    {category.count > 0 ? (
                      <span className="ml-1.5 font-mono text-[10px] text-steel-400">{category.count}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </nav>
  );
}
