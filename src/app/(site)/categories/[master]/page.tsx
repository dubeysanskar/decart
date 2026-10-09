import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/site/PageHeader';
import { CategoryTile } from '@/components/catalogue/CategoryTile';
import { QuoteBand } from '@/components/home/sections';
import { getMaster, getTaxonomy } from '@/lib/taxonomy';
import { buildMetadata, breadcrumbLd } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { master: string } }): Promise<Metadata> {
  const master = await getMaster(params.master);
  if (!master) return {};
  return buildMetadata({
    title: `${master.name} — Office Furniture Categories | DecArt Furniture`,
    description:
      master.intro ||
      `${master.name} from DecArt Industries, Faridabad: ${master.categories
        .slice(0, 6)
        .map((c) => c.name)
        .join(', ')}. Built to order, delivered pan-India.`,
    path: `/categories/${master.slug}`,
  });
}

export default async function MasterCategoryPage({ params }: { params: { master: string } }) {
  const [master, all] = await Promise.all([getMaster(params.master), getTaxonomy()]);
  if (!master) notFound();

  const others = all.filter((m) => m.slug !== master.slug);

  return (
    <>
      <PageHeader
        eyebrow="Master category"
        title={master.name}
        lede={
          master.intro ||
          `${master.categories.length} ${master.categories.length === 1 ? 'category' : 'categories'}${
            master.count ? ` and ${master.count} models` : ''
          }, every one built to order in Faridabad — finish, mechanism and size to your specification.`
        }
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Products', href: '/products' },
          { name: master.name },
        ]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4" data-stagger="0.05">
            {master.categories.map((category, i) => (
              <CategoryTile key={category.slug} category={category} priority={i < 4} />
            ))}
          </div>

          {others.length ? (
            <div className="mt-14 border-t border-line pt-8">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">
                Other master categories
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {others.map((other) => (
                  <Link
                    key={other.slug}
                    href={other.href}
                    className="rounded-full border border-line bg-paper px-4 py-2 text-sm text-ink-900 hover:border-decart-300 hover:text-decart-700"
                  >
                    {other.name}
                    <span className="ml-2 font-mono text-[10px] text-steel-400">{other.categories.length}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <QuoteBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Products', path: '/products' },
              { name: master.name, path: master.href },
            ]),
          ),
        }}
      />
    </>
  );
}
