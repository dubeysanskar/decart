import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { QuoteBand } from '@/components/home/sections';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { getAllProducts, getNavFamilies, GROUPS } from '@/lib/catalogue';
import { CHECKLIST_CATEGORIES } from '@/data/catalogue.seed';
import { buildMetadata } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'All Products — Office Chairs, Desks & Furniture',
  description:
    'The full DecArt catalogue: 350+ models across 30 families — director and executive chairs, ergonomic mesh, task seating, workstations, conference tables and institutional furniture.',
  path: '/products',
});

type Search = { group?: string; tag?: string; view?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const [families, products] = await Promise.all([getNavFamilies(), getAllProducts()]);

  const activeGroup = GROUPS.find((g) => g.slug === searchParams.group)?.slug;
  const activeTag = searchParams.tag;
  /**
   * The catalogue holds 540+ printed model codes but only the photographed range has imagery.
   * Showing every code by default fills the grid with placeholders and reads as broken, so the
   * default view is "photographed" and the full printed list is one click away.
   */
  const showAll = searchParams.view === 'all';

  const visible = products.filter((p) => {
    if (activeGroup && p.group !== activeGroup) return false;
    if (activeTag && !p.tags?.includes(activeTag)) return false;
    if (!showAll && !p.images?.length) return false;
    return true;
  });

  const photographed = products.filter((p) => p.images?.length).length;
  const ordered = [...visible].sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0));
  const familyName = (slug: string) => families.find((f) => f.slug === slug)?.name;
  const withView = (base: string) => (showAll ? `${base}${base.includes('?') ? '&' : '?'}view=all` : base);

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Every model we make"
        lede="Thirty families, 350+ printed models, and a growing set shot in our own studio. Prices are quoted per requirement — send us quantities and a site city."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Products' }]}
      >
        <div className="flex flex-wrap gap-2">
          <FilterChip href={withView('/products')} active={!activeGroup && !activeTag}>
            All
          </FilterChip>
          {GROUPS.map((group) => (
            <FilterChip
              key={group.slug}
              href={withView(`/products?group=${group.slug}`)}
              active={activeGroup === group.slug}
            >
              {group.name}
            </FilterChip>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-btn border border-line bg-paper p-3">
          <span className="text-sm text-steel-600">
            {showAll
              ? `Showing all ${products.length} printed model codes — ${products.length - photographed} are still awaiting photography.`
              : `Showing the ${photographed} models we hold studio photography for.`}
          </span>
          <a
            href={showAll ? '/products' : '/products?view=all'}
            className="ml-auto text-sm font-semibold text-decart-700 hover:underline"
          >
            {showAll ? 'Show photographed only' : `Show all ${products.length} model codes →`}
          </a>
        </div>

        <div className="mt-5">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-steel-600">Popular categories</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {CHECKLIST_CATEGORIES.filter((c) => families.some((f) => c.families.includes(f.slug))).map((category) => (
              <Link
                key={category.slug}
                href={`/products/${category.families[0]}`}
                className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-steel-600 hover:border-decart-300 hover:text-decart-700"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="section bg-paper">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-steel-600">
              {ordered.length} models{activeGroup ? ` · ${GROUPS.find((g) => g.slug === activeGroup)?.name}` : ''}
            </p>
            <Link href="/downloads" className="text-sm font-semibold text-decart-700 hover:underline">
              Download the full catalogue (PDF) →
            </Link>
          </div>

          {ordered.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {ordered.slice(0, 96).map((product, i) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  familyName={familyName(product.family)}
                  priority={i < 4}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No models match those filters"
              body="Tell us what you need — custom builds are our daily work."
              action={<ButtonLink href="/quote?type=custom">Request a custom build</ButtonLink>}
            />
          )}

          {ordered.length > 96 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-steel-600">
                Showing the first 96 of {ordered.length}. Browse a family for the complete list.
              </p>
            </div>
          ) : null}

          <div className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-h3 text-ink-950">Browse by family</h2>
            <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {GROUPS.map((group) => {
                const inGroup = families.filter((f) => f.group === group.slug);
                if (!inGroup.length) return null;
                return (
                  <div key={group.slug}>
                    <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">
                      {group.name}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {inGroup.map((family) => (
                        <li key={family.slug}>
                          <Link
                            href={`/products/${family.slug}`}
                            className="flex items-baseline justify-between gap-3 text-sm text-steel-600 hover:text-decart-700"
                          >
                            <span>{family.name}</span>
                            <span className="font-mono text-[10px] text-steel-400">{family.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}

function FilterChip({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active ? 'border-ink-900 bg-ink-900 text-porcelain' : 'border-line bg-paper text-ink-900 hover:border-ink-800',
      )}
    >
      {children}
    </Link>
  );
}
