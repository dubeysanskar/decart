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
  Mail,
  Clock,
  Instagram,
  Linkedin,
  Facebook,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
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

/** One chair on the stage. Kept minimal so the page can pass catalogue rows straight in. */
export type HeroModel = {
  slug: string;
  family: string;
  name: string;
  code: string;
  image: string;
};

/**
 * The campaign banner, rebuilt as a live page (client: "they old type hero").
 *
 * Their own artwork is the reference: headline in two tones on the left, the feature icons
 * under it, the marketplace row and the contact strip along the bottom, and a showroom stage on
 * the right with the chairs standing on white podiums.
 *
 * It is drawn rather than dropped in as one flat image, because the image would be unreadable
 * on a phone, invisible to search engines and unclickable. Here the chairs link to their own
 * product pages, the number dials, and the headline, supporting line and button still come from
 * /admin/banners, so the hero still rotates.
 *
 * What those banner rows no longer supply is the picture: a room photograph behind the copy is
 * what forced the white veil over the whole frame, and it is not what the campaign looks like.
 * The stage shows photographed models instead, and the banner images stay available for a
 * scenes band elsewhere on the page.
 */

const FEATURES = [
  { icon: PersonStanding, label: 'Ergonomic design' },
  { icon: Wind, label: 'Breathable mesh' },
  { icon: SlidersHorizontal, label: 'Adjustable comfort' },
  { icon: Gem, label: 'Durable & stylish' },
];

const MARKETPLACES = ['GeM', 'Flipkart', 'Amazon', 'IndiaMART', 'TradeIndia'];

const SOCIALS = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
] as const;

const SLIDE_MS = 6500;
/** Chairs on the stage at once. Three fills the width without shrinking them to thumbnails. */
const STAGE = 3;

/**
 * The campaign headline is two-tone, so a banner title can be split the same way: put a "|"
 * (or an em dash) in the title and everything after it picks up the accent colour.
 */
function splitTitle(title: string): [string, string] {
  const parts = title.split(/\s*\|\s*|\s+—\s+/);
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' — ')];
  return [title, ''];
}

