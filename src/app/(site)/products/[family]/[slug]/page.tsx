import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Phone, Download, ArrowRight } from 'lucide-react';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { StickyActionBar } from '@/components/product/StickyActionBar';
import { ReviewsBlock, Stars } from '@/components/product/Reviews';
import { Accordion } from '@/components/ui/Accordion';
import { SpecPlate } from '@/components/ui/SpecPlate';
import { ButtonLink } from '@/components/ui/Button';
import { Breadcrumbs } from '@/components/ui/bits';
import { Eyebrow } from '@/components/ui/typography';
import { QuoteBand } from '@/components/home/sections';
import { getProduct, getRelated, getApprovedReviews, familyBySlug } from '@/lib/catalogue';
import { allSeedProducts } from '@/data/catalogue.seed';
import { BUILD_OPTIONS, FINISHES } from '@/data/specs';
import { SITE, COPY } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { buildMetadata, productLd, breadcrumbLd } from '@/lib/seo';
import { publicFileExists } from '@/lib/assets';

export const revalidate = 3600;
const LEATHER = new Set(['director', 'ceo', 'executive', 'imported']);

export async function generateStaticParams() {
  // pre-render the photographed range; the long tail renders on demand and is then cached
  return allSeedProducts()
    .filter((p) => p.images.length > 0)
    .map((p) => ({ family: p.family, slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return {};
  const family = familyBySlug(product.family);
  return buildMetadata({
    title: product.seo?.title || `${product.name} (${product.code}) — ${family?.name ?? ''} | DecArt`,
    description: product.seo?.description || product.summary,
    path: `/products/${product.family}/${product.slug}`,
    image: product.images?.[0]?.src || '/brand/og-default.jpg',
  });
}

export default async function ProductPage({ params }: { params: { family: string; slug: string } }) {
  const product = await getProduct(params.slug);
  if (!product || product.family !== params.family) notFound();

  const family = familyBySlug(product.family);
  const [related, reviews] = await Promise.all([getRelated(product), getApprovedReviews(product.slug)]);

  const url = `${SITE.url}/products/${product.family}/${product.slug}`;
  const waHref = waLink(WA.product(product.name, product.code, url));
  const quoteHref = `/quote?type=quote&product=${product.slug}&code=${encodeURIComponent(product.code)}`;
  const isSeating = product.group === 'seating';
  const specSheet = `/downloads/${product.slug}-spec-sheet.pdf`;
  const hasSpecSheet = publicFileExists(specSheet);

  const topSpecs = (product.specs ?? []).slice(0, 4);
  const ratingAvg = product.ratingAvg ?? 0;
  const ratingCount = product.ratingCount ?? 0;

  const accordion = [
    {
      id: 'specs',
      title: 'Full specifications',
      content: (
        <dl className="divide-y divide-line">
          {(product.specs ?? []).map((spec) => (
            <div key={spec.label} className="grid grid-cols-[minmax(110px,32%)_1fr] gap-4 py-2.5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.08em] text-steel-600">{spec.label}</dt>
              <dd className="text-sm text-ink-900">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    isSeating
      ? {
          id: 'build',
          title: 'Build options',
          content: (
            <div className="space-y-4">
              {BUILD_OPTIONS.map((group) => (
                <div key={group.label}>
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-steel-600">{group.label}</p>
                  <p className="mt-1 text-sm text-ink-900">{group.options.join(' · ')}</p>
                </div>
              ))}
              <p className="text-xs text-steel-600">
                Castors and gas lifts are BIFMA/SGS-tested. Specify at order — options are priced into your quote.
              </p>
            </div>
          ),
        }
      : {
          id: 'finishes',
          title: 'Finishes & legs',
          content: (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-steel-600">Laminates</p>
                <p className="mt-1 text-sm text-ink-900">{FINISHES.laminates.join(' · ')}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-steel-600">Powder coats</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FINISHES.powderCoats.map((coat) => (
                    <span key={coat.name} className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs">
                      <span className="h-3.5 w-3.5 rounded-full border border-line" style={{ background: coat.hex }} />
                      {coat.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ),
        },
    product.sizeMm
      ? {
          id: 'size',
          title: 'Size',
          content: (
            <p className="font-mono text-sm uppercase tracking-[0.08em] text-ink-900">
              {product.sizeMm} mm <span className="text-steel-600">(W × D × H)</span>
            </p>
          ),
        }
      : null,
    { id: 'warranty', title: 'Warranty & delivery', content: <p>{COPY.warranty}</p> },
  ].filter(Boolean) as { id: string; title: string; content: React.ReactNode }[];

  return (
    <>
      <div className="border-b border-line bg-porcelain pb-8 pt-24 md:pt-32">
        <div className="container-x">
          <Breadcrumbs
            items={[
              { name: 'Home', href: '/' },
              { name: 'Products', href: '/products' },
              { name: family?.name ?? product.family, href: `/products/${product.family}` },
              { name: product.code },
            ]}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <ProductGallery
              images={product.images ?? []}
              colourways={product.colourways ?? []}
              name={product.name}
              code={product.code}
            />

            <div className="min-w-0">
              <Eyebrow>{family?.name ?? product.family}</Eyebrow>
              <h1 className="mt-3 font-display text-h2 text-ink-950">{product.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SpecPlate
                  code={product.code}
                  label={family?.name}
                  size="lg"
                  cognac={LEATHER.has(product.family)}
                />
                {ratingCount > 0 ? (
                  <Link href="#reviews" className="flex items-center gap-2 text-sm text-steel-600 hover:text-ink-900">
                    <Stars value={ratingAvg} />
                    <span className="font-mono text-xs">
                      {ratingAvg.toFixed(1)} · {ratingCount}
                    </span>
                  </Link>
                ) : null}
              </div>

              {product.summary ? <p className="mt-5 text-lg leading-relaxed text-steel-600">{product.summary}</p> : null}

              <div className="mt-6 rounded-card border border-line bg-paper p-4">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-steel-600">Price</p>
                <p className="mt-1 text-lg font-semibold text-ink-950">
                  {product.price?.show && product.price.amount
                    ? `₹${product.price.amount.toLocaleString('en-IN')}`
                    : 'Price on request'}
                </p>
                <p className="mt-1 text-xs text-steel-600">
                  B2B pricing depends on quantity, finish and freight — usually quoted the same day.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ButtonLink href={quoteHref} size="lg">
                  Get a quote
                </ButtonLink>
                <ButtonLink href={waHref} size="lg" variant="whatsapp" data-wa="pdp">
                  WhatsApp this model
                </ButtonLink>
                <ButtonLink href={SITE.phoneHref} size="lg" variant="secondary" className="font-mono text-sm">
                  <Phone aria-hidden className="h-4 w-4" />
                  {SITE.phone}
                </ButtonLink>
              </div>

              {topSpecs.length ? (
                <dl className="mt-8 grid grid-cols-2 gap-4">
                  {topSpecs.map((spec) => (
                    <div key={spec.label} className="rounded-card border border-line bg-paper p-3.5">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-steel-600">{spec.label}</dt>
                      <dd className="mt-1 text-sm leading-snug text-ink-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              <Accordion items={accordion} defaultOpen="specs" className="mt-8" />

              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <Link href="/downloads" className="inline-flex items-center gap-2 font-semibold text-decart-700 hover:underline">
                  <Download aria-hidden className="h-4 w-4" />
                  Download the catalogue
                </Link>
                {hasSpecSheet ? (
                  <a
                    href={specSheet}
                    className="inline-flex items-center gap-2 font-semibold text-decart-700 hover:underline"
                  >
                    <Download aria-hidden className="h-4 w-4" />
                    {product.code} spec sheet
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section bg-paper">
        <div className="container-x grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-display text-h3 text-ink-950">About this model</h2>
            <div className="prose-decart mt-5 max-w-prose">
              {product.description.split('\n\n').map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>

            <div className="mt-12">
              <ReviewsBlock
                productSlug={product.slug}
                reviews={reviews as never}
                ratingAvg={ratingAvg}
                ratingCount={ratingCount}
              />
            </div>
          </div>

          <aside className="lg:pl-6">
            <div className="rounded-card border border-line bg-porcelain p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl text-ink-950">Need this for a floor?</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel-600">
                Send quantities, finish and the site city — we come back with a working quote, usually the same day.
              </p>
              <ButtonLink href={quoteHref} className="mt-5 w-full">
                Request a quote
              </ButtonLink>
              <ButtonLink href={`/quote?type=bulk&product=${product.slug}`} variant="secondary" className="mt-3 w-full">
                Bulk / project enquiry
              </ButtonLink>
              <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">MOQ</dt>
                  <dd className="text-ink-900">{product.moq && product.moq > 1 ? `${product.moq} units` : 'Single piece'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-steel-600">Delivery</dt>
                  <dd className="text-ink-900">Pan-India</dd>
                </div>
                {product.cataloguePage ? (
                  <div className="flex justify-between gap-3">
                    <dt className="text-steel-600">Catalogue</dt>
                    <dd className="font-mono text-xs text-ink-900">p. {product.cataloguePage}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      {related.length ? (
        <section className="section border-t border-line bg-porcelain">
          <div className="container-x">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-h3 text-ink-950">More from {family?.name}</h2>
              <Link
                href={`/products/${product.family}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-decart-700 hover:underline"
              >
                View the family
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {related.slice(0, 4).map((item) => (
                <ProductCard key={item.slug} product={item} familyName={family?.name} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <QuoteBand />
      <StickyActionBar waHref={waHref} quoteHref={quoteHref} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productLd({
              name: product.name,
              code: product.code,
              slug: product.slug,
              family: product.family,
              description: product.description,
              image: product.images?.[0]?.src,
              ratingAvg,
              ratingCount,
            }),
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: family?.name ?? product.family, path: `/products/${product.family}` },
              { name: product.name, path: `/products/${product.family}/${product.slug}` },
            ]),
          ]),
        }}
      />
    </>
  );
}
