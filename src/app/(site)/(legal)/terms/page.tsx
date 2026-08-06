import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Terms & Conditions',
  description: 'Terms governing the use of the DecArt Industries website, quotations and orders.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms &amp; Conditions"
        lede="Last updated 2 August 2026"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Terms' }]}
      />
      <section className="section bg-paper">
        <div className="container-x">
          <div className="prose-decart mx-auto max-w-[68ch]">
            <h2>Site content</h2>
            <p>
              The content on this website is informational. <strong>Product designs and specifications are subject to
              change without prior notice.</strong> Images are indicative; finishes, shades and textures may vary
              between production batches and between a screen and the physical product.
            </p>

            <h2>Quotations</h2>
            <p>
              Quotations are valid for 15 days from the date of issue unless stated otherwise on the quotation
              itself. Pricing depends on quantity, finish, build options and freight.
            </p>

            <h2>Orders</h2>
            <p>
              Orders are confirmed against an advance or a purchase order, as stated on the quotation. Production
              begins once the confirmation and any required advance are received.
            </p>

            <h2>Intellectual property</h2>
            <p>
              All content, images, model codes and the DecArt marks on this site belong to {SITE.legalName}. They may
              not be reproduced without written permission.
            </p>

            <h2>Liability</h2>
            <p>Our liability in connection with any order is limited to the value of that order.</p>

            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of India. Courts at Faridabad, Haryana have exclusive
              jurisdiction.
            </p>

            <h2>Contact</h2>
            <p>
              {SITE.legalName} · GSTIN {SITE.gstin}
              <br />
              {SITE.addressFactory}
              <br />
              <a href={SITE.phoneHref}>{SITE.phone}</a> · <a href={`mailto:${SITE.emailPrimary}`}>{SITE.emailPrimary}</a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
