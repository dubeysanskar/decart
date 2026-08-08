import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, PersonStanding, Wind, SlidersHorizontal, Gem, Phone } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { publicFileExists } from '@/lib/assets';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

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

/** The podium lineup — every image is a real studio shot of a stock colourway. */
const LINEUP = [
  {
    code: 'GLANZA-HB',
    name: 'Glanza',
    colour: 'White mesh',
    dot: '#E9EBEC',
    src: '/products/mesh/glanza-hb/white-1.webp',
    href: '/products/mesh/glanza-hb',
    tall: false,
  },
  {
    code: 'BONAI-HB',
    name: 'Bonai',
    colour: 'Black · hanger back',
    dot: '#23272B',
    src: '/products/mesh/bonai-hb/black-1.webp',
    href: '/products/mesh/bonai-hb',
    tall: true,
  },
  {
    code: 'MUSTANG-HB',
    name: 'Mustang',
    colour: 'Red seat',
    dot: '#C93A3A',
    src: '/products/ultra-luxury-mesh/mustang-hb/black-with-red-1.webp',
    href: '/products/ultra-luxury-mesh/mustang-hb',
    tall: false,
  },
  {
    code: 'EIFFEL-HB',
    name: 'Eiffel',
    colour: 'Orange seat',
    dot: '#E07B23',
    src: '/products/special-luxury-mesh/eiffel-hb/black-with-orange-1.webp',
    href: '/products/special-luxury-mesh/eiffel-hb',
    tall: true,
  },
  {
    code: 'BUBBLE-MB',
    name: 'Bubble',
    colour: 'Blue seat',
    dot: '#2E6FC7',
    src: '/products/task-mesh/bubble-mb/black-with-blue-1.webp',
    href: '/products/task-mesh/bubble-mb',
    tall: false,
  },
  {
    code: 'COMFORT-HI-STOOL',
    name: 'Comfort Stool',
    colour: 'Green',
    dot: '#5CB335',
    src: '/products/cafe/comfort-hi-stool/green-1.webp',
    href: '/products/cafe/comfort-hi-stool',
    tall: true,
  },
];

const MARKETPLACES = ['GeM', 'Flipkart', 'Amazon', 'IndiaMART', 'TradeIndia'];

export function Hero() {
  const lineup = LINEUP.filter((item) => publicFileExists(item.src));

  return (
    <section data-hero className="relative overflow-hidden pt-28 md:pt-32">
      {/* the stage: diagonal blue→white wash with two soft glows, like the campaign banner */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(128deg, #D8EBF9 0%, #EDF6FC 38%, #FFFFFF 72%), radial-gradient(48% 42% at 88% 10%, rgb(61 159 224 / 0.18), transparent), radial-gradient(40% 36% at 6% 90%, rgb(61 159 224 / 0.12), transparent)',
          backgroundBlendMode: 'multiply',
        }}
      />

      <div className="container-x relative">
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-6">
          {/* ---------------------------------------------------------- copy */}
          <div className="pb-2 lg:pb-14">
            <p
              data-anim="up"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-paper/85 px-4 py-2 text-xs font-medium text-ink-900 shadow-card backdrop-blur"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-decart-500" />
              DecArt Industries · Faridabad · Since {SITE.established}
            </p>

            <h1
              data-anim="clip"
              className="mt-7 font-display text-[clamp(2.25rem,4.6vw,3.5rem)] font-bold uppercase leading-[1.04] tracking-tight"
            >
              <span className="block text-ink-950">Smart seating</span>
              <span className="block text-decart-600">for every space.</span>
            </h1>

            <span aria-hidden data-anim="up" className="mt-5 block h-1 w-16 rounded-full bg-decart-500" />

            <p data-anim="up" className="mt-5 max-w-lg text-lg leading-relaxed text-steel-600">
              Ergonomic. Stylish. Built for comfort — 350+ models across seating, desking and institutional
              furniture, manufactured in-house and delivered pan-India.
            </p>

            <div data-anim="up" className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/products" size="lg">
                Explore products
                <ArrowRight aria-hidden className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/quote" size="lg" variant="secondary">
                Get a quote
              </ButtonLink>
              <a
                href={SITE.phoneHref}
                data-call
                className="inline-flex h-[52px] items-center gap-2 rounded-btn px-4 font-mono text-sm text-ink-900 transition-colors hover:bg-paper"
              >
                <Phone aria-hidden className="h-4 w-4 text-decart-600" />
                {SITE.phone}
              </a>
            </div>

            {/* thin-line feature icons, straight off the banner */}
            <ul data-anim="up" className="mt-10 grid max-w-md grid-cols-4 gap-3">
              {FEATURES.map((feature) => (
                <li key={feature.label} className="flex flex-col items-center gap-2.5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-decart-300 bg-paper/70 text-decart-600">
                    <feature.icon aria-hidden className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <span className="text-xs leading-snug text-steel-600">{feature.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------------------------------------------------------- podium lineup */}
          <div className="relative" data-anim="scale">
            <div className="no-scrollbar flex items-end gap-1 overflow-x-auto pb-1 sm:gap-2 lg:justify-end lg:overflow-visible">
              {lineup.map((item, i) => (
                <Link
                  key={item.code}
                  href={item.href}
                  aria-label={`${item.name} — ${item.colour}`}
                  className="group flex w-[130px] shrink-0 flex-col items-center sm:w-[150px] lg:w-auto lg:flex-1"
                >
                  <div className="relative z-10 -mb-6 aspect-[3/4] w-full transition-transform duration-300 ease-out group-hover:-translate-y-2">
                    <Image
                      src={item.src}
                      alt={`DecArt ${item.name} ${item.code} — ${item.colour}`}
                      fill
                      // only the chairs in the first viewport are worth blocking the LCP for
                      priority={i < 3}
                      loading={i < 3 ? undefined : 'lazy'}
                      sizes="(max-width: 640px) 130px, (max-width: 1024px) 150px, 170px"
                      className="object-contain drop-shadow-[0_18px_20px_rgb(14_27_40/0.18)]"
                    />
                  </div>
                  {/* the white podium */}
                  <div
                    className={cn(
                      'w-full rounded-t-[2rem] bg-paper shadow-podium transition-shadow group-hover:shadow-pop',
                      item.tall ? 'h-24 md:h-32' : 'h-14 md:h-20',
                    )}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* marketplace + tagline strip along the foot of the banner */}
      <div className="relative border-t border-line bg-paper/85 backdrop-blur">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-4 md:flex-row md:items-center">
          <div className="no-scrollbar flex items-center gap-5 overflow-x-auto">
            <span className="shrink-0 rounded-full bg-decart-600 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              Available on
            </span>
            {MARKETPLACES.map((name) => (
              <span key={name} className="shrink-0 text-sm font-semibold text-steel-600">
                {name}
              </span>
            ))}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel-400">
            Comfort that keeps you ahead
          </p>
        </div>
      </div>
    </section>
  );
}
