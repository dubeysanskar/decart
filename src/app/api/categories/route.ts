import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { allFamilyContent, familyContent, saveFamilyContent } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { familyContentSchema, fieldErrors } from '@/lib/validators';
import { familyBySlug } from '@/data/catalogue.seed';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/** GET /api/categories — every managed category row (admin only). */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });
  return NextResponse.json({ ok: true, data: await allFamilyContent() });
}

/**
 * POST /api/categories — create a category the catalogue does not ship with.
 *
 * The client's own list has ranges we never modelled — director and manager tables, metal
 * storage — so a category has to be something they can add rather than something only a deploy
 * can add. A name is required, since a category with no name cannot be shown anywhere.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!hasDb()) {
    return NextResponse.json({ ok: false, error: 'No database configured.' }, { status: 503 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = familyContentSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const name = String(parsed.data.name ?? '').trim();
  if (!name) {
    return NextResponse.json({ ok: false, errors: { name: 'Give the category a name' } }, { status: 400 });
  }

  const slug = slugify(String(body.slug ?? '') || name).slice(0, 60);
  if (!slug) {
    return NextResponse.json({ ok: false, errors: { slug: 'That name does not make a usable web address' } }, { status: 400 });
  }
  if (familyBySlug(slug) || (await familyContent(slug))) {
    return NextResponse.json({ ok: false, errors: { slug: 'A category already uses that address' } }, { status: 409 });
  }

  const saved = await saveFamilyContent(slug, { ...parsed.data, name });

  revalidatePath('/products');
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: saved }, { status: 201 });
}
