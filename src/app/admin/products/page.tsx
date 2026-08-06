import Link from 'next/link';
import { Plus } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { listProducts, countProducts, type ProductFilter } from '@/lib/repo';
import { ProductsTable, type ProductRow } from '@/components/admin/ProductsTable';
import { FAMILIES } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

type Search = { q?: string; family?: string; status?: string; needsPhoto?: string };

export default async function AdminProductsPage({ searchParams }: { searchParams: Search }) {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Products unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">
          Set <code className="font-mono">TURSO_DATABASE_URL</code> and run <code className="font-mono">npm run seed</code> to
          load the catalogue into the database. Until then the public site reads the static seed and nothing here is
          editable.
        </p>
      </div>
    );
  }

  const filter: ProductFilter = {};
  if (searchParams.family) filter.family = searchParams.family;
  if (searchParams.status) filter.status = searchParams.status;
  if (searchParams.needsPhoto === '1') filter.needsPhoto = true;
  if (searchParams.q) filter.q = searchParams.q;

  const [docs, total] = await Promise.all([listProducts(filter, 400), countProducts({})]);

  const rows: ProductRow[] = docs.map((doc) => ({
    slug: doc.slug,
    code: doc.code,
    name: doc.name,
    family: doc.family,
    status: doc.status as ProductRow['status'],
    featured: Boolean(doc.featured),
    bestSeller: Boolean(doc.bestSeller),
    needsPhoto: Boolean(doc.needsPhoto),
    images: doc.images?.length ?? 0,
    hero: doc.images?.[0]?.src ?? '',
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Products</h1>
          <p className="mt-1 text-sm text-steel-600">
            {rows.length} shown · {total} in catalogue
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink-900 px-4 text-sm font-semibold text-porcelain hover:bg-ink-800"
        >
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      <ProductsTable rows={rows} families={FAMILIES.map((f) => ({ slug: f.slug, name: f.name }))} />
    </div>
  );
}
