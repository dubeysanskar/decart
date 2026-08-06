import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionHeading, HexBullet } from '@/components/ui/typography';
import { StatBlock, Badge } from '@/components/ui/bits';
import { QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { listPublic } from '@/lib/assets';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'About DecArt Industries — Office Furniture Manufacturer Since 2015',
  description:
    'DecArt Industries has designed and built office chairs and modular furniture in Faridabad since 2015 — 350+ models across 30 families, manufactured end-to-end in our own facility.',
  path: '/about',
});

const VALUES = [
  { name: 'Integrity', body: 'We say what we do and do what we say.' },
  { name: 'Enduring Relationships', body: 'Clients become repeat clients.' },
  { name: 'Commitment', body: 'Every order, every deadline.' },
  { name: 'Embracing Change', body: 'Workplaces evolve; so do we.' },
  { name: 'Progressive Improvement', body: 'Better products every year.' },
  { name: 'Teamwork', body: 'One factory, one goal.' },
  { name: 'Customer Focus', body: 'Your delight is the spec sheet.' },
];

const MISSION = [
  'Design ergonomic, durable furniture for every kind of workplace.',
  'Manufacture end-to-end in-house so quality is never outsourced.',
  'Deliver pan-India with dependable timelines and honest pricing.',
  'Stand behind every piece with real after-sales service.',
];

export default function AboutPage() {
  const portrait = listPublic('team')[0];

  return (
    <>
      <PageHeader
        eyebrow="About DecArt"
        title="Ten years of building what the working day sits on."
        lede="DecArt Industries Private Limited designs and manufactures office seating and modular furniture in Faridabad, Haryana. Everything critical happens under our own roof."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'About' }]}
      >
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">Est. 2015</Badge>
          <Badge tone="brand">Made in Faridabad</Badge>
          <Badge tone="brand">GST Verified</Badge>
        </div>
      </PageHeader>

      <section className="section bg-paper">
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="prose-decart max-w-none">
            <h2>Our story</h2>
            <p>
              DecArt began in 2015 on a simple observation: workplaces were changing faster than the furniture inside
              them. A four-legged table and a filing cabinet no longer made an office. So we built a factory in
              Faridabad that could make what modern work actually needs — seating engineered for long hours,
              workstations that assemble into any floor plan, and furniture that survives real use.
            </p>
            <p>
              Ten years on, DecArt is a pan-India name in end-to-end chairs and modular furniture, with our own
              manufacturing, a growing dealer network, and installations in some of the country&rsquo;s most demanding
              workplaces.
            </p>

            <h2>What we make</h2>
            <p>
              Everything the working day sits on and works at: director, CEO and executive chairs; ergonomic mesh and
              task seating; visitor, training, café, lounge and auditorium ranges; sofas; workstations and cubicles;
              conference, meeting and reception tables; school furniture; storage, lockers and hostel beds. If a space
              needs it, we either have it in the catalogue — or we build it to order.
            </p>

            <h2>Who we serve</h2>
            <p>
              Corporate offices · Education (schools &amp; universities) · Hospitality (hotels &amp; cafés) ·
              Healthcare · Government &amp; institutions.
            </p>

            <blockquote>
              No over-promises, no under-deliveries. Transparency and honesty are what set us apart — it&rsquo;s why our
              sign says trust.
            </blockquote>
          </div>

          <aside>
            <div className="rounded-card border border-line bg-porcelain p-6">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">
                From the Managing Director
              </p>
              {portrait ? (
                <div className="relative mt-5 aspect-square w-24 overflow-hidden rounded-full">
                  <Image src={portrait} alt="Raghvendra Gupta, Managing Director" fill sizes="96px" className="object-cover" />
                </div>
              ) : null}
              <blockquote className="mt-5 font-display text-lg leading-snug text-ink-950">
                “DecArt rises every day to make workplaces better — offices, homes, schools, hospitality and
                healthcare. Ten-plus years of putting comfort and functionality before everything else have made us a
                leader in modular seating. We value our people first, because valuing people is where valuing
                customers begins — and we measure our success in our customers&rsquo; delight.”
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-ink-950">Raghvendra Gupta</p>
              <p className="text-sm text-steel-600">Managing Director</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section bg-porcelain">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Vision" title="The sign teams look for" />
            <p className="mt-5 text-[1.0625rem] leading-relaxed text-steel-600">
              To be India&rsquo;s most trusted name in workplace seating — the sign teams look for when comfort,
              durability and honesty all have to show up in one chair.
            </p>
          </div>
          <div>
            <SectionHeading eyebrow="Mission" title="Four commitments" />
            <ul className="mt-5 space-y-3">
              {MISSION.map((item) => (
                <li key={item} className="flex gap-3 text-[0.9375rem] leading-relaxed text-steel-600">
                  <HexBullet />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="Core values" title="Seven things we do not negotiate" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <div key={value.name} data-reveal className="rounded-card border border-line bg-porcelain p-5">
                <HexBullet className="mt-0" />
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink-950">{value.name}</h3>
                <p className="mt-1.5 text-sm leading-snug text-steel-600">{value.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid grid-cols-2 gap-8 border-t border-line pt-10 md:grid-cols-4">
            {SITE.counters.map((counter) => (
              <StatBlock key={counter.label} value={counter.value} label={counter.label} />
            ))}
          </div>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
