'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, Phone, Mail, Clock } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

export type HeroBanner = {
  _id: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel?: string;
  /** Product slugs once staged beside the headline; kept so existing banners still load. */
  models?: string[];
};

/** Kept so the home page can keep passing the catalogue in; the room photograph carries the hero now. */
export type HeroModel = {
  slug: string;
  family: string;
  name: string;
  code: string;
  image: string;
};

/**
 * The home hero: one room photograph filling the frame, the headline standing on its empty wall,
 * and the site menu laid straight over it (the header turns transparent on this page until you
 * scroll). Every word comes from /admin/banners — the eyebrow, the headline, the line under it,
 * the button and the photograph — and the slides rotate.
 *
 * A light wash on the left keeps the text readable on any photograph an admin uploads; it fades
 * to nothing on the right so the furniture stays untouched.
 */

const MARKETPLACES = ['GeM', 'Flipkart', 'Amazon', 'IndiaMART', 'TradeIndia'];
const SLIDE_MS = 6500;

/**
 * Where each photograph is anchored when the frame crops it. A portrait cabin shot in a
 * landscape hero would otherwise be centred on the ceiling.
 */
const FOCUS: Record<string, string> = {
  '/scenes/executive-cabin.webp': '50% 62%',
  '/scenes/cafe-dining.webp': '60% 70%',
  '/scenes/lounge-lobby.webp': '60% 60%',
  '/scenes/school-atrium.webp': '65% 55%',
};

/** The headline can be two-tone: put a "|" (or an em dash) in the title and the rest takes the accent. */
function splitTitle(title: string): [string, string] {
  const parts = title.split(/\s*\|\s*|\s+—\s+/);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' — ')];
  return [title, ''];
}

export function Hero({ banners = [] }: { banners?: HeroBanner[]; lineup?: HeroModel[] }) {
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
    <section
      data-hero
      className="relative isolate flex min-h-[620px] flex-col overflow-hidden bg-porcelain sm:min-h-[680px] lg:min-h-[min(780px,92svh)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* the photographs, stacked and crossfaded so a slide change never flashes the background */}
      {slides.map((slide, i) => (
        <Image
          key={slide._id}
          src={slide.image}
          alt={slide.imageAlt || slide.title}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            'object-cover transition-opacity duration-700 ease-out',
            i === index ? 'opacity-100' : 'opacity-0',
          )}
          style={{ objectPosition: FOCUS[slide.image] ?? '60% 55%' }}
        />
      ))}

      {/* readability: a white wash from the left, and a short one under the transparent menu */}
      <div
        aria-hidden
        className="absolute inset-0 lg:hidden bg-gradient-to-r from-white/92 via-white/70 to-white/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(90deg, rgb(255 255 255 / 0.95) 0%, rgb(255 255 255 / 0.84) 34%, rgb(255 255 255 / 0.4) 56%, rgb(255 255 255 / 0) 76%)',
        }}
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/70 to-transparent" />

      <div className="container-x relative z-10 flex flex-1 items-center pb-24 pt-28 sm:pt-32 lg:pb-28">
        {/* keyed on the slide so the copy animates in with the photograph */}
        <div key={hasBanners ? active?._id : 'static'} className="max-w-xl animate-fade-up">
          {active?.eyebrow ? (
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-decart-700">
              {active.eyebrow}
            </p>
          ) : null}

          <h1 className="mt-3 font-display text-[clamp(2.4rem,5.4vw,4.25rem)] font-bold leading-[1.04] tracking-[-0.025em] text-ink-950">
            {headline}
            {accent ? <span className="block text-decart-700">{accent}</span> : null}
          </h1>

          <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-ink-900/80 sm:text-lg">
            {active?.subtitle || 'Ergonomic. Stylish. Built for comfort. Made in our own Faridabad factory.'}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink
              href={active?.href || '/products'}
              size="lg"
              className="!bg-ink-950 !text-porcelain !shadow-none hover:!bg-ink-800"
            >
              {active?.ctaLabel || 'Explore products'}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/quote" size="lg" variant="secondary" className="bg-paper/80 backdrop-blur">
              Get a quote
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* bottom of the frame: where it is sold on the left, the slide controls on the right */}
      <div className="absolute inset-x-0 bottom-[52px] z-10 sm:bottom-[46px]">
        <div className="container-x flex flex-wrap items-end justify-between gap-4">
          <div className="hidden items-center gap-2 md:flex">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink-900/60">Available on</p>
            {MARKETPLACES.map((name) => (
              <span
                key={name}
                className="rounded-full bg-paper/85 px-2.5 py-1 text-[11px] font-semibold text-steel-600 backdrop-blur"
              >
                {name}
              </span>
            ))}
          </div>

          {slides.length > 1 ? (
            <div className="ml-auto flex items-center gap-3 rounded-full bg-paper/85 py-1.5 pl-4 pr-1.5 backdrop-blur">
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
                      i === index ? 'w-7 bg-decart-600' : 'w-1.5 bg-ink-950/25 hover:bg-ink-950/45',
                    )}
                  />
                ))}
              </div>
              <span className="font-mono text-xs tracking-[0.14em] text-steel-600">
                {String(index + 1).padStart(2, '0')}
                <span className="mx-1 text-line">/</span>
                {String(slides.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-porcelain"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-porcelain transition-colors hover:bg-ink-800"
              >
                <ArrowRight aria-hidden className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* the contact strip: the number, the inbox and when somebody is there to answer */}
      <div className="relative z-10 bg-decart-700 text-white">
        <div className="container-x flex flex-col items-center gap-y-2 py-3 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
          <a href={SITE.phoneHref} data-call className="flex items-center gap-2 text-sm font-semibold hover:underline">
            <Phone aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
            <span className="font-mono tracking-[0.04em]">{SITE.phone}</span>
          </a>
          <span aria-hidden className="hidden h-4 w-px bg-white/25 sm:block" />
          <a href={`mailto:${SITE.emailPrimary}`} className="flex min-w-0 items-center gap-2 text-sm hover:underline">
            <Mail aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
            <span className="truncate">{SITE.emailPrimary}</span>
          </a>
          <span aria-hidden className="hidden h-4 w-px bg-white/25 sm:block" />
          <p className="flex items-center gap-2 text-sm text-white/85">
            <Clock aria-hidden className="h-4 w-4 shrink-0 opacity-80" />
            {SITE.hours}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * "Available on" marketplace strip. Kept for any page that wants it on its own; the home page
 * carries these names in the hero's badge row instead, as the artwork does, rather than
 * printing the same five twice.
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
