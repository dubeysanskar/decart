import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { MasterDirectory } from '@/components/catalogue/MasterDirectory';
import { QuoteBand } from '@/components/home/sections';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { getAllProducts, getNavFamilies, GROUPS } from '@/lib/catalogue';
import { getPageHero } from '@/lib/content';
import { getTaxonomy } from '@/lib/taxonomy';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'All Products — Office Chairs, Desks & Furniture',
  description:
    'The full DecArt catalogue: 350+ models by master category — seating, tables, storage, sofas and loungers, institutional and health care furniture, built in our Faridabad factory.',
  path: '/products',
});

type Search = { view?: string };

export default async function ProductsPage({ searchParams }: { searchParams: Search }) {
  const [families, products, hero, masters] = await Promise.all([
    getNavFamilies(),
    getAllProducts(),
    getPageHero('products'),
    getTaxonomy(),
  ]);

  const categoryCount = masters.reduce((sum, m) => sum + m.categories.length, 0);

  /**
   * The catalogue holds 540+ printed model codes but only the photographed range has imagery.
   * Showing every code by default fills the grid with placeholders and reads as broken, so the
   * default view is "photographed" and the full printed list is one click away.
   */
  const showAll = searchParams.view === 'all';
  const visible = products.filter((p) => showAll || p.images?.length);
  const photographed = products.filter((p) => p.images?.length).length;
  const ordered = [...visible].sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0));
  const familyName = (slug: string) => families.find((f) => f.slug === slug)?.name;

  return (
    <>
      <PageHeader
        eyebrow={hero?.eyebrow || 'Catalogue'}
        title={hero?.title || 'Every model we make'}
        lede={
          hero?.subtitle ||
          `${masters.length} master categories, ${categoryCount} categories, 350+ printed models and a growing set shot in our own studio. Prices are quoted per requirement — send us quantities and a site city.`
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Products' }]}
      >
        {/* straight to a master category — the same six places the menu opens onto */}
        <div className="flex flex-wrap gap-2">
          {masters.map((master) => (
            <Link
              key={master.slug}
              href={master.href}
              className="rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:border-ink-800"
            >
              {master.name}
            </Link>
          ))}
        </div>
      </PageHeader>

      {/* master category -> category, the structure the catalogue is organised by */}
      <section className="bg-paper pt-10 md:pt-14">
        <div className="container-x">
          <h2 className="font-display text-h3 text-ink-950">Browse by category</h2>
          <p className="mt-2 max-w-2xl text-[0.9375rem] text-steel-600">
            Start with the kind of furniture, then narrow to the category. Ranges marked <em>Made to order</em> are
            built in our factory but not listed online yet — send the specification and we will quote it.
          </p>
        </div>
        <div className="mt-6">
          <MasterDirectory masters={masters} />
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container-x">
          <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="font-display text-h3 text-ink-950">{showAll ? 'Every model code' : 'Models we have photographed'}</h2>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-steel-600">
                {ordered.length} models
              </p>
            </div>
            <Link href="/downloads" className="text-sm font-semibold text-decart-700 hover:underline">
              Download the full catalogue (PDF) →
            </Link>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3 rounded-btn border border-line bg-paper p-3">
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
              title="No models to show"
              body="Tell us what you need — custom builds are our daily work."
              action={<ButtonLink href="/quote?type=custom">Request a custom build</ButtonLink>}
            />
          )}

          {ordered.length > 96 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-steel-600">
                Showing the first 96 of {ordered.length}. Browse a category for the complete list.
              </p>
            </div>
          ) : null}

          {/* the product lines themselves: a category is a view over these, so each is still a page */}
          <div className="mt-14 border-t border-line pt-10">
            <h2 className="font-display text-h3 text-ink-950">Browse by series</h2>
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
