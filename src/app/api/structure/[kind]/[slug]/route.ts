import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { catalogueCategorySchema, masterCategorySchema, fieldErrors } from '@/lib/validators';
import {
  categoryRow,
  countCategoriesIn,
  deleteCategory,
  deleteMaster,
  listMasterRows,
  masterRow,
  saveCategory,
  saveMaster,
} from '@/lib/repo-taxonomy';
import { getNavFamilies } from '@/lib/catalogue';
import { ensureSeeded } from '@/lib/structure-seed';

export const dynamic = 'force-dynamic';

type Kind = 'masters' | 'categories';
const isKind = (value: string): value is Kind => value === 'masters' || value === 'categories';

/** PATCH /api/structure/{masters|categories}/[slug] — edit one. Only the fields sent change. */
export async function PATCH(req: Request, { params }: { params: { kind: string; slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isKind(params.kind)) return NextResponse.json({ ok: false, error: 'Unknown kind' }, { status: 404 });
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'No database configured.' }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  await ensureSeeded();

  if (params.kind === 'masters') {
    const current = await masterRow(params.slug);
    if (!current) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const parsed = masterCategorySchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
    const saved = await saveMaster({ ...current, ...parsed.data, slug: current.slug });
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, data: saved });
  }

  const current = await categoryRow(params.slug);
  if (!current) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  const parsed = catalogueCategorySchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });

  const next = { ...current, ...parsed.data, slug: current.slug };
  if (parsed.data.master && !(await masterRow(parsed.data.master))) {
    return NextResponse.json({ ok: false, errors: { master: 'That master category does not exist' } }, { status: 400 });
  }
  if (parsed.data.series) {
    const known = new Set((await getNavFamilies()).map((f) => f.slug));
    next.series = parsed.data.series.filter((s) => known.has(s));
  }
  const saved = await saveCategory(next);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true, data: saved });
}

/**
 * DELETE /api/structure/{masters|categories}/[slug]
 *
 * A master category with categories under it is refused: deleting it would orphan them, and
 * "hidden" does the job without losing anything. Deleting a category loses only the grouping —
 * the products belong to their series and are untouched.
 */
export async function DELETE(_req: Request, { params }: { params: { kind: string; slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!isKind(params.kind)) return NextResponse.json({ ok: false, error: 'Unknown kind' }, { status: 404 });
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'No database configured.' }, { status: 503 });
  await ensureSeeded();

  if (params.kind === 'masters') {
    if (!(await masterRow(params.slug))) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (await countCategoriesIn(params.slug)) {
      return NextResponse.json(
        { ok: false, error: 'This master category still has categories. Move or delete them first, or hide it instead.' },
        { status: 409 },
      );
    }
    // never leave the store empty: an empty store falls back to the seed and resurrects everything
    if ((await listMasterRows()).length <= 1) {
      return NextResponse.json({ ok: false, error: 'This is the last master category — hide it instead.' }, { status: 409 });
    }
    await deleteMaster(params.slug);
  } else {
    if (!(await categoryRow(params.slug))) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    await deleteCategory(params.slug);
  }

  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
