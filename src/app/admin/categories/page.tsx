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

  const categories: CategoryDraft[] = FAMILIES.filter((family) => !family.hidden).map((family) => {
    const saved = byslug[family.slug];
    return {
      slug: family.slug,
      name: family.name,
      count: counts[family.slug] ?? 0,
      heading: saved?.heading ?? '',
      intro: saved?.intro ?? '',
      bodyHtml: saved?.bodyHtml ?? '',
      faq: saved?.faq ?? [],
      seoTitle: saved?.seoTitle ?? '',
      seoDescription: saved?.seoDescription ?? '',
    };
  });

  return <CategoryEditor categories={categories} />;
}
