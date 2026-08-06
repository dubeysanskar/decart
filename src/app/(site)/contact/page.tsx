import type { Metadata } from 'next';
import { Phone, Mail, Clock, MessageCircle, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { LeadForm } from '@/components/forms/LeadForm';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Contact DecArt Industries — Faridabad Office Furniture Manufacturer',
  description:
    'Call +91 93119 42001, WhatsApp us or send an enquiry. DecArt Industries, Plot 230-C, Sector 87, Faridabad, Haryana. Mon–Sat, 9:30 AM – 6:00 PM.',
  path: '/contact',
});

const CARDS = [
  { icon: Phone, label: 'Call', value: SITE.phone, href: SITE.phoneHref, note: 'Sales desk, Mon–Sat' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 93119 42001', href: waLink(WA.float()), note: 'Fastest reply' },
  { icon: Mail, label: 'Email', value: SITE.emailPrimary, href: `mailto:${SITE.emailPrimary}`, note: 'Quotes & documents' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat', href: '', note: '9:30 AM – 6:00 PM IST' },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the people who build it"
        lede="One desk handles quotes, dealer enquiries and after-sales. No call-centre routing."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            const inner = (
              <>
                <Icon aria-hidden className="h-5 w-5 text-decart-600" />
                <span className="mt-3 block text-eyebrow font-semibold uppercase tracking-[0.14em] text-steel-600">
                  {card.label}
                </span>
                <span className="mt-1 block text-[0.9375rem] font-semibold text-ink-950">{card.value}</span>
                <span className="mt-1 block text-xs text-steel-600">{card.note}</span>
              </>
            );
            return card.href ? (
              <a
                key={card.label}
                href={card.href}
                {...(card.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="rounded-card border border-line bg-paper p-5 transition-colors hover:border-decart-300"
              >
                {inner}
              </a>
            ) : (
              <div key={card.label} className="rounded-card border border-line bg-paper p-5">
                {inner}
              </div>
            );
          })}
        </div>
      </PageHeader>

      <section className="section bg-paper">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-h3 text-ink-950">Send an enquiry</h2>
            <p className="mt-3 text-[0.9375rem] text-steel-600">
              Tell us what you are furnishing. If it is a specific model, the quote form carries the code through for you.
            </p>
            <div className="mt-8">
              <LeadForm type="contact" compact />
            </div>
          </div>

          <div className="flex flex-col gap-6">
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
