import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Package, Handshake, Factory, Wrench, Clock, MessageCircle } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { LeadForm } from '@/components/forms/LeadForm';
import { Accordion } from '@/components/ui/Accordion';
import { ButtonLink } from '@/components/ui/Button';
import { getNavFamilies, getProduct } from '@/lib/catalogue';
import { buildMetadata } from '@/lib/seo';
import { COPY, LEAD_TYPES, SITE, type LeadType } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Get a Quote — Bulk, Dealer, OEM & Custom Chair Enquiries',
  description:
    'Request a quotation from DecArt Industries: single pieces, bulk floors, dealer and distributor enquiries, OEM manufacturing or a custom chair built to your reference.',
  path: '/quote',
});

const INTENTS: { type: LeadType; title: string; blurb: string; icon: typeof FileText }[] = [
  { type: 'quote', title: 'Request a quote', blurb: 'A model, a quantity, a city — we price it.', icon: FileText },
  { type: 'bulk', title: 'Bulk order', blurb: 'Full floors, campuses and fit-outs.', icon: Package },
  { type: 'dealer', title: 'Dealer / distributor', blurb: 'Stock and sell DecArt in your city.', icon: Handshake },
  { type: 'oem', title: 'OEM manufacturing', blurb: 'We build to your brand and spec.', icon: Factory },
  { type: 'custom', title: 'Custom chair', blurb: 'Send a reference — we engineer it.', icon: Wrench },
];

type Search = { type?: string; product?: string; code?: string };

export default async function QuotePage({ searchParams }: { searchParams: Search }) {
  const requested = (LEAD_TYPES as readonly string[]).includes(searchParams.type ?? '')
    ? (searchParams.type as LeadType)
    : 'quote';
  const type: LeadType = requested === 'contact' ? 'quote' : requested;

  const [families, product] = await Promise.all([
    getNavFamilies(),
    searchParams.product ? getProduct(searchParams.product) : Promise.resolve(null),
  ]);

  const intent = INTENTS.find((i) => i.type === type) ?? INTENTS[0];

  return (
    <>
      <PageHeader
        eyebrow="Get a quote"
        title={intent.title}
        lede={
          product
            ? `Quoting ${product.name} (${product.code}). Send quantities and a site city and we come back the same working day.`
            : 'Tell us what the space needs. Most quotes go out the same working day — faster if you send it on WhatsApp.'
        }
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Get a quote' }]}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {INTENTS.map((option) => {
            const Icon = option.icon;
            const active = option.type === type;
            return (
              <Link
                key={option.type}
                href={`/quote?type=${option.type}${searchParams.product ? `&product=${searchParams.product}` : ''}`}
                scroll={false}
                className={cn(
                  'flex flex-col gap-2 rounded-card border p-4 transition-colors',
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
        <div className="container-x grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <LeadForm
              key={type}
              type={type}
              families={families.map((f) => ({ slug: f.slug, name: f.name }))}
              productSlug={product?.slug ?? ''}
              productCode={product?.code ?? searchParams.code ?? ''}
              productName={product?.name ?? ''}
            />
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-card border border-line bg-porcelain p-6">
              <h2 className="font-display text-xl text-ink-950">In a hurry?</h2>
              <p className="mt-3 text-sm leading-relaxed text-steel-600">
                WhatsApp reaches the same desk, usually within the hour during working hours.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink href={waLink(WA.float())} variant="whatsapp" data-wa="quote-aside">
                  <MessageCircle aria-hidden className="h-4 w-4" />
                  WhatsApp us
                </ButtonLink>
                <ButtonLink href={SITE.phoneHref} variant="secondary">
                  Call {SITE.phone}
                </ButtonLink>
              </div>
              <p className="mt-5 flex items-start gap-2 text-xs text-steel-600">
                <Clock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {SITE.hours}
              </p>
            </div>

            <div className="rounded-card border border-line p-6">
              <h2 className="font-display text-lg text-ink-950">Common questions</h2>
              <Accordion
                className="mt-3 border-t-0"
                items={COPY.quoteFaq.map((faq, i) => ({ id: `faq-${i}`, title: faq.q, content: <p>{faq.a}</p> }))}
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
