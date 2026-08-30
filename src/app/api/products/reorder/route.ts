import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { reorderProducts, listProducts } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

const reorderSchema = z.object({
  family: z.string().trim().min(1).max(60),
  /** slugs in the order the client arranged them; position 0 is shown first */
  slugs: z.array(z.string().trim().min(1).max(160)).min(1).max(500),
});

/**
 * PATCH /api/products/reorder — fix the running order of one family.
 *
 * The client asked to be able to put a model in 1st or 2nd position within a category. The
 * catalogue already sorts on `order`, so this just writes the positions they arranged.
 */
export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = reorderSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const { family, slugs } = parsed.data;

  // only reorder models that really belong to this family, so a stale tab cannot move others
  const inFamily = new Set((await listProducts({ family }, 500)).map((product) => product.slug));
  const unknown = slugs.filter((slug) => !inFamily.has(slug));
  if (unknown.length) {
    return NextResponse.json(
      { ok: false, error: `Not in ${family}: ${unknown.slice(0, 3).join(', ')}` },
      { status: 400 },
    );
  }

  await reorderProducts(family, slugs);

  revalidatePath(`/products/${family}`);
  revalidatePath('/products');
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: { family, count: slugs.length } });
}
