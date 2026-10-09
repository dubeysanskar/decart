import type { ReactNode } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/bits';
import { Eyebrow } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { SITE } from '@/lib/site';

export type HeroStat = { value: string; label: string };
export type HeroThumb = { name: string; href: string; cover: string };

/**
 * The opener for a master category or a category.
 *
 * The picture on the right is the one set in admin → Categories (or the automatic one until
 * somebody sets it), so changing it there visibly changes this page — not just a tile elsewhere.
 */
export function CatalogueHero({
  eyebrow,
  title,
  lede,
  breadcrumbs,
  cover,
  stats,
  thumbs = [],
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  breadcrumbs: { name: string; href?: string }[];
  cover: string;
  stats: HeroStat[];
  thumbs?: HeroThumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-porcelain pb-10 pt-24 md:pb-14 md:pt-32">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgb(88 181 224 / 0.16), transparent)' }}
      />
      <div className="container-x relative">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-6 grid items-center gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          <div className="min-w-0">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-3 font-display text-h1 text-ink-950">{title}</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-steel-600">{lede}</p>

            <dl className="mt-7 grid max-w-lg grid-cols-3 divide-x divide-line rounded-card border border-line bg-paper">
              {stats.map((stat) => (
                <div key={stat.label} className="flex min-w-0 flex-col-reverse px-3 py-3 sm:px-4 sm:py-3.5">
                  <dt className="mt-0.5 text-[11px] text-steel-600">{stat.label}</dt>
                  <dd className="whitespace-nowrap font-display text-base font-semibold text-ink-950 sm:text-xl md:text-2xl">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <ButtonLink href="/quote">Request a quote</ButtonLink>
              <ButtonLink href={SITE.catalogueHref} variant="secondary" target="_blank" rel="noopener noreferrer">
                <Download aria-hidden className="h-4 w-4" />
                Brochure
              </ButtonLink>
            </div>

            {children ? <div className="mt-8">{children}</div> : null}
          </div>

          <div className="min-w-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] sm:aspect-[5/4] sm:rounded-[28px] bg-paper shadow-[0_30px_60px_-36px_rgb(15_19_23/0.35)] ring-1 ring-line">
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ background: 'radial-gradient(55% 50% at 50% 48%, rgb(88 181 224 / 0.12), transparent 72%)' }}
              />
              {cover ? (
                <ProductImage
                  src={cover}
                  alt={`DecArt ${title}`}
                  label={title}
                  priority
                  sizes="(max-width: 1024px) 92vw, 520px"
                  imgClassName="p-5 sm:p-8 md:p-10"
                />
              ) : (
                <div aria-hidden className="flex h-full items-center justify-center bg-gradient-to-br from-porcelain to-decart-50">
                  <span className="font-display text-8xl font-semibold text-decart-600/20">{title.slice(0, 1)}</span>
                </div>
              )}
              <span
                aria-hidden
                className="absolute bottom-7 left-1/2 h-3 w-1/2 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-lg"
              />
            </div>

            {thumbs.length ? (
              <ul className="mt-3 hidden grid-cols-3 gap-3 sm:grid">
                {thumbs.slice(0, 3).map((thumb) => (
                  <li key={thumb.href}>
                    <Link
                      href={thumb.href}
                      className="group flex items-center gap-2.5 rounded-2xl bg-paper p-2 ring-1 ring-line transition hover:ring-decart-300"
                    >
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-porcelain">
                        {thumb.cover ? (
                          <ProductImage src={thumb.cover} alt="" label={thumb.name} sizes="44px" imgClassName="p-1" />
                        ) : null}
                      </span>
                      <span className="line-clamp-2 text-xs font-semibold leading-snug text-ink-900 group-hover:text-decart-700">
                        {thumb.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
