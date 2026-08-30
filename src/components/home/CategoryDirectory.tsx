import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
 * page", "category ke saath inki images bhi add kar do"). Each of the three groups is a row, and
 * every family inside it is a picture tile that links straight to its category page.
 */
export function CategoryDirectory({ families }: { families: DirectoryFamily[] }) {
  if (!families.length) return null;

  const rows = GROUPS.map((group) => ({
    ...group,
    families: families.filter((family) => family.group === group.slug),
  })).filter((row) => row.families.length);

  if (!rows.length) return null;

  return (
    <section className="section bg-paper">
      <div className="container-x">
        <SectionHeading
          eyebrow="Every range"
          index="02"
          title="Browse every category"
          lede="Thirty families across seating, desking and institutional furniture — each one manufactured in our own factory."
          action={
            <ButtonLink href="/products" variant="secondary">
              All products
              <ArrowRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
          }
        />

        <div className="mt-12 flex flex-col gap-12">
          {rows.map((row) => (
            <div key={row.slug} className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
                <h3 className="font-display text-xl font-semibold text-ink-950 md:text-2xl">{row.name}</h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-steel-400">
                  {row.families.length} categories
                </span>
              </div>

              <div
                className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5"
                data-stagger
              >
                {row.families.map((family) => (
                  <Link
                    key={family.slug}
                    href={`/products/${family.slug}`}
                    data-anim="up"
                    className="group flex min-w-0 flex-col overflow-hidden rounded-card bg-paper shadow-[0_0_0_1px_rgb(227_231_236)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(15_19_23/0.14),0_20px_32px_-20px_rgb(15_19_23/0.32)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-paper">
                      <ProductImage
                        src={family.cover}
                        alt={`DecArt ${family.name}`}
                        label={family.name}
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                        imgClassName="p-3 transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3.5">
                      <h4 className="line-clamp-2 text-[0.875rem] font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                        {family.name}
                      </h4>
                      <span className="mt-auto font-mono text-[10px] tracking-[0.08em] text-steel-400">
                        {family.count} {family.count === 1 ? 'model' : 'models'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
