'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  PersonStanding,
  Wind,
  SlidersHorizontal,
  Gem,
  Phone,
  Mail,
  Clock,
  MapPin,
  Instagram,
  Linkedin,
  Facebook,
} from 'lucide-react';
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
  /** Product slugs to stage with this slide, chosen in /admin/banners. */
  models?: string[];
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
 * Everything the hero says is editable in /admin/banners — the eyebrow, the two-tone headline,
 * the supporting line, the button, and which models stand on the stage. What a banner no longer
 * supplies is a backdrop: a room photograph behind the copy is what forced a white veil across
 * the whole frame to keep the text readable. It leads the stage instead, on the slides whose
 * family has nothing photographed yet.
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

/** "/products/cafe" and "/products/cafe/comfort-hi-stool" are both the cafe family. */
function familyFromHref(href?: string): string {
  const match = /^\/products\/([^/?#]+)/.exec(href ?? '');
  return match ? match[1] : '';
}

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
  const [headline, accent] = active ? splitTitle(active.title) : ['Smart seating', 'for every space.'];

  /**
   * What the slide stages, in the order the slide itself decides.
   *
   * 1. the models picked for this banner in /admin/banners,
   * 2. else the photographed models of the family its button points at,
   * 3. else nothing — the fallback below leads with the slide's own photograph rather than
   *    staging chairs that contradict the headline.
   */
  const picked = active?.models?.length
    ? (active.models.map((slug) => shots.find((model) => model.slug === slug)).filter(Boolean) as HeroModel[])
    : [];
  const family = familyFromHref(active?.href);
  const fromFamily = picked.length ? [] : shots.filter((model) => model.family === family);
  const chosen = (picked.length ? picked : fromFamily).slice(0, STAGE);

  // with no banners at all the hero is the static campaign lockup, and any chairs suit it
  const fallbackTrio = shots.length
    ? Array.from({ length: Math.min(STAGE, shots.length) }, (_, i) => shots[(index * STAGE + i) % shots.length])
    : [];
  const staged = hasBanners ? chosen : fallbackTrio;

  /** The big card: the leading model, or the slide's own photograph when it has no models. */
  const lead =
    staged[0]
      ? {
          kind: 'model' as const,
          key: staged[0].slug,
          href: `/products/${staged[0].family}/${staged[0].slug}`,
          image: staged[0].image,
          alt: `${staged[0].name} — ${staged[0].code}`,
          title: `${staged[0].name} (${staged[0].code})`,
          name: staged[0].name,
          meta: staged[0].code,
        }
      : active
        ? {
            kind: 'scene' as const,
            key: active._id,
            href: active.href || '/products',
            image: active.image,
            alt: active.imageAlt || active.title,
            title: active.title,
            name: active.ctaLabel || 'See the range',
            // the headline is inches away; repeating it under the picture said nothing
            meta: active.subtitle || 'Explore the range',
          }
        : null;

  const support = staged.slice(lead?.kind === 'model' ? 1 : 0, STAGE);

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
        <div className="grid items-center gap-9 pb-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 lg:pb-12">
          {/* ------------------------------------------------------------------ copy */}
          <div className="min-w-0">
            <p
              data-anim="up"
              className="inline-flex items-center gap-2 rounded-full border border-white bg-paper/80 py-1.5 pl-2.5 pr-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-steel-600 shadow-[0_1px_2px_rgb(15_19_23/0.04)]"
            >
              <MapPin aria-hidden className="h-3.5 w-3.5 text-decart-600" />
              {active?.eyebrow ? (
                active.eyebrow
              ) : (
                <>
                  Own factory, Faridabad
                  <span aria-hidden className="h-1 w-1 rounded-full bg-steel-400" />
                  Since {SITE.established}
                </>
              )}
            </p>

            {/* keyed on the slide so the copy animates in with the stage. It must not carry
                data-anim: those start at opacity 0 and only the one-shot GSAP timeline clears
                them, so a remounted node would stay invisible for good. */}
            <div key={hasBanners ? active?._id : 'static'} className={hasBanners ? 'animate-fade-up' : undefined}>
              <h1 className="mt-5 font-display text-[clamp(2.15rem,4.5vw,3.5rem)] font-bold uppercase leading-[1.02] tracking-[-0.02em]">
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
                className="mt-5 block h-1 w-14 rounded-full bg-decart-500"
              />

              <p
                {...(hasBanners ? {} : { 'data-anim': 'up' })}
                className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-steel-600"
              >
                {active?.subtitle || 'Ergonomic. Stylish. Built for comfort.'}
              </p>
            </div>

            {/* the four thin-line badges, straight off the banner */}
            <ul className="mt-7 grid max-w-md grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4" data-stagger="0.09">
              {FEATURES.map((feature) => (
                <li key={feature.label} data-anim="rise" className="group flex flex-col items-center gap-2 text-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-decart-300 bg-paper text-decart-600 shadow-[0_1px_2px_rgb(15_19_23/0.04)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-decart-500 group-hover:shadow-pop">
                    <feature.icon aria-hidden className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </span>
                  <span className="text-[10.5px] font-medium leading-snug text-steel-600">{feature.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <ButtonLink href={active?.href || '/products'} size="lg" className="w-full sm:w-auto">
                {active?.ctaLabel || 'Explore products'}
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/quote" size="lg" variant="secondary" className="w-full sm:w-auto">
                Get a quote
              </ButtonLink>
            </div>

            {/* AVAILABLE ON — the banner's own badge row. It replaces the strip that used to
                repeat these five names lower down the page. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-steel-400">Available on</p>
              <div className="flex flex-wrap items-center gap-1.5">
                {MARKETPLACES.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-white bg-paper/80 px-2.5 py-1 text-[11px] font-semibold text-steel-600 shadow-[0_1px_2px_rgb(15_19_23/0.04)]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* only rendered once the client supplies a handle — never a dead icon */}
            {socials.length ? (
              <div className="mt-4 flex items-center gap-2">
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
            <div className="relative overflow-hidden rounded-card p-3.5 shadow-[0_30px_70px_-34px_rgb(21_101_166/0.45)] ring-1 ring-white/70 sm:p-5">
              {/*
                A blue stage, with each chair on its own white card.
                The studio shots are cut-outs on a white ground rather than transparent PNGs, so
                any tint behind them prints the edge of the photo as a white box round the chair.
                Making that box a deliberate product card turns the constraint into the design,
                and lets the campaign's blue back in. Multiplying the shots to remove the box
                erased the pale models instead — a white chair over a light wash disappears.
              */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(150deg, #C4DFF5 0%, #DCEDFA 44%, #F3FAFE 100%), radial-gradient(58% 48% at 84% 0%, rgb(255 255 255 / 0.55), transparent)',
                }}
              />
              {/* the angled flash off the campaign artwork */}
              <span
                aria-hidden
                className="absolute -left-16 -top-16 h-52 w-72 bg-white/35"
                style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
              />

              {/* autoplay meter: it shows the slide running out, and holds while you hover */}
              {slides.length > 1 ? (
                <div aria-hidden className="absolute inset-x-0 top-0 h-[3px] bg-white/45">
                  <span
                    key={`${index}-${paused}`}
                    className="block h-full origin-left animate-hero-progress bg-decart-500/70"
                    style={{ animationPlayState: paused ? 'paused' : 'running' }}
                  />
                </div>
              ) : null}

              {/*
                One subject leads, the rest support it.
                Three equal cards gave every chair a third of the width and none of them any
                presence. Worse, the models had nothing to do with the headline: a slide reading
                CAFE CHAIRS staged three mesh task chairs, because the line-up was drawn from the
                featured pool rather than from the slide. Now the slide decides — the models
                picked in /admin/banners, else the family its link points at, and if nothing in
                that family is photographed yet, the slide's own photograph leads instead.
              */}
              <div
                className={cn(
                  'relative grid gap-2.5 sm:gap-3',
                  support.length ? 'sm:grid-cols-[1.55fr_1fr]' : 'grid-cols-1',
                )}
              >
                {lead ? (
                  <Link
                    key={lead.key}
                    href={lead.href}
                    title={lead.title}
                    className={cn(
                      'group relative flex animate-fade-up flex-col rounded-[16px] bg-paper p-2.5 ring-1 ring-white transition-all duration-300 hover:-translate-y-1 hover:shadow-podium sm:p-3',
                      // one chair alone would otherwise stretch to the full width of the stage
                      !support.length && lead?.kind === 'model' && 'mx-auto w-full max-w-[23rem]',
                    )}
                  >
                    <div
                      className={cn(
                        'relative overflow-hidden rounded-[12px]',
                        lead.kind === 'scene'
                          ? support.length
                            ? 'aspect-[5/4] sm:aspect-[4/5]'
                            : 'aspect-[16/10]'
                          : 'aspect-[5/4] sm:aspect-[4/5]',
                      )}
                    >
                      <Image
                        src={lead.image}
                        alt={lead.alt}
                        fill
                        priority
                        sizes="(max-width: 640px) 92vw, 340px"
                        className={cn(
                          'transition-transform duration-500 ease-out group-hover:scale-[1.03]',
                          // a room is cropped to fill; a chair on white is contained
                          lead.kind === 'scene' ? 'object-cover' : 'object-contain',
                        )}
                      />
                    </div>

                    <div className="mt-2 flex items-end justify-between gap-3 border-t border-line/70 pt-2.5">
                      <span className="min-w-0">
                        <span className="block truncate text-[0.9375rem] font-semibold leading-tight text-ink-950">
                          {lead.name}
                        </span>
                        <span
                          className={cn(
                            'mt-0.5 block truncate text-steel-400',
                            // a model code wants mono caps; a sentence of copy does not
                            lead.kind === 'model'
                              ? 'font-mono text-[10px] uppercase tracking-[0.1em]'
                              : 'text-[11px]',
                          )}
                        >
                          {lead.meta}
                        </span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-900 transition-colors group-hover:border-decart-500 group-hover:bg-decart-600 group-hover:text-white">
                        <ArrowUpRight aria-hidden className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="aspect-[4/5] rounded-[16px] bg-paper/70" />
                )}

                <div className={cn('grid gap-2.5 sm:gap-3', support.length ? 'grid-cols-2 sm:grid-cols-1' : 'hidden')}>
                  {support.map((model, i) => (
                    <div key={model?.slug ?? `empty-${i}`} className="min-w-0">
                      {model ? (
                        <Link
                          href={`/products/${model.family}/${model.slug}`}
                          title={`${model.name} (${model.code})`}
                          className="group relative flex h-full animate-fade-up flex-col rounded-[14px] bg-paper p-2 ring-1 ring-white transition-all duration-300 hover:-translate-y-1 hover:shadow-podium"
                          style={{ animationDelay: `${(i + 1) * 90}ms` }}
                        >
                          <div className="relative aspect-[4/3] flex-1 sm:aspect-auto sm:min-h-[6.5rem]">
                            <Image
                              src={model.image}
                              alt={`${model.name} — ${model.code}`}
                              fill
                              sizes="(max-width: 640px) 45vw, 190px"
                              className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                            />
                          </div>

                          <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-line/70 pt-1.5">
                            <span className="truncate font-mono text-[9px] uppercase tracking-[0.1em] text-steel-600">
                              {model.code}
                            </span>
                            <ArrowUpRight
                              aria-hidden
                              className="h-3 w-3 shrink-0 text-steel-400 transition-colors group-hover:text-decart-600"
                            />
                          </div>
                        </Link>
                      ) : (
                        <div className="aspect-[4/3] rounded-[14px] bg-paper/70" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-3.5 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-decart-700">
                  Comfort that keeps you ahead
                </p>
                <Link
                  href="/products"
                  className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-900 hover:text-decart-700"
                >
                  All models
                  <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* slide controls — dots, a counter and arrows, tucked under the stage's edge */}
            {slides.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-4 lg:justify-end">
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

                <span className="font-mono text-xs tracking-[0.14em] text-steel-400">
                  {String(index + 1).padStart(2, '0')}
                  <span className="mx-1 text-line">/</span>
                  {String(slides.length).padStart(2, '0')}
                </span>

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
