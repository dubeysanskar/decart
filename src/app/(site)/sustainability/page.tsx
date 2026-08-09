import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { SectionHeading, HexBullet } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Sustainability — DecArt Industries',
  description:
    'How DecArt Industries builds responsibly: durable-first design, in-house manufacturing that cuts transport, material efficiency, and repairability that keeps chairs out of landfill.',
  path: '/sustainability',
});

/**
 * Written to the §2 golden rule "real content only": every claim here is something the factory
 * genuinely does. No ISO/GREENGUARD marks are asserted — those appear only once the client
 * supplies the certificates (see /certificates).
 */
const PILLARS = [
  {
    title: 'Durability first',
    body: 'The greenest chair is the one nobody replaces. We build to component specifications — Class-4 gas lifts, tested mechanisms, moulded foam that keeps its shape — because a chair that lasts ten years beats one recycled after three.',
  },
  {
    title: 'Repair, don’t replace',
    body: 'Castors, gas lifts, armrests and mechanisms are all replaceable parts we stock. A worn component is a service call, not a new purchase, and we support products long after the warranty ends.',
  },
  {
    title: 'Made where it is sold',
    body: 'Everything is manufactured in Faridabad and delivered across India by surface transport. No sea freight, no imported sub-assemblies for our own ranges, and far fewer transport miles than a comparable import.',
  },
  {
    title: 'Material efficiency',
    body: 'Frames, ply and metalwork are cut in-house, so offcuts are planned into smaller components rather than discarded. Metal offcuts go back to the scrap chain for re-melting.',
  },
  {
    title: 'Packaging that earns its place',
    body: 'Packing is specified to survive Indian roads — because a chair damaged in transit is the most wasteful outcome of all — while keeping material to what the journey actually needs.',
  },
  {
    title: 'Responsible sourcing',
    body: 'Components come from suppliers who can produce test reports for what they sell us. If a supplier cannot document it, we do not fit it.',
  },
];

const COMMITMENTS = [
  'Publish certificates here as they are issued, rather than claiming standards we cannot evidence.',
  'Keep spare parts available for every range we have manufactured.',
  'Quote refurbishment and re-upholstery against replacement wherever the frame is sound.',
  'Take back packaging on project installations where the site allows it.',
];

export default function SustainabilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Built to last is the point."
        lede="We are a manufacturer, not a campaign. This page says exactly what we do about waste, longevity and sourcing — and what we have not certified yet."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Sustainability' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading
            eyebrow="How we build"
            title="Six things that actually reduce waste"
            lede="Ranked by the difference they make, not by how they read in a brochure."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {PILLARS.map((pillar, i) => (
              <article key={pillar.title} data-anim="up" className="min-w-0 bg-paper p-6 md:p-8">
                <span className="font-mono text-xs tracking-[0.14em] text-decart-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-ink-950">{pillar.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-porcelain">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="Commitments"
              title="What we hold ourselves to"
              lede="Short list, kept honest. If something moves from commitment to certificate, it appears on the certificates page."
            />
            <ButtonLink href="/certificates" variant="secondary" className="mt-8">
              See our certificates
            </ButtonLink>
          </div>

          <ul className="min-w-0 space-y-5">
            {COMMITMENTS.map((item) => (
              <li key={item} className="flex gap-3 rounded-card border border-line bg-paper p-5">
                <HexBullet />
                <span className="text-[0.9375rem] leading-relaxed text-steel-600">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
