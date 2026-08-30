import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateBanner, deleteBanner } from '@/lib/repo-content';
import { requireAdmin } from '@/lib/auth';
import { bannerSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = bannerSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const banner = await updateBanner(params.id, parsed.data);
  if (!banner) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  revalidatePath('/');
  return NextResponse.json({ ok: true, data: banner });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await deleteBanner(params.id);
  revalidatePath('/');
  return NextResponse.json({ ok: true });
}
