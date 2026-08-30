import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/site/PageHeader';
import { FamilyBrowser } from '@/components/product/FamilyBrowser';
import { QuoteBand } from '@/components/home/sections';
import { getFamilyProducts, getNavFamilies, familyBySlug, FAMILY_LEDE, getFamilyContent } from '@/lib/catalogue';
import { FAMILIES } from '@/data/catalogue.seed';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';
import { CategoryContent, categoryFaqLd } from '@/components/product/CategoryContent';
import { ProductImage } from '@/components/ui/ProductImage';
import { publicFileExists } from '@/lib/assets';
import sharp from 'sharp';
import path from 'path';

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

  // the family's own artwork, by the /families/<slug>.webp convention
  const artwork = `/families/${family.slug}.webp`;
  const cover = publicFileExists(artwork) ? artwork : '';
  // wide photography fills the band; a portrait cut-out must not be cropped to a sliver
  let coverIsWide = false;
  if (cover) {
    try {
      const meta = await sharp(path.join(process.cwd(), 'public', artwork)).metadata();
      coverIsWide = (meta.width ?? 0) / (meta.height ?? 1) >= 1.2;
    } catch {
      // unreadable metadata: the contained layout is the safe default
    }
  }

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
      >
        {/* The category's own artwork. Wide photography can fill the band edge to edge, but most
            covers are portrait cut-outs — forcing those through object-cover showed a huge crop
            of one armrest, so they sit contained on a light well instead. */}
        {cover ? (
          <div
            className={
              coverIsWide
                ? 'relative aspect-[21/9] w-full overflow-hidden rounded-img border border-line bg-paper md:aspect-[24/7]'
                : 'relative h-56 w-full overflow-hidden rounded-img border border-line bg-paper md:h-64'
            }
          >
            <ProductImage
              src={cover}
              alt={`DecArt ${family.name}`}
              label={family.name}
              fit={coverIsWide ? 'cover' : 'contain'}
              sizes="(max-width: 1024px) 100vw, 1200px"
              imgClassName={coverIsWide ? undefined : 'p-4'}
            />
          </div>
        ) : null}
      </PageHeader>

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
