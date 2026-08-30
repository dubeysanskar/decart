import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, MapPin, Headphones, IndianRupee, Info } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { LeadForm } from '@/components/forms/LeadForm';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';
import { CONTACT_DESKS, CONTACT_SUBJECTS, SITE, type ContactDeskId } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Contact DecArt Furniture — Faridabad Office Furniture Manufacturer',
  description:
    'General, sales and support enquiries for DecArt Industries. Call +91 93119 42001, WhatsApp us or send an enquiry. Plot 230-C, Sector 87, Faridabad, Haryana. Mon–Sat, 9:30 AM – 6:00 PM.',
  path: '/contact',
});

const DESK_ICON: Record<ContactDeskId, typeof Info> = {
  general: Info,
  sales: IndianRupee,
  support: Headphones,
};

/**
 * Desks that share a number or an inbox collapse into one row, so the block reads
 * "General · Sales · Support" against a single line rather than printing the same number
 * three times. As soon as the client gives each desk its own line (the NEXT_PUBLIC_PHONE_*
 * and NEXT_PUBLIC_EMAIL_* vars), the rows split apart on their own.
 */
function collapse(entries: { label: string; value: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const entry of entries) {
    grouped.set(entry.value, [...(grouped.get(entry.value) ?? []), entry.label]);
  }
  return [...grouped.entries()].map(([value, labels]) => ({ value, label: labels.join(' · ') }));
}

const deskName = (title: string) => title.replace(/\s*Enquiry$/i, '');

type Search = { desk?: string };

export default function ContactPage({ searchParams }: { searchParams: Search }) {
  const desk = CONTACT_DESKS.find((option) => option.id === searchParams.desk) ?? CONTACT_DESKS[0];

  const phoneRows = collapse(
    CONTACT_DESKS.map((option) => ({ label: deskName(option.title), value: option.phones[0] })),
  );
  const emailRows = collapse(
    CONTACT_DESKS.map((option) => ({ label: deskName(option.title), value: option.email })),
  );

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the people who build it"
        lede="Three desks, one factory. Pick the one that fits and you reach it directly — no call-centre routing."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {CONTACT_DESKS.map((option) => {
            const Icon = DESK_ICON[option.id];
            const active = option.id === desk.id;
            return (
              <Link
                key={option.id}
                href={`/contact?desk=${option.id}`}
                scroll={false}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'flex min-w-0 flex-col gap-2 rounded-card border p-4 transition-colors',
                  active
                    ? 'border-ink-900 bg-ink-900 text-porcelain'
                    : 'border-line bg-paper text-ink-900 hover:border-ink-800',
                )}
              >
                <Icon aria-hidden className={cn('h-5 w-5', active ? 'text-decart-300' : 'text-steel-600')} />
                <span className="text-sm font-semibold">{option.title}</span>
                <span className={cn('text-xs leading-snug', active ? 'text-steel-400' : 'text-steel-600')}>
                  {option.blurb}
                </span>
              </Link>
            );
          })}
        </div>
      </PageHeader>

      {/* every way in, visible at once — nothing important hidden behind a tab */}
      <section className="border-b border-line bg-paper py-12 md:py-14">
        <div className="container-x grid gap-8 md:grid-cols-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
              <Phone aria-hidden className="h-4 w-4 text-decart-600" />
              Call
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              {phoneRows.map((row) => (
                <div key={row.value}>
                  <dt className="text-xs text-steel-600">{row.label}</dt>
                  <dd>
                    <a
                      href={`tel:${row.value.replace(/[^+\d]/g, '')}`}
                      className="text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                    >
                      {row.value}
                    </a>
                  </dd>
                </div>
              ))}
              <p className="mt-1 flex items-center gap-2 text-xs text-steel-600">
                <Clock aria-hidden className="h-3.5 w-3.5 shrink-0" />
                {SITE.hours}
              </p>
            </dl>
          </div>

          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
              <Mail aria-hidden className="h-4 w-4 text-decart-600" />
              Email
            </h2>
            <dl className="mt-4 flex flex-col gap-3">
              {emailRows.map((row) => (
                <div key={row.value} className="min-w-0">
                  <dt className="text-xs text-steel-600">{row.label}</dt>
                  <dd>
                    <a
                      href={`mailto:${row.value}`}
                      className="break-words text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                    >
                      {row.value}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
            <ButtonLink
              href={waLink(WA.float())}
              variant="whatsapp"
              size="sm"
              data-wa="contact-band"
              className="mt-5"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              WhatsApp us
            </ButtonLink>
          </div>

          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
              <MapPin aria-hidden className="h-4 w-4 text-decart-600" />
              Location
            </h2>
            <address className="mt-4 not-italic text-[0.9375rem] leading-relaxed text-steel-600">
              {SITE.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-decart-700 hover:underline"
            >
              Open in Google Maps →
            </a>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
              GSTIN {SITE.gstin}
            </p>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="font-display text-h3 text-ink-950">Write to us</h2>
            <p className="mt-3 text-[0.9375rem] text-steel-600">
              This goes to the <strong className="font-semibold text-ink-950">{desk.title.toLowerCase()}</strong> desk
              — switch the card above to send it somewhere else. Tell us what you are furnishing; if it is a
              specific model, the quote form carries the code through for you.
            </p>
            <div className="mt-8">
              {/* keyed on the desk so switching gives a clean form, and the lead lands in the
                  admin under the right type */}
              <LeadForm
                key={desk.id}
                type={desk.leadType}
                compact
                subjects={CONTACT_SUBJECTS}
                alwaysAskCompany
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <div className="overflow-hidden rounded-card border border-line">
              <iframe
                title="DecArt Industries on Google Maps"
                src={SITE.mapEmbed}
                width="100%"
                height="420"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block border-0"
              />
            </div>

            <div className="rounded-card border border-line bg-porcelain p-6">
              <h2 className="font-display text-lg text-ink-950">Visiting the factory</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel-600">
                Buyers are welcome on the floor — it is the shortest way to judge a manufacturer. Call ahead
                so somebody who can answer your questions is free when you arrive.
              </p>
              <ButtonLink href={SITE.phoneHref} variant="secondary" size="sm" className="mt-5">
                <Phone aria-hidden className="h-4 w-4" />
                Call {SITE.phone}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
