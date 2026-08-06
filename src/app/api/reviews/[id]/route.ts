import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateReview, deleteReview, approvedRatingsFor, setProductRating, productBySlug } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { reviewPatchSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/** Recompute a product's aggregate from its approved reviews only (§10.6). */
async function recomputeRating(productSlug?: string | null) {
  if (!productSlug) return;
  const ratings = await approvedRatingsFor(productSlug);
  const count = ratings.length;
  const avg = count ? ratings.reduce((sum, r) => sum + r, 0) / count : 0;
  await setProductRating(productSlug, count, Number(avg.toFixed(2)));

  const product = await productBySlug(productSlug);
  if (product) revalidatePath(`/products/${product.family}/${product.slug}`);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = reviewPatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const review = await updateReview(params.id, parsed.data);
  if (!review) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  await recomputeRating(review.productSlug);
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: review });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const review = await deleteReview(params.id);
  if (review) await recomputeRating(review.productSlug);

  return NextResponse.json({ ok: true });
}
