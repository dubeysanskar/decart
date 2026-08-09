import { Accordion } from '@/components/ui/Accordion';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { renderPostHtml } from '@/lib/blog';
import type { FamilyContentRecord } from '@/lib/repo';

/**
 * The editorial block that sits under a category listing (client brief: "har category ya product
 * ke niche aisa hi content dalna hai") plus the per-category FAQ. Both are edited from
 * /admin/categories, so the copy is the client's, not the developer's.
 *
 * Renders nothing when the family has no content yet — an empty band would read as broken.
 */
export function CategoryContent({
  content,
  familyName,
}: {
  content: FamilyContentRecord | null;
  familyName: string;
}) {
  const hasProse = Boolean(content?.intro || content?.bodyHtml);
  const faq = content?.faq?.filter((item) => item.q && item.a) ?? [];
  if (!hasProse && !faq.length) return null;

  return (
    <>
      {hasProse ? (
        <section className="section bg-paper">
          <div className="container-x">
            <div className="max-w-3xl">
              <h2 className="font-display text-h3 text-ink-950">
                {content?.heading || `About ${familyName.toLowerCase()}`}
              </h2>
              {content?.intro ? (
                <p className="mt-4 text-[1.0625rem] leading-relaxed text-steel-600">{content.intro}</p>
              ) : null}
              {content?.bodyHtml ? (
                <div
                  className="prose-decart mt-6"
                  // sanitised with the same allow-list the blog uses
                  dangerouslySetInnerHTML={{ __html: renderPostHtml(content.bodyHtml) }}
                />
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {faq.length ? (
        <section className="section bg-porcelain">
          <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="min-w-0">
              <SectionHeading
                eyebrow="Questions"
                title={`${familyName} — asked before every order`}
                lede="If yours is not here, the sales desk answers it in one call."
              />
              <ButtonLink href="/contact" variant="secondary" className="mt-8">
                Ask us directly
              </ButtonLink>
            </div>
            <div className="min-w-0" data-anim="up">
              <Accordion
                items={faq.map((item, i) => ({
                  id: `cat-faq-${i}`,
                  title: item.q,
                  content: <p className="max-w-2xl whitespace-pre-line">{item.a}</p>,
                }))}
                defaultOpen="cat-faq-0"
              />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

/** FAQPage JSON-LD so the category FAQ can win rich results (§12). */
export function categoryFaqLd(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
