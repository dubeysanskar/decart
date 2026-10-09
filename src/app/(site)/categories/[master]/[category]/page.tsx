import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogueHero } from '@/components/catalogue/CatalogueHero';
import { CatalogueNav } from '@/components/catalogue/CatalogueNav';
import { FamilyBrowser } from '@/components/product/FamilyBrowser';
import { QuoteBand } from '@/components/home/sections';
import { ButtonLink } from '@/components/ui/Button';
import { getCategory, getCategoryProducts, getTaxonomy } from '@/lib/taxonomy';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { master: string; category: string };
}): Promise<Metadata> {
  const found = await getCategory(params.master, params.category);
  if (!found) return {};
  const { master, category } = found;

  return {
    ...buildMetadata({
      title: `Quality ${category.name} by Office Furniture Manufacturer DecArt`,
      description:
        category.intro ||
        `${category.name} in ${master.name} from DecArt Industries, Faridabad. ${
          category.count ? `${category.count} models, ` : ''
        }built to order, delivered pan-India.`,
      path: `/categories/${master.slug}/${category.slug}`,
      image: category.cover || undefined,
    }),
    // a range with no model online is a made-to-order page, not something to put in a search index
    ...(category.count === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CategoryPage({ params }: { params: { master: string; category: string } }) {
  const [found, all] = await Promise.all([getCategory(params.master, params.category), getTaxonomy()]);
  if (!found) notFound();
  const { master, category } = found;

  const products = await getCategoryProducts(category);
  const tags = [...new Set(products.flatMap((p) => p.tags ?? []))].sort();
  // a card in a category says which series it came from, not the category's own name
  const seriesNames = Object.fromEntries(category.series.map((s) => [s.slug, s.name]));

  return (
    <>
      <CatalogueHero
        eyebrow={master.name}
        title={category.name}
        lede={
          category.intro ||
          (products.length
            ? `${products.length} models${
                category.series.length > 1 ? ` across ${category.series.length} series` : ''
              }, every one built to order in Faridabad — finish, mechanism and base to your specification.`
            : 'Built to order in Faridabad. Tell us the specification and quantity and we will quote it — this range is not on the website yet.')
        }
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          { name: master.name, href: master.href },
          { name: category.name },
        ]}
        cover={category.cover}
        stats={[
          { value: products.length ? String(products.length) : '—', label: 'Models online' },
          { value: category.series.length ? String(category.series.length) : 'Custom', label: 'Series' },
          { value: 'Faridabad', label: 'Made in' },
        ]}
      >
        {category.series.length > 1 ? (
          <div>
            <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-steel-600">Series in this category</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {category.series.map((series) => (
                <Link
                  key={series.slug}
                  href={`/products/${series.slug}`}
                  className="rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-medium text-steel-600 hover:border-decart-300 hover:text-decart-700"
                >
                  {series.name}
                  <span className="ml-1.5 font-mono text-[10px] text-steel-400">{series.count}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </CatalogueHero>

      <CatalogueNav masters={all} activeMaster={master.slug} activeCategory={category.slug} />

      {products.length ? (
        <FamilyBrowser products={products} familyName={category.name} tags={tags} seriesNames={seriesNames} />
      ) : (
        <section className="section bg-paper">
          <div className="container-x">
            <div className="rounded-card border border-dashed border-line bg-porcelain p-10 text-center">
              <h2 className="font-display text-2xl text-ink-950">Made to order</h2>
              <p className="mx-auto mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-steel-600">
                {category.name} is built to order in our Faridabad factory, but the range is not listed online yet.
                Send the size, material and quantity and we will quote it — usually the same working day.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/quote?type=custom">Request a quote</ButtonLink>
                <ButtonLink href="/contact" variant="secondary">
                  Talk to the sales desk
                </ButtonLink>
              </div>
            </div>
          </div>
        </section>
      )}

      <QuoteBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: master.name, path: master.href },
              { name: category.name, path: category.href },
            ]),
          ),
        }}
      />
    </>
  );
}
