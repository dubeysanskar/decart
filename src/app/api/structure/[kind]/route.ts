import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { catalogueCategorySchema, masterCategorySchema, fieldErrors } from '@/lib/validators';
import { categoryRow, masterRow, saveCategory, saveMaster } from '@/lib/repo-taxonomy';
import { ensureSeeded } from '@/lib/structure-seed';
import { getNavFamilies } from '@/lib/catalogue';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type Kind = 'masters' | 'categories';
const isKind = (value: string): value is Kind => value === 'masters' || value === 'categories';

/** POST /api/structure/{masters|categories} — create one. The address is made from the name. */
export async function POST(req: Request, { params }: { params: { kind: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isKind(params.kind)) return NextResponse.json({ ok: false, error: 'Unknown kind' }, { status: 404 });
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'No database configured.' }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await ensureSeeded();

  if (params.kind === 'masters') {
    const parsed = masterCategorySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });

    const slug = slugify(String(body.slug ?? '') || parsed.data.name).slice(0, 60);
    if (!slug) return NextResponse.json({ ok: false, errors: { name: 'That name does not make a usable address' } }, { status: 400 });
    if (await masterRow(slug)) return NextResponse.json({ ok: false, errors: { name: 'A master category already uses that name' } }, { status: 409 });

    const saved = await saveMaster({ slug, ...parsed.data });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, data: saved }, { status: 201 });
  }

  const parsed = catalogueCategorySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  if (!(await masterRow(parsed.data.master))) {
    return NextResponse.json({ ok: false, errors: { master: 'That master category does not exist' } }, { status: 400 });
  }

  const slug = slugify(String(body.slug ?? '') || parsed.data.name).slice(0, 60);
  if (!slug) return NextResponse.json({ ok: false, errors: { name: 'That name does not make a usable address' } }, { status: 400 });
  // category addresses are unique across the whole tree, so one admin form cannot shadow another
  if (await categoryRow(slug)) return NextResponse.json({ ok: false, errors: { name: 'A category already uses that name' } }, { status: 409 });

  const known = new Set((await getNavFamilies()).map((f) => f.slug));
  const saved = await saveCategory({ slug, ...parsed.data, series: parsed.data.series.filter((s) => known.has(s)) });
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, data: saved }, { status: 201 });
}
