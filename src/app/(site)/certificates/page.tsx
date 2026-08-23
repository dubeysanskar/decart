import type { Metadata } from 'next';
import Image from 'next/image';
import { PageHeader } from '@/components/site/PageHeader';
import { QuoteBand } from '@/components/home/sections';
import { SectionHeading } from '@/components/ui/typography';
import { buildMetadata } from '@/lib/seo';
import { listPublic } from '@/lib/assets';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Certificates & Compliance — DecArt Furniture',
  description:
    'GST registration, BIFMA/SGS-tested components and the quality standards DecArt Industries builds to. Documentation available on request for tenders and audits.',
  path: '/certificates',
});

/**
 * §14.6 rule holds: a badge is only rendered when the client has actually supplied that
 * certificate file. Until then this page states the position in words rather than showing
 * marks we cannot evidence.
 */
const CLAIMS = [
  {
    title: 'GST registered',
    body: `GSTIN ${SITE.gstin}. Tax invoices are issued on every order, and the registration certificate is shared with tender documents on request.`,
  },
  {
    title: 'BIFMA/SGS-tested components',
    body: 'Gas lifts, castors and mechanisms are sourced against BIFMA/SGS test reports from our component suppliers. Test certificates travel with the component, and we pass them on for project submissions.',
  },
  {
    title: 'Made in India',
    body: 'Frames, ply, metalwork and upholstery are produced at our own Faridabad facility, so we can document the manufacturing chain end to end.',
  },
  {
    title: 'Documentation for tenders',
    body: 'Government and institutional buyers get the full compliance pack — registration, component test reports, warranty terms and specification sheets — with the quotation.',
  },
];

export default function CertificatesPage() {
  const files = listPublic('certificates');

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Certificates & compliance."
        lede="What we are registered for, what our components are tested to, and what documentation we can put in front of an auditor."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Certificates' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {files.length ? (
            <>
              <SectionHeading
                eyebrow="On file"
                title="Certificates we hold"
                lede="Tap any certificate to view it full size."
              />
              <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4" data-stagger>
                {files.map((src) => {
                  const name = src.split('/').pop()?.split('.')[0]?.replace(/[-_]/g, ' ') ?? 'Certificate';
                  return (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-anim="up"
                      className="group flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-lift"
                    >
                      <span className="relative block aspect-[3/4] bg-porcelain">
                        <Image
                          src={src}
                          alt={`DecArt ${name} certificate`}
                          fill
                          sizes="(max-width: 768px) 45vw, 22vw"
                          className="object-contain p-3"
                        />
                      </span>
                      <span className="border-t border-line p-3 text-sm font-medium capitalize text-ink-950">
                        {name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </>
          ) : (
            <SectionHeading
              eyebrow="Compliance"
              title="Where we stand"
              lede="Certificate scans are added here as they are issued. In the meantime, this is the position in plain terms — and every document below is available on request."
            />
          )}

          <div className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-2" data-stagger>
            {CLAIMS.map((claim) => (
              <div key={claim.title} data-anim="up" className="min-w-0 bg-paper p-6 md:p-8">
                <h3 className="text-lg font-semibold text-ink-950">{claim.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-steel-600">{claim.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 max-w-2xl text-sm text-steel-600">
            Need a specific document for a tender or vendor registration? Email{' '}
            <a href={`mailto:${SITE.emailPrimary}`} className="font-semibold text-decart-700 hover:underline">
              {SITE.emailPrimary}
            </a>{' '}
            or call{' '}
            <a href={SITE.phoneHref} data-call className="font-semibold text-decart-700 hover:underline">
              {SITE.phone}
            </a>{' '}
            and we will send it the same working day.
          </p>
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
