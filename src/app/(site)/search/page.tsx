import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { QuoteBand } from '@/components/home/sections';
import { getNavFamilies } from '@/lib/catalogue';
import { siteSearch, MIN_QUERY } from '@/lib/search';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Search — DecArt Furniture',
    description: 'Search 350+ printed models by code, name or type across thirty product families.',
    path: '/search',
  }),
  // a results page is not a landing page; the catalogue pages are what should rank
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = (searchParams.q ?? '').slice(0, 80);
  const [results, families] = await Promise.all([siteSearch(query), getNavFamilies()]);
  const familyName = (slug: string) => families.find((f) => f.slug === slug)?.name;

  return (
    <>
      <PageHeader
        size="compact"
        eyebrow="Search"
        title={query.trim() ? `Results for “${query.trim()}”` : 'Search the catalogue'}
        lede={
          query.trim()
            ? `${results.total} ${results.total === 1 ? 'match' : 'matches'} across models, categories, articles and projects.`
            : 'Search by model code, chair type or family — the code on a spec sheet is the fastest way in.'
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Search' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {/* a plain GET form: it works with JavaScript off, and the URL stays shareable */}
          <form action="/search" method="get" className="flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <SearchIcon
                aria-hidden
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400"
              />
              <input
                name="q"
                defaultValue={query}
                autoFocus={!query}
                placeholder="e.g. DS-701, high back mesh, conference table"
                aria-label="Search the catalogue"
                className="h-12 w-full rounded-2xl border border-line bg-paper pl-11 pr-4 text-base text-ink-900 placeholder:text-steel-400 focus:border-decart-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-12 shrink-0 rounded-2xl bg-ink-950 px-6 text-sm font-semibold text-porcelain transition-colors hover:bg-ink-900"
            >
              Search
            </button>
          </form>

          {!query.trim() ? (
            <div className="mt-10">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">Browse by category</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {families.map((family) => (
                  <Link
                    key={family.slug}
                    href={`/products/${family.slug}`}
                    className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-900 transition-colors hover:border-ink-800 hover:bg-porcelain"
                  >
                    {family.name}
                    <span className="ml-1.5 font-mono text-[10px] text-steel-400">{family.count}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : query.trim().length < MIN_QUERY ? (
            <p className="mt-8 text-sm text-steel-600">Type at least {MIN_QUERY} characters.</p>
          ) : !results.total ? (
            <EmptyState
              className="mt-10"
              title={`Nothing matched “${query.trim()}”`}
              body="We print 350+ models and not every one is online yet. Tell the sales desk what you are looking for — they have the full printed catalogue in front of them."
              action={
                <>
                  <ButtonLink href="/quote">Ask the sales desk</ButtonLink>
                  <ButtonLink href="/products" variant="secondary">
                    Browse everything
                  </ButtonLink>
                </>
              }
            />
          ) : (
            <div className="mt-10 flex flex-col gap-12">
              {results.families.length ? (
                <section>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">Categories</h2>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {results.families.map((family) => (
                      <Link
                        key={family.slug}
                        href={`/products/${family.slug}`}
                        className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium text-ink-900 transition-colors hover:border-ink-800 hover:bg-porcelain"
                      >
                        {family.name}
                        <span className="ml-1.5 font-mono text-[10px] text-steel-400">{family.count} models</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {results.products.length ? (
                <section>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">
                    Models ({results.products.length})
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {results.products.map(({ product }) => (
                      <ProductCard key={product.slug} product={product} familyName={familyName(product.family)} />
                    ))}
                  </div>
                </section>
              ) : null}

              {results.posts.length ? (
                <section>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">Articles</h2>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {results.posts.map((post) => (
                      <li key={post.slug}>
                        <Link href={`/blog/${post.slug}`} className="block py-4 hover:bg-porcelain">
                          <span className="block text-[0.9375rem] font-semibold text-ink-950">{post.title}</span>
                          {post.excerpt ? (
                            <span className="mt-1 block text-sm text-steel-600">{post.excerpt}</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {results.projects.length ? (
                <section>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-steel-400">Projects</h2>
                  <ul className="mt-4 divide-y divide-line border-y border-line">
                    {results.projects.map((project) => (
                      <li key={project.slug}>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 py-4 hover:bg-porcelain"
                        >
                          <span className="text-[0.9375rem] font-semibold text-ink-950">{project.title}</span>
                          <span className="text-sm text-steel-600">
                            {project.client}
                            {project.location ? ` · ${project.location}` : ''}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
