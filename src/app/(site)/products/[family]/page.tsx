import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/site/PageHeader';
import { FamilyBrowser } from '@/components/product/FamilyBrowser';
import { QuoteBand } from '@/components/home/sections';
import { getFamilyProducts, getNavFamilies, familyBySlug, FAMILY_LEDE, getFamilyContent } from '@/lib/catalogue';
import { FAMILIES } from '@/data/catalogue.seed';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';
import { CategoryContent, categoryFaqLd } from '@/components/product/CategoryContent';

export const revalidate = 3600;

export async function generateStaticParams() {
  return FAMILIES.filter((f) => !f.hidden).map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: { params: { family: string } }): Promise<Metadata> {
  const family = familyBySlug(params.family);
  if (!family) return {};
  // admin-authored SEO wins over the generated default when it has been filled in
  const content = await getFamilyContent(family.slug);
  return buildMetadata({
    // shape mirrors the reference site the client sent: benefit + category + manufacturer + brand
    title: content?.seoTitle || `Quality ${family.name} by Office Furniture Manufacturer DecArt`,
    description:
      content?.seoDescription ||
      `Explore DecArt's ${family.name.toLowerCase()} range. ${FAMILY_LEDE[family.slug] ?? ''} Built with durable materials and customisable for every workspace need, manufactured in Faridabad.`,
    path: `/products/${family.slug}`,
  });
}

export default async function FamilyPage({ params }: { params: { family: string } }) {
  const family = familyBySlug(params.family);
  if (!family) notFound();

  const [products, navFamilies, content] = await Promise.all([
    getFamilyProducts(family.slug),
    getNavFamilies(),
    getFamilyContent(family.slug),
  ]);
  const siblings = navFamilies.filter((f) => f.group === family.group && f.slug !== family.slug);

  const tags = [...new Set(products.flatMap((p) => p.tags ?? []))].sort();

  return (
    <>
      <PageHeader
        eyebrow={family.name}
        title={FAMILY_LEDE[family.slug] ?? family.name}
        lede={
          family.pages !== '—'
            ? `${products.length} models · catalogue pages ${family.pages}. Every unit is built to order in Faridabad — finish, mechanism and base to your specification.`
            : `Built to order in Faridabad — share the requirement and we will quote it.`
        }
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          { name: family.name },
        ]}
      />

      <FamilyBrowser products={products} familyName={family.name} tags={tags} />

      {/* client brief: descriptive copy + an FAQ under every category, both admin-editable */}
      <CategoryContent content={content} familyName={family.name} />

      {siblings.length ? (
        <section className="border-t border-line bg-porcelain py-12">
          <div className="container-x">
            <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">
              More in {family.group === 'seating' ? 'Office Seating' : family.group === 'tables-desks' ? 'Tables & Desks' : 'Furniture'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {siblings.map((sibling) => (
                <a
                  key={sibling.slug}
                  href={`/products/${sibling.slug}`}
                  className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-900 hover:border-decart-300 hover:text-decart-700"
                >
                  {sibling.name}
                  <span className="ml-2 font-mono text-[10px] text-steel-400">{sibling.count}</span>
                </a>
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
            [
              breadcrumbLd([
                { name: 'Home', path: '/' },
                { name: 'Products', path: '/products' },
                { name: family.name, path: `/products/${family.slug}` },
              ]),
              ...(content?.faq?.length ? [categoryFaqLd(content.faq)] : []),
            ],
          ),
        }}
      />
    </>
  );
}
