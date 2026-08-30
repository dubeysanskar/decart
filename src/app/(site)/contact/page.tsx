import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, MapPin, Headphones, IndianRupee, Info } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { LeadForm } from '@/components/forms/LeadForm';
import { ButtonLink } from '@/components/ui/Button';
import { buildMetadata } from '@/lib/seo';
import { CONTACT_DESKS, SITE, type ContactDeskId } from '@/lib/site';
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

type Search = { desk?: string };

export default function ContactPage({ searchParams }: { searchParams: Search }) {
  const desk =
    CONTACT_DESKS.find((option) => option.id === searchParams.desk) ?? CONTACT_DESKS[0];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the people who build it"
        lede="Three desks, one factory. Pick the one that fits and you reach it directly — no call-centre routing."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
      >
        {/* the same tab row as /quote — client asked for it here, for three enquiry desks */}
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

      <section className="section bg-paper">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="font-display text-h3 text-ink-950">{desk.title}</h2>
            <p className="mt-3 text-[0.9375rem] text-steel-600">
              Tell us what you are furnishing. If it is a specific model, the quote form carries the code
              through for you.
            </p>
            <div className="mt-8">
              {/* keyed on the desk so switching tabs gives a clean form, and the lead lands in the
                  admin under the right type */}
              <LeadForm key={desk.id} type={desk.leadType} compact />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            {/* the selected desk's own details, as real mailto:/tel: links */}
            <div className="rounded-card border border-line bg-porcelain p-6">
              <h2 className="font-display text-lg text-ink-950">{desk.title}</h2>
              <p className="mt-2 text-sm text-steel-600">{desk.blurb}</p>

              <dl className="mt-5 flex flex-col gap-4 border-t border-line pt-5">
                <div className="flex items-start gap-3">
                  <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                  <div className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${desk.email}`}
                        className="break-words text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                      >
                        {desk.email}
                      </a>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                  <div className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Phone</dt>
                    <dd className="flex flex-wrap gap-x-3">
                      {desk.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                          className="text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                        >
                          {phone}
                        </a>
                      ))}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                  <div className="min-w-0">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Hours</dt>
                    <dd className="text-[0.9375rem] text-steel-600">{SITE.hours}</dd>
                  </div>
                </div>
              </dl>

              <ButtonLink
                href={waLink(WA.float())}
                variant="whatsapp"
                data-wa="contact-desk"
                className="mt-5 w-full"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                WhatsApp us
              </ButtonLink>
            </div>

            <div className="overflow-hidden rounded-card border border-line">
              <iframe
                title="DecArt Industries on Google Maps"
                src={SITE.mapEmbed}
                width="100%"
                height="320"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block border-0"
              />
            </div>

            <div className="rounded-card border border-line bg-porcelain p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink-950">
                <MapPin aria-hidden className="h-4 w-4 text-decart-600" />
                Office &amp; factory
              </h2>
              <address className="mt-3 not-italic text-[0.9375rem] leading-relaxed text-steel-600">
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
                className="mt-4 inline-block text-sm font-semibold text-decart-700 hover:underline"
              >
                Open in Google Maps →
              </a>
              <p className="mt-5 border-t border-line pt-4 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
                GSTIN {SITE.gstin}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
