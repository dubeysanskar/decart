import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { listBanners, insertBanner } from '@/lib/repo-content';
import { requireAdmin, auth } from '@/lib/auth';
import { bannerSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/** GET /api/banners — published for the public, everything for admins. */
export async function GET() {
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });
  const session = await auth();
  return NextResponse.json({ ok: true, data: await listBanners(!session?.user) });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = bannerSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const banner = await insertBanner(parsed.data);
  revalidatePath('/');
  return NextResponse.json({ ok: true, data: banner }, { status: 201 });
}
