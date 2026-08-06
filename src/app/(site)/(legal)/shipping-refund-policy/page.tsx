import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Shipping & Refund Policy',
  description:
    'Dispatch timelines, pan-India freight, transit damage claims, defect resolution and cancellation terms for DecArt Industries orders.',
  path: '/shipping-refund-policy',
});

export default function ShippingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Shipping &amp; Refund Policy"
        lede="Last updated 2 August 2026"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Shipping & Refunds' }]}
      />
      <section className="section bg-paper">
        <div className="container-x">
          <div className="prose-decart mx-auto max-w-[68ch]">
            <h2>Made to order</h2>
            <p>
              DecArt is a business-to-business manufacturer. Almost everything we ship is produced against a
              confirmed order rather than pulled from stock.
            </p>

            <h2>Dispatch timelines</h2>
            <p>
              Typical dispatch is 2–4 weeks depending on quantity and customisation. The timeline that applies to
              your order is confirmed on your quotation and takes precedence over this page.
            </p>

            <h2>Freight and delivery</h2>
            <p>
              We deliver pan-India by surface transport. Freight and unloading are charged as stated on the
              quotation. Delivery is to the site address on the purchase order.
            </p>

            <h2>Transit damage and shortages</h2>
            <p>
              Please inspect the consignment on delivery. Report transit damage or shortages within 48 hours with
              photographs so we can raise the claim and replace the affected items.
            </p>

            <h2>Manufacturing defects</h2>
            <p>
              Manufacturing defects are resolved by repair or replacement of the affected part or unit first, per the
              warranty terms applicable to your order. Component warranties (mechanisms, gas lifts, castors) are as
              stated on the quotation.
            </p>

            <h2>Cancellations</h2>
            <p>
              Cancellations are accepted only before production starts. Advances against custom production are
              non-refundable once materials have been cut.
            </p>

            <h2>Returns</h2>
            <p>Returns are not accepted on customised goods except in the case of a verified manufacturing defect.</p>

            <h2>Raising a claim</h2>
            <p>
              Write to <a href={`mailto:${SITE.emailPrimary}`}>{SITE.emailPrimary}</a> or call{' '}
              <a href={SITE.phoneHref}>{SITE.phone}</a> with your order reference and photographs.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
