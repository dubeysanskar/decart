import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { Testimonials, QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { getFeaturedReviews } from '@/lib/catalogue';
import { listPublic } from '@/lib/assets';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Clients & Testimonials — DecArt Industries',
  description:
    'Corporates, universities, hotels and hospitals across India furnish with DecArt. See the client wall, read reviews, or apply to become a DecArt dealer.',
  path: '/clients',
});

export default async function ClientsPage() {
  const [logos, reviews] = await Promise.all([Promise.resolve(listPublic('clients')), getFeaturedReviews(9)]);

  return (
    <>
      <PageHeader
        eyebrow="Clients"
        title="Floors we have furnished."
        lede="Corporates, campuses, hotels and hospitals across India. Logos are shown with permission; we do not publish client statements without it."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Clients' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {logos.length ? (
            <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-6">
              {logos.map((src) => (
                <div key={src} className="flex h-20 items-center justify-center rounded-card border border-line p-4">
                  <Image
                    src={src}
                    alt=""
                    width={110}
                    height={48}
                    className="max-h-10 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-card border border-line bg-porcelain p-8">
              <SectionHeading eyebrow="Trusted by" title="Teams across India" />
              <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
                {SITE.clients.map((client) => (
                  <li key={client} className="text-sm text-steel-600">
                    {client}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-steel-400">
                Logo files drop into <code className="font-mono">/public/clients</code> and replace this list
                automatically.
              </p>
            </div>
          )}

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SITE.segments.map((segment) => (
              <div key={segment.name} className="rounded-card border border-line bg-porcelain p-5">
                <h2 className="text-[0.9375rem] font-semibold text-ink-950">{segment.name}</h2>
                <p className="mt-1.5 text-sm leading-snug text-steel-600">{segment.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Testimonials reviews={reviews as never} />

      <section className="section bg-porcelain">
        <div className="container-x rounded-card border border-line bg-paper p-8 md:p-12">
          <SectionHeading
            eyebrow="Partner with us"
            title="Become a DecArt dealer"
            lede="We are adding distribution across India. If you sell office furniture in your city, we would like to talk — pricing, stocking support and lead sharing included."
            action={<ButtonLink href="/quote?type=dealer">Apply as a dealer</ButtonLink>}
          />
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
