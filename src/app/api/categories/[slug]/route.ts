import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { familyContent, saveFamilyContent } from '@/lib/repo';
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

  if (!familyBySlug(params.slug)) {
    return NextResponse.json({ ok: false, error: 'Unknown category' }, { status: 404 });
  }

  const parsed = familyContentSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const saved = await saveFamilyContent(params.slug, parsed.data);

  revalidatePath(`/products/${params.slug}`);
  revalidatePath('/products');

  return NextResponse.json({ ok: true, data: saved });
}
