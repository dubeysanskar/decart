import type { Metadata } from 'next';
import { Download, FileText, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/site/PageHeader';
import { ButtonLink } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/bits';
import { QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { publicFileExists, fileSizeLabel, listPublic } from '@/lib/assets';
import { SITE } from '@/lib/site';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Downloads — Catalogue, Brochure & Spec Sheets',
  description:
    'Download the DecArt product catalogue, company brochure and model spec sheets. 350+ models across 30 families, manufactured in Faridabad.',
  path: '/downloads',
});

const CORE = [
  {
    file: '/downloads/decart-catalogue.pdf',
    title: 'Product Catalogue',
    body: '68 pages — every family, every printed model code, sizes and finishes.',
    mirror: SITE.catalogueDrive,
  },
  {
    file: '/downloads/company-brochure.pdf',
    title: 'Company Brochure',
    body: 'Who we are, what the factory does, and who we supply.',
  },
  {
    file: '/downloads/warranty-policy.pdf',
    title: 'Warranty Policy',
    body: 'Coverage, component terms and the claims process.',
  },
];

export default function DownloadsPage() {
  const available = CORE.filter((item) => publicFileExists(item.file));
  const missingCatalogue = !publicFileExists(CORE[0].file);
  const specSheets = listPublic('downloads', { images: false }).filter((file) => /spec-sheet\.pdf$/i.test(file));

  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Take the catalogue with you."
        lede="Everything a procurement team needs to circulate internally — model codes, sizes and finishes in one PDF."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Downloads' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {available.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {available.map((item) => (
                <div key={item.file} className="flex flex-col rounded-card border border-line bg-porcelain p-6">
                  <FileText aria-hidden className="h-6 w-6 text-decart-600" />
                  <h2 className="mt-4 text-lg font-semibold text-ink-950">{item.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-steel-600">{item.body}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                    PDF · {fileSizeLabel(item.file)}
                  </p>
                  <ButtonLink href={item.file} external className="mt-4 w-full">
                    <Download aria-hidden className="h-4 w-4" />
                    Download
                  </ButtonLink>
                  {item.mirror ? (
                    <a
                      href={item.mirror}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-decart-700 hover:underline"
                    >
                      Mirror on Google Drive
                      <ExternalLink aria-hidden className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {missingCatalogue ? (
            <EmptyState
              className={available.length ? 'mt-8' : ''}
              title="The self-hosted catalogue PDF is not in place yet"
              body="Until it is exported to /public/downloads/decart-catalogue.pdf, use the Google Drive copy the client shared — or ask us and we will email it."
              action={
                <>
                  <ButtonLink href={SITE.catalogueDrive} external>
                    Open on Google Drive
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="secondary">
                    Email me the catalogue
                  </ButtonLink>
                </>
              }
            />
          ) : null}

          {specSheets.length ? (
            <div className="mt-14 border-t border-line pt-10">
              <h2 className="font-display text-h3 text-ink-950">Model spec sheets</h2>
              <p className="mt-2 text-sm text-steel-600">Factory drawings for individual models.</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {specSheets.map((file) => (
                  <li key={file}>
                    <a
                      href={file}
                      className="flex items-center justify-between gap-3 rounded-card border border-line bg-paper p-4 hover:border-decart-300"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.06em] text-ink-900">
                        {file.split('/').pop()?.replace('-spec-sheet.pdf', '').replace(/-/g, ' ')}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-steel-600">
                        {fileSizeLabel(file)}
                        <Download aria-hidden className="h-3.5 w-3.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
