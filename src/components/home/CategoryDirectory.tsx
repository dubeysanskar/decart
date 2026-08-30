import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { GROUPS } from '@/lib/catalogue';

export type DirectoryFamily = {
  slug: string;
  name: string;
  group: string;
  count: number;
  lede: string;
  cover: string;
};

/**
 * The full category directory (client brief: "multiple category display and sub display at home
 * page", "category ke saath inki images bhi add kar do").
 *
 * The products are cut out on white, so the staging has to come from the card rather than a
 * tinted well: a soft spotlight that fades out before it reaches an edge, a ground shadow under
 * the product, and a hover state that lifts the card and slides an arrow in. No hard rectangle
 * anywhere — that was the "box inside a box" problem.
 */
export function CategoryDirectory({ families }: { families: DirectoryFamily[] }) {
  if (!families.length) return null;

  const rows = GROUPS.map((group) => ({
    ...group,
    families: families.filter((family) => family.group === group.slug),
  })).filter((row) => row.families.length);

  if (!rows.length) return null;

  return (
    <section className="bg-paper pt-12 md:pt-16">
      <div className="container-x">
        <SectionHeading
          eyebrow="Every range"
          index="01"
          title="Browse every category"
          lede="Thirty families across seating, desking and institutional furniture — each one manufactured in our own factory."
          action={
            <ButtonLink href="/products" variant="secondary">
              All products
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          }
        />

      </div>

      {/* each group is its own band; alternating grounds give the run some rhythm instead of
          one uninterrupted wall of white cards */}
      <div className="mt-8 flex flex-col">
        {rows.map((row, rowIndex) => (
          <div
            key={row.slug}
            className={rowIndex % 2 === 1 ? 'bg-porcelain py-10 md:py-12' : 'bg-paper py-10 md:py-12'}
          >
            <div className="container-x min-w-0">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex min-w-0 items-baseline gap-4">
                  <span className="font-display text-4xl font-semibold leading-none text-decart-600/25 md:text-5xl">
                    {String(rowIndex + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-semibold text-ink-950 md:text-3xl">{row.name}</h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                      {row.families.length} categories ·{' '}
                      {row.families.reduce((sum, family) => sum + family.count, 0)} models
                      <span className="ml-2 lg:hidden">· swipe →</span>
                    </p>
                  </div>
                </div>
                <span aria-hidden className="hidden h-px flex-1 bg-line md:block" />
              </div>

              {/* one swipeable row per group instead of a 5-column wall. Every family in the
                  group is still here — the block just stopped being a quarter of the page. */}
              <div
                className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:-mx-7 md:px-7 lg:mx-0 lg:gap-5 lg:px-0"
                data-stagger="0.05"
              >
                {row.families.map((family) => (
                  <Link
                    key={family.slug}
                    href={`/products/${family.slug}`}
                    data-anim="rise"
                    className="group relative flex w-[46vw] shrink-0 snap-start flex-col overflow-hidden rounded-card bg-paper ring-1 ring-line transition-all duration-300 hover:-translate-y-1.5 hover:ring-decart-300 hover:shadow-[0_22px_38px_-22px_rgb(15_19_23/0.35)] sm:w-[240px] lg:w-[212px]"
                  >
                    {/* a spotlight that fades to nothing before the card edge — stages the
                        cut-out without drawing a second box around it */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <span
                        aria-hidden
                        className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            'radial-gradient(60% 55% at 50% 45%, rgb(88 181 224 / 0.10), transparent 70%)',
                        }}
                      />
                      <ProductImage
                        src={family.cover}
                        alt={`DecArt ${family.name}`}
                        label={family.name}
                        sizes="(max-width: 640px) 46vw, (max-width: 1024px) 240px, 212px"
                        imgClassName="p-4 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.05]"
                      />
                      {/* ground shadow so the product sits on something */}
                      <span
                        aria-hidden
                        className="absolute bottom-4 left-1/2 h-2 w-1/2 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-md transition-all duration-500 group-hover:w-[56%] group-hover:bg-ink-950/[0.14]"
                      />
                    </div>

                    <div className="flex flex-1 items-end justify-between gap-2 border-t border-line p-4">
                      <div className="min-w-0">
                        <h4 className="line-clamp-2 text-[0.875rem] font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                          {family.name}
                        </h4>
                        <span className="mt-1 block font-mono text-[10px] tracking-[0.08em] text-steel-400">
                          {family.count} {family.count === 1 ? 'model' : 'models'}
                        </span>
                      </div>
                      <span
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 translate-x-1 items-center justify-center rounded-full bg-decart-50 text-decart-700 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
