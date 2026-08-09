import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { SectionHeading, HexBullet } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';
import { waLink } from '@/lib/whatsapp';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Careers at DecArt Industries — Faridabad',
  description:
    'Join DecArt Industries in Faridabad. Openings across production, upholstery, quality, design, sales and dispatch at an office furniture manufacturer building end-to-end in-house.',
  path: '/career',
});

/**
 * Openings are listed as standing areas of hiring rather than dated vacancies — the client
 * hires continuously and a stale "posted 8 months ago" list reads worse than none. Swap this
 * array when specific roles need advertising.
 */
const AREAS = [
  {
    title: 'Production & assembly',
    body: 'Frame fabrication, welding, powder-coat handling and chair assembly. Experience with furniture or sheet-metal lines is an advantage; we train on our own processes.',
  },
  {
    title: 'Upholstery',
    body: 'Cutting, stitching and fitting leatherette, fabric and mesh over moulded foam. Skilled hands matter more than paperwork here.',
  },
  {
    title: 'Quality & dispatch',
    body: 'Per-piece checks against the specification, packing that survives Indian roads, and keeping the despatch schedule honest.',
  },
  {
    title: 'Design & product development',
    body: 'Ergonomics, frame geometry and finish planning. CAD skills plus a feel for how a chair is actually used through a ten-hour day.',
  },
  {
    title: 'Sales & business development',
    body: 'B2B seating and desking projects for corporates, campuses and institutions across India. Furniture or interiors background preferred.',
  },
  {
    title: 'Accounts & administration',
    body: 'Billing, GST compliance, vendor coordination and the day-to-day running of a manufacturing office.',
  },
];

const REASONS = [
  'A factory that makes the whole product — you see a chair from tube to packing, not one slice of it.',
  'Ten years of steady growth and a client list spanning corporates, universities, hotels and hospitals.',
  'Small enough that good work is noticed, structured enough that it is paid on time.',
  'Training on the job: most of our supervisors started on the line.',
];

export default function CareerPage() {
  const applyMessage = waLink(
    'Hello DecArt team, I would like to apply for a role. Name: \nRole of interest: \nExperience: \nCity: ',
  );

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Build what people sit on."
        lede="DecArt Industries has manufactured office seating and furniture in Faridabad since 2015. We hire for the floor, the design desk and everything in between."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Career' }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`mailto:${SITE.emailPrimary}?subject=Application%20—%20DecArt%20Industries`} size="lg">
            Email your CV
          </ButtonLink>
          <ButtonLink href={applyMessage} size="lg" variant="whatsapp" data-wa="career">
            Apply on WhatsApp
          </ButtonLink>
        </div>
      </PageHeader>

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading
            eyebrow="Where we hire"
            title="Areas we are usually hiring for"
            lede="We recruit through the year rather than in bursts. If your work fits one of these, send a CV — we keep them on file and call when a seat opens."
          />

          <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-2 lg:grid-cols-3" data-stagger>
            {AREAS.map((area) => (
              <article key={area.title} data-anim="up" className="min-w-0 bg-paper p-6 md:p-7">
                <h3 className="text-lg font-semibold text-ink-950">{area.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{area.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-porcelain">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <SectionHeading eyebrow="Why DecArt" title="What you get working here" />
            <ul className="mt-8 space-y-4">
              {REASONS.map((reason) => (
                <li key={reason} className="flex gap-3">
                  <HexBullet />
                  <span className="text-[0.9375rem] leading-relaxed text-steel-600">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 rounded-card border border-line bg-paper p-6 md:p-8">
            <h3 className="font-display text-h3 text-ink-950">How to apply</h3>
            <ol className="mt-6 space-y-5">
              {[
                {
                  n: '01',
                  title: 'Send your CV',
                  body: `Email it to ${SITE.emailPrimary} with the role in the subject line, or WhatsApp it — both reach the same desk.`,
                },
                {
                  n: '02',
                  title: 'A short call',
                  body: 'We call within a few working days if the fit looks right, and tell you plainly if it does not.',
                },
                {
                  n: '03',
                  title: 'Meet us at the factory',
                  body: 'Shop-floor roles include a practical trial. Office roles meet the team they would work with.',
                },
              ].map((step) => (
                <li key={step.n} className="flex gap-4">
                  <span className="mt-0.5 font-mono text-xs tracking-[0.1em] text-decart-600">{step.n}</span>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-ink-950">{step.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed text-steel-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 border-t border-line pt-6">
              <p className="text-sm text-steel-600">Careers desk</p>
              <a
                href={`mailto:${SITE.emailPrimary}`}
                className="mt-1 block font-semibold text-decart-700 hover:underline"
              >
                {SITE.emailPrimary}
              </a>
              <a href={SITE.phoneHref} data-call className="mt-1 block font-mono text-sm text-ink-900">
                {SITE.phone}
              </a>
              <p className="mt-3 text-sm text-steel-600">{SITE.addressFactory}</p>
            </div>
          </div>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
