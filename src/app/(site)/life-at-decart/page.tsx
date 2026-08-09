import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { buildMetadata } from '@/lib/seo';
import { listPublic } from '@/lib/assets';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Life at DecArt — the people behind the products',
  description:
    'Inside DecArt Industries in Faridabad: the teams who design, fabricate, upholster and ship office seating, and what a working day actually looks like on the floor.',
  path: '/life-at-decart',
});

const VALUES = [
  { title: 'Integrity', body: 'We say what we do and do what we say.' },
  { title: 'Enduring relationships', body: 'Clients become repeat clients.' },
  { title: 'Commitment', body: 'Every order, every deadline.' },
  { title: 'Embracing change', body: 'Workplaces evolve; so do we.' },
  { title: 'Progressive improvement', body: 'Better products every year.' },
  { title: 'Teamwork', body: 'One factory, one goal.' },
  { title: 'Customer focus', body: 'Your delight is the spec sheet.' },
];

const TEAMS = [
  {
    name: 'Design',
    body: 'Where a chair starts: ergonomics, frame geometry and finish planned against how the product will really be used.',
  },
  {
    name: 'Fabrication',
    body: 'Tube bending, welding and metalwork. The frames every other department builds on.',
  },
  {
    name: 'Upholstery',
    body: 'The most hands-on floor in the building — foam, mesh and leatherette fitted by people who have done it for years.',
  },
  {
    name: 'Quality & dispatch',
    body: 'Per-piece checks, then packing that has to survive a truck to Guwahati or Kochi.',
  },
  {
    name: 'Sales & service',
    body: 'One desk owns the relationship: the number you call for a quote is the number you call two years later.',
  },
];

export default function LifeAtDecArtPage() {
  const factory = listPublic('factory');
  const team = listPublic('team');
  const gallery = [...team, ...factory].slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Life at DecArt."
        lede="Ten years of building seating in Faridabad, by a team that mostly learned it here. This is who makes your chairs."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Life at DecArt' }]}
      />

      <section className="section bg-paper">
        <div className="container-x grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="hex-frame relative aspect-[4/3] min-w-0 overflow-hidden rounded-img bg-porcelain" data-anim="up">
            <ProductImage
              src={factory[0]}
              alt="The DecArt Industries manufacturing floor in Faridabad"
              label="Factory photography"
              fit="cover"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>

          <div className="min-w-0" data-anim="up">
            <SectionHeading
              eyebrow="The floor"
              title="One roof, every stage"
              lede="Design, fabrication, upholstery, assembly, quality and dispatch all happen in the same building. Nothing critical is outsourced — which is why a problem gets solved by walking twenty metres rather than making a phone call."
            />
            <p className="mt-6 text-[0.9375rem] leading-relaxed text-steel-600">
              Most of our supervisors started on the line. We train on our own processes, promote from inside where we
              can, and keep teams small enough that good work is noticed.
            </p>
            <ButtonLink href="/career" className="mt-8">
              See open roles
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section bg-porcelain">
        <div className="container-x">
          <SectionHeading
            eyebrow="Teams"
            title="Who does what"
            lede="Five groups, one product. A chair passes through all of them before it is boxed."
          />
          <ul className="mt-12 border-t border-line" data-stagger>
            {TEAMS.map((team) => (
              <li
                key={team.name}
                data-anim="up"
                className="flex flex-col gap-2 border-b border-line py-7 md:flex-row md:items-baseline md:gap-8"
              >
                <span className="font-display text-xl font-semibold text-ink-950 md:w-[30%] md:text-2xl">
                  {team.name}
                </span>
                <span className="min-w-0 flex-1 text-[0.9375rem] leading-relaxed text-steel-600">{team.body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container-x">
          <SectionHeading eyebrow="Values" title="The seven we actually quote at each other" />
          <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line sm:grid-cols-2 lg:grid-cols-4" data-stagger>
            {VALUES.map((value) => (
              <div key={value.title} data-anim="up" className="min-w-0 bg-paper p-6">
                <h3 className="text-base font-semibold text-ink-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{value.body}</p>
              </div>
            ))}
            <div className="min-w-0 bg-porcelain p-6">
              <p className="text-sm leading-relaxed text-steel-600">
                “We value our people first, because valuing people is where valuing customers begins.”
              </p>
              <p className="mt-3 text-sm font-semibold text-ink-950">Raghvendra Gupta</p>
              <p className="text-xs text-steel-600">Managing Director</p>
            </div>
          </div>
        </div>
      </section>

      {gallery.length ? (
        <section className="section bg-porcelain">
          <div className="container-x">
            <SectionHeading eyebrow="Inside" title="Around the factory" />
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3" data-stagger>
              {gallery.map((src) => (
                <div key={src} data-anim="up" className="hex-frame relative aspect-[4/3] min-w-0 overflow-hidden bg-ink-900">
                  <Image
                    src={src}
                    alt="Inside DecArt Industries, Faridabad"
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line bg-paper py-14">
        <div className="container-x flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="min-w-0">
            <h2 className="font-display text-h3 text-ink-950">Want to join?</h2>
            <p className="mt-2 text-steel-600">
              Send a CV to {SITE.emailPrimary} — we keep them on file and call when a seat opens.
            </p>
          </div>
          <ButtonLink href="/career" size="lg">
            View careers
          </ButtonLink>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
