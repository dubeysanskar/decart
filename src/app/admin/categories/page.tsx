import { hasDb } from '@/lib/db';
import { allFamilyContent, familyCounts } from '@/lib/repo';
import { CategoryEditor, type CategoryDraft } from '@/components/admin/CategoryEditor';
import { FAMILIES } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Categories unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">
          Set <code className="font-mono">TURSO_DATABASE_URL</code> to write category descriptions and FAQs.
        </p>
      </div>
    );
  }

  const [content, counts] = await Promise.all([allFamilyContent(), familyCounts()]);
  const byslug = Object.fromEntries(content.map((row) => [row.slug, row]));

  const draft = (slug: string, name: string, group: string, fromCatalogue: boolean): CategoryDraft => {
    const saved = byslug[slug];
    return {
      slug,
      name: saved?.name || name,
      count: counts[slug] ?? 0,
      groupSlug: saved?.groupSlug || group,
      cover: saved?.cover ?? '',
      order: saved?.order ?? 0,
      status: saved?.status || 'published',
      fromCatalogue,
      heading: saved?.heading ?? '',
      intro: saved?.intro ?? '',
      bodyHtml: saved?.bodyHtml ?? '',
      faq: saved?.faq ?? [],
      seoTitle: saved?.seoTitle ?? '',
      seoDescription: saved?.seoDescription ?? '',
    };
  };

  const seeded = FAMILIES.filter((family) => !family.hidden).map((family) =>
    draft(family.slug, family.name, family.group, true),
  );

  // rows for slugs the catalogue does not ship: categories the client added themselves
  const seedSlugs = new Set(FAMILIES.map((family) => family.slug));
  const added = content
    .filter((row) => !seedSlugs.has(row.slug))
    .map((row) => draft(row.slug, row.name || row.slug, row.groupSlug || 'seating', false));

  const categories: CategoryDraft[] = [...seeded, ...added].sort(
    (a, b) => (a.order || 999) - (b.order || 999) || a.name.localeCompare(b.name),
  );

  return <CategoryEditor categories={categories} />;
}