export function Hero({ banners = [], lineup = [] }: { banners?: HeroBanner[]; lineup?: HeroModel[] }) {
  const slides = banners.filter((banner) => banner.image && banner.title);
  const hasBanners = slides.length > 0;
  const shots = lineup.filter((model) => model.image);

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
  const [headline, accent] = active
    ? splitTitle(active.title)
    : ['Smart seating', 'for every space.'];

  // a different trio each slide, wrapping, so the stage changes with the copy
  const trio = shots.length
    ? Array.from({ length: Math.min(STAGE, shots.length) }, (_, i) => shots[(index * STAGE + i) % shots.length])
    : [];

  const socials = SOCIALS.map((social) => ({ ...social, href: SITE.social[social.key] })).filter((s) => s.href);

  return (
    <section
      data-hero
      className="relative overflow-hidden pt-24 sm:pt-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* the campaign ground: a cool wash falling to white, as on their artwork */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(122deg, #D2E8F8 0%, #E8F4FB 38%, #FFFFFF 72%), radial-gradient(44% 42% at 86% 6%, rgb(61 159 224 / 0.20), transparent), radial-gradient(38% 34% at 2% 94%, rgb(61 159 224 / 0.12), transparent)',
          backgroundBlendMode: 'multiply',
        }}
      />
      <span
        aria-hidden
        data-float="14"
        className="pointer-events-none absolute -right-24 top-6 h-72 w-72 rounded-full bg-decart-300/25 blur-3xl"
      />

      <div className="container-x relative z-10">
        <div className="grid items-center gap-8 pb-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:pb-10">
          {/* ------------------------------------------------------------------ copy */}
          <div className="min-w-0">
            {/* keyed on the slide so the copy animates in with the stage. It must not carry
                data-anim: those start at opacity 0 and only the one-shot GSAP timeline clears
                them, so a remounted node would stay invisible for good. */}
            <div key={hasBanners ? active?._id : 'static'} className={hasBanners ? 'animate-fade-up' : undefined}>
              <h1 className="font-display text-[clamp(2.1rem,4.4vw,3.4rem)] font-bold uppercase leading-[1.04] tracking-tight">
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
                className="mt-4 block h-1 w-16 rounded-full bg-decart-500"
              />

              <p
                {...(hasBanners ? {} : { 'data-anim': 'up' })}
                className="mt-4 max-w-lg text-[1.0625rem] leading-relaxed text-steel-600"
              >
                {active?.subtitle || 'Ergonomic. Stylish. Built for comfort.'}
              </p>
            </div>

            {/* the four thin-line badges, straight off the banner */}
            <ul className="mt-6 grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4" data-stagger="0.09">
              {FEATURES.map((feature) => (
                <li key={feature.label} data-anim="rise" className="group flex flex-col items-center gap-2 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-decart-300 bg-paper text-decart-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-decart-500 group-hover:shadow-pop">
                    <feature.icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="text-[11px] leading-snug text-steel-600">{feature.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href={active?.href || '/products'} size="lg" className="w-full sm:w-auto">
                {active?.ctaLabel || 'Explore products'}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/quote" size="lg" variant="secondary" className="w-full sm:w-auto">
                Get a quote
              </ButtonLink>
            </div>

            {/* AVAILABLE ON — the banner's own badge row, with the listings linked where we have
                them. It replaces the separate strip that used to repeat these five names lower
                down the page. */}
            <div className="mt-7 max-w-md rounded-card border border-white/70 bg-paper/80 p-3.5 shadow-[0_1px_2px_rgb(15_19_23/0.05)]">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-decart-700">
                Available on
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {MARKETPLACES.map((name) => (
                  <span key={name} className="text-sm font-semibold text-steel-600">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* only rendered once the client supplies a handle — never a dead icon */}
            {socials.length ? (
              <div className="mt-4 flex items-center gap-2.5">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-steel-400">Follow</p>
                {socials.map(({ key, label, Icon, href }) => (
                  <a
                    key={key}
                    href={href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-steel-600 transition-colors hover:border-decart-300 hover:text-decart-700"
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* ------------------------------------------------------- the showroom stage */}
          <div className="relative min-w-0">
            <div className="relative overflow-hidden rounded-card border border-white bg-white shadow-[0_24px_60px_-30px_rgb(15_19_23/0.35)]">
              {/*
                A white stage, deliberately.
                The studio shots are cut-outs on a white ground rather than transparent PNGs, so
                anything behind them prints as a white box round each chair. Multiplying them
                instead solved the box but erased the pale models — a white chair over a light
                backdrop disappears. On white, the cut-outs simply meet the stage and every
                colourway stays visible, which is also how their own artwork stages them.
              */}
              {/*
                Nothing tinted behind the chairs, for the same reason: the cut-outs carry their
                own white ground, so a blue wash or an angled flash under them would print the
                edge of each photo as a visible box. The campaign's blue comes from the page
                the stage sits on instead.
              */}
              {/* the floor the podiums stand on */}
              <span aria-hidden className="absolute inset-x-0 bottom-12 h-px bg-ink-950/[0.06]" />

              <div className="relative grid grid-cols-3 gap-2 px-3 pb-5 pt-6 sm:gap-4 sm:px-6 sm:pb-7 sm:pt-8">
                {(trio.length ? trio : [null, null, null]).map((model, i) => (
                  <div key={model?.slug ?? `empty-${i}`} className="min-w-0">
                    {model ? (
                      <Link
                        href={`/products/${model.family}/${model.slug}`}
                        className="group block"
                        title={`${model.name} (${model.code})`}
                      >
                        <div className="relative aspect-[4/5]">
                          <Image
                            src={model.image}
                            alt={`${model.name} — ${model.code}`}
                            fill
                            priority={i < 3}
                            sizes="(max-width: 640px) 30vw, 240px"
                            className="object-contain transition-transform duration-500 ease-out group-hover:-translate-y-1.5"
                          />
                        </div>
                        {/* the artwork stands each chair on a short white cylinder: an ellipse of
                            contact shadow, then the lit face of the podium under it */}
                        <div className="relative h-2">
                          <span
                            aria-hidden
                            className="absolute left-1/2 top-0 h-2 w-[66%] -translate-x-1/2 rounded-[100%] bg-ink-950/15 blur-[3px]"
                          />
                        </div>
                        <div className="mx-auto h-4 w-[72%] rounded-[4px] border border-line/60 bg-gradient-to-b from-white via-white to-[#E7EFF6] shadow-[0_3px_6px_-2px_rgb(15_19_23/0.16)]" />
                        <p className="mt-2 truncate text-center font-mono text-[9px] uppercase tracking-[0.1em] text-steel-600 transition-colors group-hover:text-decart-700">
                          {model.code}
                        </p>
                      </Link>
                    ) : (
                      <div className="aspect-[4/5] rounded-card bg-porcelain" />
                    )}
                  </div>
                ))}
              </div>

              <p className="relative border-t border-line/70 bg-porcelain px-4 py-2.5 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-steel-600">
                Comfort that keeps you ahead
              </p>
            </div>

            {/* slide controls — arrows, a counter and dots, so the carousel is obviously one */}
            {slides.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-4 lg:justify-start">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => go(index - 1)}
                    aria-label="Previous slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink-900 shadow-sm transition-colors hover:border-decart-300 hover:text-decart-700"
                  >
                    <ArrowLeft aria-hidden className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(index + 1)}
                    aria-label="Next slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-ink-900 shadow-sm transition-colors hover:border-decart-300 hover:text-decart-700"
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
          </div>
        </div>
      </div>

      {/* the banner's contact strip. The website address is on the artwork because that is a
          print and social asset — on the site itself the useful three are the number, the inbox
          and when somebody is there to answer. */}
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
