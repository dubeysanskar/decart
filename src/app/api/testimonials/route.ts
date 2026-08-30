import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { insertTestimonial } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { testimonialSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/**
 * POST /api/testimonials — a testimonial typed in by the client.
 *
 * Distinct from POST /api/reviews, which is the public form: that one is rate-limited, carries a
 * honeypot and lands as `pending` for moderation. This one is admin-only and publishes straight
 * away, because the person entering it is the moderator.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = testimonialSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const { productSlug, ...rest } = parsed.data;
  const review = await insertTestimonial({ ...rest, productSlug: productSlug || null });

  revalidatePath('/');
  revalidatePath('/clients');
  if (productSlug) revalidatePath(`/products`);

  return NextResponse.json({ ok: true, data: review }, { status: 201 });
}
