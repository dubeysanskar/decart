import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Quote, Star } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { SectionHeading, Eyebrow, HexBullet } from '@/components/ui/typography';
import { ProductImage } from '@/components/ui/ProductImage';
import { ProductCard } from '@/components/product/ProductCard';
import { SITE, COPY } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { listPublic } from '@/lib/assets';
import { cn } from '@/lib/utils';
import type { CatalogueProduct } from '@/lib/catalogue';

// ---------------------------------------------------------------- trust bar

export function TrustBar() {
  const certificates = listPublic('certificates');

  return (
    <section className="border-b border-line bg-paper">
      <div className="container-x">
        {/* editorial stat band — display numerals count up on entry, hairline dividers, no card chrome */}
        <div className="grid grid-cols-2 divide-x divide-line border-x border-line md:grid-cols-4" data-anim="up">
          {SITE.counters.map((counter, i) => {
            const numeric = /^(\d+)(.*)$/.exec(counter.value);
            return (
              <div
                key={counter.label}
                className={cn('px-5 py-8 md:px-7 md:py-11', i < 2 && 'border-b border-line md:border-b-0')}
              >
                <p className="font-display text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-none text-decart-700">
                  {numeric ? (
                    <span data-count={numeric[1]} data-count-suffix={numeric[2]}>
                      0{numeric[2]}
                    </span>
                  ) : (
                    counter.value
                  )}
                </p>
                <p className="mt-3 text-[0.8125rem] leading-snug text-steel-600">{counter.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-6">
          {certificates.length ? (
            certificates.map((src) => (
              <Image
                key={src}
                src={src}
                alt={`${src.split('/').pop()?.split('.')[0]} certification`}
                width={92}
                height={44}
                className="h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
              />
            ))
          ) : (
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-steel-600">{SITE.complianceLine}</p>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- families

export type FamilyTile = { slug: string; name: string; count: number; lede: string; cover: string };

export function FamilyGrid({ families }: { families: FamilyTile[] }) {
  if (!families.length) return null;
  // eight tiles: two tidy rows that fit one screen. The full 30 live in the directory below,
  // so this band is a shortcut, not a second catalogue.
  const tiles = families.slice(0, 8);

  return (
    <section className="section bg-porcelain">
      <div className="container-x">
        <SectionHeading
          eyebrow="The catalogue"
          index="01"
          title="Browse by family"
          lede="Thirty families across seating, desking and institutional furniture — every model built in our own factory."
          action={
            <ButtonLink href="/products" variant="secondary">
              All 30 families
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          }
        />

        {/* one uniform card, repeated — the old 2x2 hero tile pushed the section off screen */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5" data-stagger="0.06">
          {tiles.map((family, i) => (
            <Link
              key={family.slug}
              href={`/products/${family.slug}`}
              data-anim="rise"
              className="group flex min-w-0 flex-col overflow-hidden rounded-card bg-paper shadow-[0_0_0_1px_rgb(227_231_236)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(15_19_23/0.14),0_20px_32px_-20px_rgb(15_19_23/0.32)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                <ProductImage
                  src={family.cover}
                  alt={`DecArt ${family.name}`}
                  label={family.name}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                  imgClassName="p-3 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 border-t border-line p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-decart-700">
                  {String(i + 1).padStart(2, '0')} · {family.count} {family.count === 1 ? 'model' : 'models'}
                </p>
                <h3 className="text-[0.9375rem] font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                  {family.name}
                </h3>
                <p className="line-clamp-1 text-[0.8125rem] leading-snug text-steel-600">{family.lede}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- bestsellers

export function BestsellerRail({ products }: { products: CatalogueProduct[] }) {
  if (!products.length) return null;

  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading
          eyebrow="Photographed range"
          index="02"
          title="Models people order twice"
          lede="Our most-specified chairs, shot in our own studio — every colourway below is a standard build."
          action={
            <ButtonLink href="/products" variant="secondary">
              View all products
            </ButtonLink>
          }
        />
      </div>

      <div
        data-stagger="0.07"
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 md:px-8 lg:mx-auto lg:max-w-container"
      >
        {products.map((product, i) => (
          <ProductCard
            key={product.slug}
            product={product}
            priority={i < 2}
            sizes="(max-width: 768px) 70vw, 300px"
            className="w-[70vw] shrink-0 snap-start sm:w-[46vw] md:w-[300px]"
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- why decart

const BUILD_STEPS = [
  {
    title: 'Design',
    body: 'Ergonomics, frame geometry and finish planned against how the product will really be used.',
  },
  { title: 'Fabricate', body: 'Frames, ply and metalwork made and finished in-house.' },
  {
    title: 'Upholster & assemble',
    body: 'High-density moulded PU foam, mesh and leatherette tapestry fitted by hand.',
  },
  {
    title: 'Test & pack',
    body: 'BIFMA/SGS-tested components, per-piece checks, and packing that survives Indian roads.',
  },
];

export function WhyDecArt() {
  const factory = listPublic('factory')[0];

  return (
    <section className="section bg-porcelain">
      <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div
          className="relative aspect-[4/3] overflow-hidden rounded-img bg-decart-100"
          data-anim="left"
          data-parallax="0.05"
        >
          <ProductImage
            src={factory}
            alt="DecArt manufacturing floor in Faridabad"
            label="Factory photography"
            fit="cover"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </div>

        <div data-anim="up">
          <SectionHeading
            eyebrow="How we build"
            index="03"
            title="One factory, four honest steps"
            lede="Nothing critical is outsourced. That is the whole reason we can quote a spec and then actually ship it."
          />

          <ol className="mt-8 space-y-5">
            {BUILD_STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="mt-0.5 font-mono text-xs tracking-[0.1em] text-decart-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-ink-950">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-steel-600">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <ButtonLink href="/manufacturing" variant="secondary" className="mt-8">
            Inside the factory
            <ArrowRight aria-hidden className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- segments

export function Segments() {
  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading
          eyebrow="Who we serve"
          index="04"
          title="Fitted out, floor by floor"
          lede="The same catalogue answers a 12-seat cabin and a 500-seat campus — the difference is how we quote it."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SITE.segments.map((segment) => (
            <div
              key={segment.name}
              data-anim="up"
              className="flex flex-col gap-2 rounded-card border border-line bg-porcelain p-5"
            >
              <HexBullet className="mt-0" />
              <h3 className="text-[0.9375rem] font-semibold text-ink-950">{segment.name}</h3>
              <p className="text-sm leading-snug text-steel-600">{segment.blurb}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- clients

export function ClientMarquee() {
  const logos = listPublic('clients');

  if (!logos.length) {
    // no logo files yet — the whole band is still a link through to the client wall
    return (
      <section className="border-y border-line bg-porcelain py-12">
        <Link href="/clients" className="container-x group block text-center">
          <Eyebrow>Trusted by teams across India</Eyebrow>
          <p className="mx-auto mt-5 max-w-4xl text-sm leading-relaxed text-steel-600">
            {SITE.clients.join(' · ')}
          </p>
          <span className="mt-6 inline-block text-sm font-semibold text-decart-700 group-hover:underline">
            See the client wall →
          </span>
        </Link>
      </section>
    );
  }

  const doubled = [...logos, ...logos];

  // client brief: "logo slider — click karne pe client page open ho jaye"
  return (
    <section className="overflow-hidden border-y border-line bg-porcelain py-12">
      <div className="container-x text-center">
        <Eyebrow>Trusted by teams across India</Eyebrow>
      </div>
      <Link href="/clients" aria-label="See the client wall" className="group block">
        <div className="mt-8 flex w-max animate-marquee gap-12 group-hover:[animation-play-state:paused]">
          {doubled.map((src, i) => (
            <Image
              key={`${src}-${i}`}
              src={src}
              alt=""
              width={120}
              height={56}
              aria-hidden={i >= logos.length}
              className="h-12 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ))}
        </div>
        <span className="container-x mt-8 block text-center text-sm font-semibold text-decart-700 group-hover:underline">
          See the client wall →
        </span>
      </Link>
    </section>
  );
}

// ---------------------------------------------------------------- testimonials

export type Testimonial = {
  _id: string;
  name: string;
  company?: string;
  city?: string;
  rating: number;
  title?: string;
  body: string;
};

export function Testimonials({ reviews }: { reviews: Testimonial[] }) {
  if (!reviews.length) return null;

  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading eyebrow="In their words" index="07" title="What buyers tell us after delivery" />

        <div className="mt-12 grid gap-5 md:grid-cols-3" data-stagger>
          {reviews.map((review) => (
            <figure
              key={review._id}
              data-anim="up"
              className="flex flex-col rounded-card border border-line bg-porcelain p-6"
            >
              <Quote aria-hidden className="h-5 w-5 text-decart-500" />
              <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-ink-950">
                {review.title || review.body}
              </blockquote>
              {review.title ? (
                <p className="mt-3 text-sm leading-relaxed text-steel-600">{review.body}</p>
              ) : null}
              <div className="mt-5 flex items-center gap-1" aria-label={`${review.rating} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-cognac-500 text-cognac-500' : 'text-line')}
                  />
                ))}
              </div>
              <figcaption className="mt-2 text-sm font-medium text-ink-950">
                {review.name}
                {review.company ? <span className="font-normal text-steel-600"> · {review.company}</span> : null}
                {review.city ? <span className="font-normal text-steel-600"> · {review.city}</span> : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- gallery strip

export function ProjectStrip() {
  const installs = listPublic('gallery/installations').slice(0, 4);
  if (!installs.length) return null;

  return (
    <section className="section bg-porcelain">
      <div className="container-x">
        <SectionHeading
          eyebrow="On site"
          index="06"
          title="Installations"
          action={
            <ButtonLink href="/gallery" variant="secondary">
              Open the gallery
            </ButtonLink>
          }
        />
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4" data-stagger>
          {installs.map((src) => (
            <div key={src} className="relative aspect-square overflow-hidden rounded-img bg-decart-100" data-anim="rise">
              <Image src={src} alt="DecArt installation" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------- cta band

export function QuoteBand() {
  return (
    <section
      className="dark-section relative overflow-hidden py-20 text-white md:py-32"
      style={{ background: 'linear-gradient(128deg, #1E7FC9 0%, #1565A6 55%, #0F4E82 100%)' }}
    >
      <span
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(55% 70% at 50% 0%, rgb(255 255 255 / 0.18), transparent)' }}
      />
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center" data-anim="up">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-decart-100">
            Request quote · WhatsApp · Call
          </p>
          <h2 className="mt-6 font-display text-h1 font-semibold text-white">{COPY.quoteBand.heading}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-decart-100">{COPY.quoteBand.sub}</p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/quote" size="lg" onDark>
              Get a quote
            </ButtonLink>
            <ButtonLink href={waLink(WA.float())} size="lg" variant="whatsapp" data-wa="cta-band">
              WhatsApp us
            </ButtonLink>
          </div>

          <p className="mt-8 font-mono text-xs tracking-[0.08em] text-decart-100">
            <a href={SITE.phoneHref} data-call className="transition-colors hover:text-white">
              {SITE.phone}
            </a>
            <span aria-hidden className="mx-3 text-white/40">·</span>
            {SITE.hours}
          </p>
        </div>
      </div>
    </section>
  );
}
