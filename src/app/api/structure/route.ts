import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getTaxonomy } from '@/lib/taxonomy';
import { getNavFamilies } from '@/lib/catalogue';

export const dynamic = 'force-dynamic';

/**
 * GET /api/structure — the whole browse tree for the admin: every master category and category,
 * hidden ones included, plus the catalogue series a category can be built from.
 */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [masters, families] = await Promise.all([getTaxonomy({ includeHidden: true }), getNavFamilies()]);
  return NextResponse.json({
    ok: true,
    data: {
      masters,
      series: families.map((f) => ({ slug: f.slug, name: f.name, count: f.count })),
      writable: hasDb(),
    },
  });
}
