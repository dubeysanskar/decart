import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { familyContent, saveFamilyContent, deleteFamilyContent } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { familyContentSchema, fieldErrors } from '@/lib/validators';
import { familyBySlug } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!hasDb()) return NextResponse.json({ ok: true, data: null });
  const content = await familyContent(params.slug);
  return NextResponse.json({ ok: true, data: content });
}

/** PATCH /api/categories/[slug] — save the category intro copy and FAQ (admin only). */
export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  /*
    A slug that is not in the seed is not automatically wrong any more: the client's own list
    has categories we never modelled, and a row here is what makes one exist. It has to be a
    row already, though — creating one goes through POST /api/categories, which is where the
    name is required.
  */
  if (!familyBySlug(params.slug) && !(await familyContent(params.slug))) {
    return NextResponse.json({ ok: false, error: 'Unknown category' }, { status: 404 });
  }

  const parsed = familyContentSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const saved = await saveFamilyContent(params.slug, parsed.data);

  revalidatePath(`/products/${params.slug}`);
  revalidatePath('/products');
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: saved });
}

/**
 * DELETE /api/categories/[slug] — removes an admin-created category.
 *
 * A seed family cannot be deleted, only hidden: its products would otherwise be stranded in a
 * category that no longer exists. Deleting a row the client added simply removes the category.
 */
export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (familyBySlug(params.slug)) {
    return NextResponse.json(
      { ok: false, error: 'This category comes with the catalogue — hide it instead of deleting it.' },
      { status: 400 },
    );
  }

  await deleteFamilyContent(params.slug);
  revalidatePath('/products');
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
