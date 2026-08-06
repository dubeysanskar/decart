import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SpecPlate } from '@/components/ui/SpecPlate';
import { publicFileExists } from '@/lib/assets';
import { PlaceholderImage } from '@/components/ui/ProductImage';
import { SITE } from '@/lib/site';

const TICKER = [
  'Director',
  'Executive',
  'Ergonomic Mesh',
  'Task',
  'Visitor',
  'Café',
  'Workstations',
  'Conference',
  'Storage',
];

/**
 * Showroom hero (§4.6-3) — a full-height ink.950 stage. The chair is lit by a single
 * blue spotlight and carries its nameplate like a tag on the showroom floor; the faint
 * hexagon grid is the only other decoration. Runs under the transparent header.
 */
export function Hero({
  heroImage = '/hero/home-chair.webp',
  heroCode = 'BONAI-HB',
  heroLabel = 'MESH · WITH HANGER',
  heroHref = '/products/mesh/bonai-hb',
}: {
  heroImage?: string;
  heroCode?: string;
  heroLabel?: string;
  heroHref?: string;
}) {
  const hasHero = publicFileExists(heroImage);

  return (
    <section data-hero className="dark-section relative flex min-h-[100svh] flex-col overflow-hidden bg-ink-950 text-porcelain">
      {/* stage dressing: hex grid + one spotlight aimed at the product */}
      <div aria-hidden className="hex-grid absolute inset-0" />
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 50% at 72% 42%, rgb(79 174 227 / 0.16), transparent)' }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: 'linear-gradient(to top, rgb(10 12 14 / 0.9), transparent)' }}
      />

      <div className="container-x relative grid flex-1 items-center gap-10 pb-12 pt-32 md:pt-36 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <div className="max-w-2xl">
          <p data-anim="up" className="font-mono text-[11px] uppercase tracking-[0.16em] text-decart-300">
            DecArt Industries · Faridabad · Since {SITE.established}
          </p>

          <h1 data-anim="clip" className="mt-6 font-display text-hero font-semibold text-porcelain">
            Seating a workday
            <br />
            can rest on.
          </h1>

          <p data-anim="up" className="mt-6 max-w-lg text-lg leading-relaxed text-steel-400">
            From director cabins to 500-seat floors — chairs, workstations and office furniture manufactured
            in-house and delivered pan-India.
          </p>

          <div data-anim="up" className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/products" size="lg" onDark>
              Explore products
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/quote" size="lg" variant="secondary" onDark>
              Get a quote
            </ButtonLink>
          </div>

          <ul data-anim="up" className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2">
            {['Since 2015', 'In-house manufacturing', 'Pan-India delivery'].map((item, i) => (
              <li key={item} className="flex items-center gap-3">
                {i > 0 ? (
                  <span
                    aria-hidden
                    className="inline-block h-[9px] w-[8px] bg-decart-500/70"
                    style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
                  />
                ) : null}
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel-400">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* the product on stage */}
        <div className="relative" data-parallax="0.05">
          <div data-anim="scale" className="relative mx-auto aspect-square w-full max-w-[580px]">
            {/* floor shadow grounds the cut-out on the stage */}
            <span
              aria-hidden
              className="absolute bottom-[4%] left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[100%] bg-black/60 blur-2xl"
            />
            {hasHero ? (
              <Image
                src={heroImage}
                alt={`DecArt ${heroCode} ergonomic mesh office chair`}
                fill
                priority
                sizes="(max-width: 1024px) 88vw, 580px"
                className="object-contain drop-shadow-[0_32px_48px_rgb(0_0_0/0.45)]"
              />
            ) : (
              <PlaceholderImage label="Hero photography" tone="dark" className="rounded-card" />
            )}

            {/* the nameplate, parked on the chair like a showroom tag */}
            <Link
              href={heroHref}
              aria-label={`View the ${heroCode}`}
              className="group absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-ink-900/85 py-2 pl-3 pr-4 backdrop-blur transition-colors hover:border-decart-500/60"
            >
              <SpecPlate code={heroCode} label={heroLabel} size="sm" onDark className="border-0 bg-transparent pl-6" />
              <ArrowUpRight aria-hidden className="h-4 w-4 text-steel-400 transition-colors group-hover:text-porcelain" />
            </Link>
          </div>
        </div>
      </div>

      {/* family ticker — quiet proof of range along the foot of the stage */}
      <div className="relative border-t border-white/10">
        <div className="container-x no-scrollbar flex items-center gap-7 overflow-x-auto py-4">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-decart-300">
            30 families
          </span>
          {TICKER.map((name) => (
            <span key={name} className="flex shrink-0 items-center gap-7">
              <span aria-hidden className="h-1 w-1 rounded-full bg-white/20" />
              <Link
                href="/products"
                className="text-sm font-medium text-steel-400 transition-colors hover:text-porcelain"
              >
                {name}
              </Link>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
