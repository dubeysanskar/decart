import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How DecArt Industries collects, uses and protects the information you send through this website.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="Last updated 2 August 2026"
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]}
      />
      <section className="section bg-paper">
        <div className="container-x">
          <div className="prose-decart mx-auto max-w-[68ch]">
            <h2>What we collect</h2>
            <p>
              When you submit a form on this site we collect the details you enter: your name, contact details
              (phone, email), company, city and the requirement you describe. Our servers also record ordinary
              technical information such as the page a query came from.
            </p>

            <h2>Why we collect it</h2>
            <p>
              To respond to your query, prepare quotations, and send service communication about an order. We do not
              use your details for unrelated marketing.
            </p>

            <h2>Where it is stored</h2>
            <p>
              Queries are stored in a secured database. Access is limited to DecArt sales staff who need it to
              respond to you.
            </p>

            <h2>Sharing</h2>
            <p>
              We never sell your data. We share it only with logistics or service partners where that is necessary to
              fulfil an order you have placed.
            </p>

            <h2>WhatsApp and phone contact</h2>
            <p>
              By submitting a form or messaging us on WhatsApp, you consent to us replying on that number by call or
              message about your enquiry.
            </p>

            <h2>Cookies</h2>
            <p>
              This site uses cookies that are essential to its operation. If analytics are enabled, they are used only
              in aggregate to understand which pages are useful.
            </p>

            <h2>Retention</h2>
            <p>Enquiry and order records are retained for the duration required for business records.</p>

            <h2>Your rights</h2>
            <p>
              Ask us to correct or delete your information at any time by writing to{' '}
              <a href={`mailto:${SITE.emailPrimary}`}>{SITE.emailPrimary}</a>.
            </p>

            <h2>Contact</h2>
            <p>
              {SITE.legalName}
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
