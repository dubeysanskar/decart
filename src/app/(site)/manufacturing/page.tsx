import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/site/PageHeader';
import { SectionHeading, HexBullet } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/bits';
import { QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { listPublic } from '@/lib/assets';
import { waLink, WA } from '@/lib/whatsapp';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Manufacturing — In-House Chair & Furniture Production, Faridabad',
  description:
    'Inside DecArt’s Faridabad facility: frame fabrication, upholstery, assembly and QC under one roof, with BIFMA/SGS-tested components and pan-India dispatch.',
  path: '/manufacturing',
});

const STEPS = [
  {
    title: 'Design',
    body: 'Ergonomics, frame geometry and finish are planned against how the product will really be used — an eight-hour task chair and a two-hour visitor chair are not the same problem.',
  },
  {
    title: 'Fabricate',
    body: 'Frames, ply and metalwork are made and finished in-house. Powder coating is done to our shade card, not to whatever the vendor had that week.',
  },
  {
    title: 'Upholster & assemble',
    body: 'High-density moulded PU foam, mesh and leatherette tapestry fitted by hand. Mesh tension is set on a jig so the back feels the same on unit 1 and unit 500.',
  },
  {
    title: 'Test & pack',
    body: 'BIFMA/SGS-tested components, per-piece checks on mechanism, gas lift and castors, and packing designed to survive Indian road freight.',
  },
];

const CAPABILITIES = [
  { title: 'In-house frames', body: 'MS tube and ply frame fabrication, jigs held per model.' },
  { title: 'Upholstery floor', body: 'Cutting, stitching and fitting for leatherette, fabric and mesh.' },
  { title: 'Powder coating', body: 'Eight standard shades; custom shades on project quantities.' },
  { title: 'Tested components', body: 'BIFMA/SGS-tested castors, gas lifts and mechanisms (catalogue p.44).' },
  { title: 'Modular desking', body: 'Linear workstations and cubicles cut to your floor plan.' },
  { title: 'OEM capacity', body: 'We manufacture to other brands’ specifications under NDA.' },
];

export default function ManufacturingPage() {
  const factory = listPublic('factory');

  return (
    <>
      <PageHeader
        eyebrow="Manufacturing"
        title="Nothing critical leaves the building."
        lede="One facility in Faridabad handles design, fabrication, upholstery, assembly and QC. That is the only reason we can quote a specification and then actually ship it."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Manufacturing' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="How we build" title="Four steps, in order" />
          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <li key={step.title} data-reveal className="rounded-card border border-line bg-porcelain p-6">
                <span className="font-mono text-xs tracking-[0.1em] text-decart-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-ink-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section bg-porcelain">
        <div className="container-x">
          <SectionHeading eyebrow="Capability" title="What the factory can take on" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <div key={item.title} data-reveal className="rounded-card border border-line bg-paper p-5">
                <HexBullet className="mt-0" />
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-ink-950">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-snug text-steel-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="On the floor" title="Inside the facility" />
          {factory.length ? (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {factory.map((src) => (
                <div key={src} className="hex-frame relative aspect-[4/3] overflow-hidden bg-ink-900" data-reveal>
                  <Image
                    src={src}
                    alt="DecArt manufacturing floor, Faridabad"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-10"
              title="Factory photography coming"
              body="Drop images into /public/factory and this gallery fills itself. Until then, you are welcome to visit — we will show you the floor."
              action={
                <>
                  <ButtonLink href="/contact">Arrange a visit</ButtonLink>
                  <ButtonLink href={waLink(WA.float())} variant="whatsapp" data-wa="manufacturing">
                    WhatsApp us
                  </ButtonLink>
                </>
              }
            />
          )}

          <div className="mt-12 rounded-card border border-line bg-porcelain p-6 md:p-8">
            <h2 className="font-display text-h3 text-ink-950">Quality, stated plainly</h2>
            <p className="mt-4 max-w-3xl text-[0.9375rem] leading-relaxed text-steel-600">
              We publish the component spec on every product page — mechanism, gas lift class, base material, castor
              size. If a quotation deviates from the catalogue spec, it says so on the quotation. Manufacturing
              defects are resolved by repair or replacement of the affected part or unit, per the warranty terms on
              your order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/quote?type=oem">OEM with us</ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Visit the factory
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
