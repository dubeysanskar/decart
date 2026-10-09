import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { CatalogueHero } from '@/components/catalogue/CatalogueHero';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductImage } from '@/components/ui/ProductImage';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { QuoteBand } from '@/components/home/sections';
import { getCategoryProducts, getMaster, getTaxonomy, type CategoryNode } from '@/lib/taxonomy';
import type { CatalogueProduct } from '@/lib/catalogue';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { master: string } }): Promise<Metadata> {
  const master = await getMaster(params.master);
  if (!master) return {};
  return buildMetadata({
    title: `${master.name} — Office Furniture Categories | DecArt Furniture`,
    description:
      master.intro ||
      `${master.name} from DecArt Industries, Faridabad: ${master.categories
        .slice(0, 6)
        .map((c) => c.name)
        .join(', ')}. Built to order, delivered pan-India.`,
    path: `/categories/${master.slug}`,
    image: master.cover || undefined,
  });
}

/**
 * Up to `limit` photographed models, taken in turn from the master's fullest categories, so the
 * "popular" row shows the breadth of the range instead of eight chairs from one series.
 */
async function popularModels(categories: CategoryNode[], limit = 8): Promise<CatalogueProduct[]> {
  const ranked = [...categories].filter((c) => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);
  const lists = await Promise.all(
    ranked.map(async (c) => (await getCategoryProducts(c)).filter((p) => p.images?.length)),
  );
  const picked: CatalogueProduct[] = [];
  const seen = new Set<string>();
  for (let round = 0; picked.length < limit && lists.some((l) => l.length > round); round++) {
    for (const list of lists) {
      const product = list[round];
      if (product && !seen.has(product.slug) && picked.length < limit) {
        seen.add(product.slug);
        picked.push(product);
      }
    }
  }
  return picked;
}

export default async function MasterCategoryPage({ params }: { params: { master: string } }) {
  const [master, all] = await Promise.all([getMaster(params.master), getTaxonomy()]);
  if (!master) notFound();

  const index = all.findIndex((m) => m.slug === master.slug);
  const others = all.filter((m) => m.slug !== master.slug);
  const popular = await popularModels(master.categories);
  const stocked = master.categories.filter((c) => c.count > 0);
  const thumbs = [...stocked]
    .filter((c) => c.cover && c.cover !== master.cover)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <>
      <CatalogueHero
        eyebrow={`Master category · ${String(index + 1).padStart(2, '0')}`}
        title={master.name}
        lede={
          master.intro ||
          `${master.categories.map((c) => c.name).slice(0, 4).join(', ')}${
            master.categories.length > 4 ? ' and more' : ''
          } — every piece manufactured in our own Faridabad factory, finish and size to your specification.`
        }
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          { name: master.name },
        ]}
        cover={master.cover}
        stats={[
          { value: String(master.categories.length), label: 'Categories' },
          { value: master.count ? `${master.count}+` : '—', label: 'Models online' },
          { value: 'Pan-India', label: 'Delivery' },
        ]}
        thumbs={thumbs}
      />

      <CatalogueNav masters={all} activeMaster={master.slug} />

      {/* ------------------------------------------------------------- the categories */}
      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading
            index="01"
            eyebrow={master.name}
            title="Shop by category"
            lede={`${master.categories.length} categories${
              stocked.length < master.categories.length
                ? ` — ${master.categories.length - stocked.length} of them built to order on request`
                : ''
            }.`}
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-stagger="0.05">
            {master.categories.map((category, i) => (
              <Link
                key={category.slug}
                href={category.href}
                data-anim="rise"
                className="group flex overflow-hidden rounded-card bg-paper ring-1 ring-line transition-all duration-300 hover:-translate-y-1 hover:ring-decart-300 hover:shadow-[0_22px_38px_-24px_rgb(15_19_23/0.35)]"
              >
                <div className="relative w-[42%] shrink-0 bg-porcelain">
                  {category.cover ? (
                    <ProductImage
                      src={category.cover}
                      alt={`DecArt ${category.name}`}
                      label={category.name}
                      priority={i < 3}
                      sizes="(max-width: 640px) 40vw, 180px"
                      imgClassName="p-3 transition-transform duration-500 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div aria-hidden className="flex h-full min-h-[148px] items-center justify-center bg-gradient-to-br from-porcelain to-decart-50">
                      <span className="font-display text-4xl font-semibold text-decart-600/25">
                        {category.name
                          .split(/[\s/&-]+/)
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join('')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4 md:p-5">
                  <h3 className="text-base font-semibold leading-snug text-ink-950 group-hover:text-decart-700">
                    {category.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                    {category.count > 0 ? `${category.count} models` : 'Made to order'}
                  </p>
                  {category.series.length ? (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-steel-600">
                      {category.series.map((s) => s.name).join(' · ')}
                    </p>
                  ) : (
                    <p className="mt-3 text-xs leading-relaxed text-steel-600">Send a size and quantity — we quote it.</p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-decart-700">
                    {category.count > 0 ? 'Explore' : 'Get a quote'}
                    <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- popular models */}
      {popular.length ? (
        <section className="section border-t border-line bg-porcelain">
          <div className="container-x">
            <SectionHeading
              index="02"
              eyebrow="Photographed range"
              title={`Popular in ${master.name}`}
              action={
                stocked[0] ? (
                  <ButtonLink href={[...stocked].sort((a, b) => b.count - a.count)[0].href} variant="secondary">
                    See more
                  </ButtonLink>
                ) : undefined
              }
            />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {popular.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------- other masters */}
      {others.length ? (
        <section className="section bg-paper">
          <div className="container-x">
            <SectionHeading index={popular.length ? '03' : '02'} eyebrow="Keep browsing" title="Other master categories" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={other.href}
                  className="group relative overflow-hidden rounded-card bg-porcelain ring-1 ring-line transition hover:ring-decart-300"
                >
                  <div className="relative aspect-square">
                    {other.cover ? (
                      <ProductImage
                        src={other.cover}
                        alt={`DecArt ${other.name}`}
                        label={other.name}
                        sizes="(max-width: 768px) 46vw, 220px"
                        imgClassName="p-6 transition-transform duration-500 group-hover:scale-[1.06]"
                      />
                    ) : null}
                  </div>
                  <div className={cn('flex items-center justify-between gap-2 border-t border-line bg-paper px-4 py-3')}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-950">{other.name}</span>
                      <span className="font-mono text-[10px] text-steel-400">{other.categories.length} categories</span>
                    </span>
                    <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-steel-400 group-hover:text-decart-700" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <QuoteBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: master.name, path: master.href },
            ]),
          ),
        }}
      />
    </>
  );
}
