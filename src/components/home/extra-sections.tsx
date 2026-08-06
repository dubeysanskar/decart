import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { Accordion } from '@/components/ui/Accordion';
import { ProductImage } from '@/components/ui/ProductImage';
import { COPY } from '@/lib/site';
import type { CatalogueProduct } from '@/lib/catalogue';

/**
 * Homepage sections beyond the core set — these exist to give the page length and rhythm,
 * and each one earns its place by answering a question a B2B buyer actually asks.
 */

// ---------------------------------------------------------------- colour story

const SWATCH: Record<string, string> = {
  black: '#1B1B1B',
  grey: '#8E969D',
  white: '#F2F3F4',
  blue: '#2E6FC7',
  green: '#2E9E63',
  red: '#C93A3A',
  orange: '#E07B23',
  silver: '#B9BDC1',
};

function swatch(slug: string) {
  const [base, accent] = slug.split('-with-');
  const pick = (value?: string) => {
    if (!value) return null;
    const key = Object.keys(SWATCH).find((k) => value.includes(k));
    return key ? SWATCH[key] : null;
  };
  return { base: pick(base) ?? '#5C6670', accent: pick(accent) ?? pick(base) ?? '#5C6670' };
}

/** Real colourway data from the shoot — proof that "choose your finish" is not marketing. */
export function ColourStory({ product }: { product?: CatalogueProduct }) {
  const colourways = product?.colourways ?? [];
  if (!product || colourways.length < 4) return null;

  const hero = colourways[0]?.images?.[0];

  return (
    <section className="section overflow-hidden bg-ink-950 text-porcelain">
      <div className="container-x">
        <SectionHeading
          eyebrow="Finishes"
          index="04"
          onDark
          title={`One chair. ${colourways.length} standard colourways.`}
          lede="Zone a floor by team without changing model. Every combination below is a stock build — and project quantities can be matched to any shade you send us."
          action={
            <ButtonLink href={`/products/${product.family}/${product.slug}`} variant="secondary" onDark>
              See the {product.name.split(' ')[0]}
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          }
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-card bg-porcelain" data-anim="scale">
            <ProductImage
              src={hero}
              alt={`DecArt ${product.name} colourways`}
              label={product.code}
              sizes="(max-width: 1024px) 90vw, 460px"
              imgClassName="p-6"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-stagger>
            {colourways.slice(0, 12).map((colour) => {
              const { base, accent } = swatch(colour.slug);
              return (
                <div
                  key={colour.slug}
                  data-anim="up"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-white/25"
                >
                  <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-white/20">
                    <span className="h-full w-1/2" style={{ background: base }} />
                    <span className="h-full w-1/2" style={{ background: accent }} />
                  </span>
                  <span className="text-xs leading-tight text-steel-400">{colour.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- numbers

const NUMBERS = [
  { value: 10, suffix: '+', label: 'Years manufacturing', note: 'Building since 2015' },
  { value: 350, suffix: '+', label: 'Models in catalogue', note: 'Across 30 families' },
  { value: 68, suffix: '', label: 'Page catalogue', note: 'Free to download' },
  { value: 1, suffix: '', label: 'Working day to quote', note: 'Usually the same day' },
];

export function Numbers() {
  return (
    <section className="section bg-porcelain">
      <div className="container-x">
        <SectionHeading
          eyebrow="By the numbers"
          index="06"
          title="A decade of floors, cabins and campuses"
          lede="No middlemen between the drawing and the delivery — which is why the specification you are quoted is the specification that arrives."
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-4" data-stagger>
          {NUMBERS.map((item) => (
            <div key={item.label} data-anim="up" className="bg-paper p-7 md:p-9">
              <p className="font-display text-[clamp(2.5rem,4.5vw,3.75rem)] font-semibold leading-none text-ink-950">
                <span data-count={item.value} data-count-suffix={item.suffix}>
                  0{item.suffix}
                </span>
              </p>
              <p className="mt-4 text-[0.9375rem] font-medium text-ink-950">{item.label}</p>
              <p className="mt-1 text-sm text-steel-600">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- how buying works

const STEPS = [
  {
    n: '01',
    title: 'Send the requirement',
    body: 'Model or reference, quantity, finish and the site city. WhatsApp a photo if that is faster.',
  },
  {
    n: '02',
    title: 'Get a working quote',
    body: 'Usually the same working day, with the component spec stated line by line.',
  },
  {
    n: '03',
    title: 'Confirm and we build',
    body: 'Production slots against your PO. Custom builds get a drawing before we cut anything.',
  },
  {
    n: '04',
    title: 'Delivered and installed',
    body: 'Pan-India surface freight, packed for Indian roads, with installation support on projects.',
  },
];

export function HowItWorks() {
  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading
          eyebrow="How buying works"
          index="05"
          title="Four steps, no procurement theatre"
          lede="We are inquiry-led rather than a checkout — because a floor of 200 chairs is never a cart."
          action={<ButtonLink href="/quote">Start a quote</ButtonLink>}
        />

        <ol className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-2 lg:grid-cols-4" data-stagger>
          {STEPS.map((step) => (
            <li key={step.n} data-anim="up" className="group relative bg-paper p-7 transition-colors hover:bg-porcelain md:p-8">
              <span className="font-mono text-xs tracking-[0.14em] text-decart-600">{step.n}</span>
              <h3 className="mt-4 text-lg font-semibold text-ink-950">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- faq

const FAQ = [
  ...COPY.quoteFaq,
  {
    q: 'Can you match our brand colours?',
    a: 'Yes. Eight powder-coat shades are standard and we match custom shades on project quantities. Upholstery is specified per order.',
  },
  {
    q: 'Do you handle installation?',
    a: 'Workstations, cubicles and conference tables are installed by our team or a supervised local crew. Chairs ship assembled or flat-packed as you prefer.',
  },
  {
    q: 'What about after-sales?',
    a: 'One desk handles the whole relationship — the number you call for a quote is the number you call for a castor two years later.',
  },
];

export function HomeFaq() {
  return (
    <section className="section bg-porcelain">
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading
            eyebrow="Questions"
            index="09"
            title="Asked before every order"
            lede="If yours is not here, the sales desk answers it in one call."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/contact" variant="secondary">
              Ask us directly
            </ButtonLink>
          </div>
        </div>

        <div data-anim="up">
          <Accordion
            items={FAQ.map((item, i) => ({
              id: `home-faq-${i}`,
              title: item.q,
              content: <p className="max-w-2xl">{item.a}</p>,
            }))}
            defaultOpen="home-faq-0"
          />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- catalogue strip

export function CatalogueStrip() {
  return (
    <section className="bg-paper py-16 md:py-20">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-card bg-porcelain p-8 md:p-14" data-anim="up">
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">The catalogue</p>
              <h2 className="mt-5 max-w-[18ch] font-display text-h2 font-semibold text-ink-950">
                68 pages. Every model, code and size.
              </h2>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-steel-600">
                The document procurement teams actually circulate — printed model codes, dimensions in millimetres,
                finishes and build options, all in one PDF.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/downloads" size="lg">
                  Download the catalogue
                </ButtonLink>
                <ButtonLink href="/products" size="lg" variant="secondary">
                  Browse online
                </ButtonLink>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line">
              {[
                ['30', 'Families'],
                ['350+', 'Models'],
                ['8', 'Powder coats'],
                ['6', 'Laminates'],
              ].map(([value, label]) => (
                <li key={label} className="bg-paper p-5">
                  <p className="font-display text-2xl font-semibold text-ink-950">{value}</p>
                  <p className="mt-1 text-sm text-steel-600">{label}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- segment list

const SEGMENT_ROWS = [
  { name: 'Corporate offices', body: 'Full-floor seating, desking and cabins.', href: '/products?group=seating' },
  { name: 'Education', body: 'Classrooms, labs, libraries and hostels.', href: '/products/school' },
  { name: 'Hospitality', body: 'Cafés, lobbies, banquet and back-of-house.', href: '/products/cafe' },
  { name: 'Healthcare', body: 'Waiting halls, consulting rooms and wards.', href: '/products/visitor' },
  { name: 'Government & institutions', body: 'Tendered supply with documented specs.', href: '/quote?type=bulk' },
];

/** An editorial index list — reads as a table of contents rather than another card grid. */
export function SegmentList() {
  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading
          eyebrow="Who we serve"
          index="06"
          title="Fitted out, floor by floor"
          lede="The same catalogue answers a 12-seat cabin and a 500-seat campus — the difference is how we quote it."
        />

        <ul className="mt-12 border-t border-line" data-stagger>
          {SEGMENT_ROWS.map((segment) => (
            <li key={segment.name} data-anim="up">
              <Link
                href={segment.href}
                className="group flex flex-col gap-2 border-b border-line py-7 transition-colors hover:bg-porcelain md:flex-row md:items-center md:gap-8 md:px-4"
              >
                <span className="font-display text-xl font-semibold text-ink-950 transition-colors group-hover:text-decart-700 md:w-[38%] md:text-2xl">
                  {segment.name}
                </span>
                <span className="flex-1 text-[0.9375rem] text-steel-600">{segment.body}</span>
                <ArrowUpRight
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-steel-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink-950"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
