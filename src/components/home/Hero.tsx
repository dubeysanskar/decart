'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  PersonStanding,
  Wind,
  SlidersHorizontal,
  Gem,
  Phone,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { LeadForm } from '@/components/forms/LeadForm';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

export type HeroBanner = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel?: string;
};

/**
 * "Smart seating" hero — the founder's campaign banner rebuilt as a live page.
 *
 * With banners published in /admin/banners the hero becomes a real slide carousel: the
 * photograph, the headline, the supporting line and the button all change together (client:
 * "hero ka pura slider with content badalna chahiye, abhi sirf background ki image change ho
 * rahi hai"). With no banners it falls back to the static campaign lockup.
 */

const FEATURES = [
  { icon: PersonStanding, label: 'Ergonomic design' },
  { icon: Wind, label: 'Breathable mesh' },
  { icon: SlidersHorizontal, label: 'Adjustable comfort' },
  { icon: Gem, label: 'Durable & stylish' },
];

const MARKETPLACES = ['GeM', 'Flipkart', 'Amazon', 'IndiaMART', 'TradeIndia'];

const SLIDE_MS = 6500;

/**
 * The campaign headline is two-tone, so a banner title can be split the same way: put a "|"
 * (or an em dash) in the title and everything after it picks up the accent colour.
 */
function splitTitle(title: string): [string, string] {
  const parts = title.split(/\s*\|\s*|\s+—\s+/);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' — ')];
  return [title, ''];
}

export function Hero({ banners = [] }: { banners?: HeroBanner[] }) {
  const slides = banners.filter((banner) => banner.image && banner.title);
  const hasBanners = slides.length > 0;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  const active = hasBanners ? slides[index] : null;
  const [headline, accent] = active ? splitTitle(active.title) : ['Smart seating', 'for every space.'];


  return (
    <section data-hero className="relative overflow-hidden pt-24 sm:pt-28">
      {hasBanners ? (
        // crossfaded and never unmounted, so there is no flash between slides
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {slides.map((banner, i) => (
            <Image
              key={banner._id}
              src={banner.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                'object-cover transition-opacity duration-[1200ms] ease-out',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}

          {/* The veil is shaped around the text, not spread evenly, so the photograph reads as a
              photograph. It stays near-opaque across the copy column because the subtitle is
              steel-600 (#5B6B7A) and needs a background luminance of about 0.82 to clear 4.5:1,
              then falls away fast over the half of the frame that carries no text. On a phone the
              copy runs full width, so the thinning happens above and below it instead. */}
          <span
            className="absolute inset-0 md:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgb(255 255 255 / 0.32) 0%, rgb(255 255 255 / 0.72) 9%, rgb(255 255 255 / 0.92) 17%, rgb(255 255 255 / 0.92) 76%, rgb(255 255 255 / 0.60) 92%, rgb(255 255 255 / 0.34) 100%)',
            }}
          />
          <span
            className="absolute inset-0 hidden md:block"
            style={{
              background:
                'linear-gradient(100deg, rgb(255 255 255 / 0.96) 0%, rgb(255 255 255 / 0.92) 33%, rgb(255 255 255 / 0.48) 50%, rgb(255 255 255 / 0.14) 72%, rgb(255 255 255 / 0.04) 100%)',
            }}
          />
        </div>
      ) : (
        <>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(128deg, #D2E8F8 0%, #E8F4FB 40%, #FFFFFF 74%), radial-gradient(46% 44% at 84% 8%, rgb(61 159 224 / 0.22), transparent), radial-gradient(40% 36% at 4% 92%, rgb(61 159 224 / 0.14), transparent)',
              backgroundBlendMode: 'multiply',
            }}
          />
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
          <div
            className="min-w-0 pb-2 lg:pb-10"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            {/*
              The rotating half. It is keyed on the slide so React remounts it and the entrance
              animation replays — which also means it must not carry data-anim: those start at
              opacity 0 and only the one-shot GSAP timeline clears them, so a remounted node
              would stay invisible.
            */}
            <div key={hasBanners ? active?._id : 'static'} className={hasBanners ? 'animate-fade-up' : undefined}>
              <h1 className="font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-bold uppercase leading-[1.04] tracking-tight">
                <span {...(hasBanners ? {} : { 'data-anim': 'mask' })} className="block text-ink-950">
                  {headline}
                </span>
                {accent ? (
                  <span {...(hasBanners ? {} : { 'data-anim': 'mask' })} className="block text-decart-600">
                    {accent}
                  </span>
                ) : null}
              </h1>

              <span
                aria-hidden
                {...(hasBanners ? {} : { 'data-anim': 'up' })}
                className="mt-5 block h-1 w-16 rounded-full bg-decart-500"
              />

              <p
                {...(hasBanners ? {} : { 'data-anim': 'up' })}
                className="mt-5 max-w-lg text-lg leading-relaxed text-steel-600"
              >
                {active?.subtitle ||
                  'Ergonomic. Stylish. Built for comfort — 350+ models across seating, desking and institutional furniture, manufactured in-house and delivered pan-India.'}
              </p>

              {/* full-width taps on a phone, inline pills from sm up */}
              <div
                {...(hasBanners ? {} : { 'data-anim': 'up' })}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                <ButtonLink href={active?.href || '/products'} size="lg" className="w-full sm:w-auto">
                  {active?.ctaLabel || 'Explore products'}
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
            </div>

            {/* slide controls — arrows, a counter and dots, so the carousel is obviously one */}
            {slides.length > 1 ? (
              <div className="mt-8 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    aria-label="Previous slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/80 text-ink-900 backdrop-blur transition-colors hover:border-decart-300 hover:text-decart-700"
                  >
                    <ArrowLeft aria-hidden className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    aria-label="Next slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/80 text-ink-900 backdrop-blur transition-colors hover:border-decart-300 hover:text-decart-700"
                  >
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </button>
                </div>

                <span className="font-mono text-xs tracking-[0.14em] text-steel-400">
                  {String(index + 1).padStart(2, '0')}
                  <span className="mx-1 text-line">/</span>
                  {String(slides.length).padStart(2, '0')}
                </span>

                <div className="flex items-center gap-1.5">
                  {slides.map((banner, i) => (
                    <button
                      key={banner._id}
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Show slide ${i + 1}`}
                      aria-current={i === index}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        i === index ? 'w-7 bg-decart-600' : 'w-1.5 bg-ink-950/20 hover:bg-ink-950/40',
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : null}

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

          </div>

          {/* the category rail lived here; the client asked for an enquiry card instead, so the
              hero now captures a lead rather than sending people off to browse */}
          <div className="relative min-w-0">
            <div className="rounded-card border border-white/60 bg-paper/55 p-5 shadow-lift backdrop-blur-md md:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-decart-700">
                Tell us what you need
              </p>
              <h2 className="mt-2 font-display text-xl text-ink-950 md:text-2xl">Get a quote today</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-800">
                Your name, a number and what you are furnishing. We reply the same working day —
                {' '}{SITE.hours}.
              </p>

              <div className="glass-form mt-5">
                <LeadForm type="quote" short compact />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-line bg-paper/70 backdrop-blur">
        <div className="container-x py-4">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-steel-400 md:text-left">
            Comfort that keeps you ahead
          </p>
        </div>
      </div>
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
