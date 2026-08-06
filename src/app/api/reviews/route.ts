import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { insertReview, approvedReviewsFor, listReviews } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { reviewSchema, fieldErrors } from '@/lib/validators';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/** POST /api/reviews — public; lands as `pending` for moderation. */
export async function POST(req: Request) {
  const limit = rateLimit(`review:${clientIp(req)}`, 4, 30 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ ok: false, error: 'Too many submissions. Try again later.' }, { status: 429 });
  }

  const parsed = reviewSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  if (parsed.data.website) return NextResponse.json({ ok: true }, { status: 202 });

  if (!hasDb()) {
    return NextResponse.json({ ok: false, error: 'Reviews are not enabled on this deployment.' }, { status: 503 });
  }

  const { website, ...data } = parsed.data;
  const review = await insertReview({ ...data, productSlug: data.productSlug || null });

  return NextResponse.json({ ok: true, data: { id: review._id } }, { status: 202 });
}

/** GET /api/reviews — admin queue, or the approved list for one product. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const productSlug = url.searchParams.get('productSlug');

  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });

  if (productSlug) {
    const rows = await approvedReviewsFor(productSlug);
    return NextResponse.json({ ok: true, data: rows });
  }

  const denied = await requireAdmin();
  if (denied) return denied;

  const status = url.searchParams.get('status');
  const rows = await listReviews(status || undefined);
  return NextResponse.json({ ok: true, data: rows });
}
