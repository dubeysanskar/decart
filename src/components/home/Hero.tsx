import Link from 'next/link';
import { ArrowRight, PersonStanding, Wind, SlidersHorizontal, Gem, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { HeroCategorySlider, type HeroCategory } from './HeroCategorySlider';
import { HeroBanners, type HeroBanner } from './HeroBanners';

/**
 * "Smart seating" hero — the founder's campaign banner rebuilt as a live page.
 * Airy blue-white gradient stage, a heavy two-tone uppercase headline, thin-line
 * feature icons, and the real colourway photography standing on white podiums.
 */

const FEATURES = [
  { icon: PersonStanding, label: 'Ergonomic design' },
  { icon: Wind, label: 'Breathable mesh' },
  { icon: SlidersHorizontal, label: 'Adjustable comfort' },
  { icon: Gem, label: 'Durable & stylish' },
];

const MARKETPLACES = ['GeM', 'Flipkart', 'Amazon', 'IndiaMART', 'TradeIndia'];

export function Hero({
  categories,
  banners = [],
}: {
  categories: HeroCategory[];
  banners?: HeroBanner[];
}) {
  const hasBanners = banners.some((banner) => banner.image);

  return (
    <section data-hero className="relative overflow-hidden pt-24 sm:pt-28">
      {/* banners from /admin/banners take the stage when the client has published any;
          otherwise the campaign gradient stands in */}
      {hasBanners ? (
        <HeroBanners banners={banners} />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(128deg, #D2E8F8 0%, #E8F4FB 40%, #FFFFFF 74%), radial-gradient(46% 44% at 84% 8%, rgb(61 159 224 / 0.22), transparent), radial-gradient(40% 36% at 4% 92%, rgb(61 159 224 / 0.14), transparent)',
            backgroundBlendMode: 'multiply',
          }}
        />
      )}
      {hasBanners ? null : (
        <>
          {/* the drifting orbs belong to the gradient treatment; over a photograph they muddy it */}
          <span
            aria-hidden
            data-float="14"
            className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-decart-300/25 blur-3xl"
          />
          <span
            aria-hidden
            data-float="9"
            className="pointer-events-none absolute right-1/3 top-1/2 h-52 w-52 rounded-full bg-decart-500/10 blur-3xl"
          />
        </>
      )}

      <div className="container-x relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          {/* ---------------------------------------------------------- copy
              min-w-0: grid items default to min-width:auto and refuse to shrink below their
              content, so without this the rail beside it drags this whole column past the
              viewport and the headline, copy and buttons get clipped on a phone. */}
          <div className="min-w-0 pb-2 lg:pb-10">
            {/* each line wipes in on its own, so the lockup reads top-to-bottom */}
            <h1 className="font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-bold uppercase leading-[1.04] tracking-tight">
              <span data-anim="mask" className="block text-ink-950">
                Smart seating
              </span>
              <span data-anim="mask" className="block text-decart-600">
                for every space.
              </span>
            </h1>

            <span aria-hidden data-anim="up" className="mt-5 block h-1 w-16 rounded-full bg-decart-500" />

            <p data-anim="up" className="mt-5 max-w-lg text-lg leading-relaxed text-steel-600">
              Ergonomic. Stylish. Built for comfort — 350+ models across seating, desking and institutional
              furniture, manufactured in-house and delivered pan-India.
            </p>

            {/* full-width taps on a phone, inline pills from sm up */}
            <div data-anim="up" className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href="/products" size="lg" className="w-full sm:w-auto">
                Explore products
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/quote" size="lg" variant="secondary" className="w-full sm:w-auto">
                Get a quote
              </ButtonLink>
              <a
                href={SITE.phoneHref}
                data-call
                className="inline-flex h-12 items-center justify-center gap-2 rounded-btn px-4 font-mono text-sm text-ink-900 transition-colors hover:bg-paper sm:h-[52px] sm:justify-start"
              >
                <Phone aria-hidden className="h-4 w-4 text-decart-600" />
                {SITE.phone}
              </a>
            </div>

            {/* thin-line feature icons, straight off the banner — 2-up on a phone so the
                labels get room to breathe, 4-up once there is width for them */}
            <ul
              data-stagger="0.09"
              className="mt-8 grid max-w-md grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-3"
            >
              {FEATURES.map((feature) => (
                <li
                  key={feature.label}
                  data-anim="rise"
                  className="group flex flex-col items-center gap-2.5 text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-decart-300 bg-paper/70 text-decart-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-decart-500 group-hover:bg-paper group-hover:shadow-pop sm:h-14 sm:w-14">
                    <feature.icon aria-hidden className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
                  </span>
                  <span className="text-xs leading-snug text-steel-600">{feature.label}</span>
                </li>
              ))}
            </ul>

            {/* proof, in the hero rather than only in the band below it */}
            <dl data-stagger="0.08" className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-line/70 pt-5">
              {SITE.counters.map((counter) => {
                const numeric = /^(\d+)(.*)$/.exec(counter.value);
                return (
                  <div key={counter.label} data-anim="up" className="min-w-0">
                    <dt className="font-display text-2xl font-semibold text-ink-950">
                      {numeric ? (
                        <span data-count={numeric[1]} data-count-suffix={numeric[2]}>
                          0{numeric[2]}
                        </span>
                      ) : (
                        counter.value
                      )}
                    </dt>
                    <dd className="mt-0.5 text-xs text-steel-600">{counter.label}</dd>
                  </div>
                );
              })}
            </dl>
          </div>

          {/* ------------------------------------------------- category slider */}
          <div className="relative min-w-0">
            <div data-anim="up" className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-700">
                Shop by category
              </p>
              <Link
                href="/products"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-900 transition-colors hover:text-decart-700"
              >
                All 30 categories
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
            <HeroCategorySlider categories={categories} />
          </div>
        </div>
      </div>

      {/* the banner bar takes the foot of the hero when banners are running, so the tagline
          only appears on the plain gradient version — otherwise the two overlap */}
      {hasBanners ? (
        <div aria-hidden className="h-[88px] md:h-[72px]" />
      ) : (
        <div className="relative border-t border-line bg-paper/70 backdrop-blur">
          <div className="container-x py-4">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-steel-400 md:text-left">
              Comfort that keeps you ahead
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * "Available on" marketplace strip. The client asked for this at the foot of the page rather
 * than under the hero, so it ships as its own section and the home page places it near the end.
 */
export function MarketplaceStrip() {
  return (
    <section className="border-y border-line bg-porcelain py-10">
      <div className="container-x flex flex-col items-center gap-6">
        <span className="rounded-full bg-decart-700 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          Available on
        </span>
        <div className="no-scrollbar flex w-full min-w-0 items-center justify-start gap-8 overflow-x-auto md:justify-center">
          {MARKETPLACES.map((name) => (
            <span key={name} className="shrink-0 text-base font-semibold text-steel-600 md:text-lg">
              {name}
            </span>
          ))}
        </div>
        <p className="text-center text-sm text-steel-600">
          Buy single pieces through our marketplace listings, or talk to us directly for project quantities.
        </p>
      </div>
    </section>
  );
}
