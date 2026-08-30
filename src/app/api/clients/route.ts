import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { listClients, insertClient } from '@/lib/repo-content';
import { requireAdmin, auth } from '@/lib/auth';
import { clientLogoSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });
  const session = await auth();
  return NextResponse.json({ ok: true, data: await listClients(!session?.user) });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = clientLogoSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const client = await insertClient(parsed.data);
  revalidatePath('/');
  revalidatePath('/clients');
  return NextResponse.json({ ok: true, data: client }, { status: 201 });
}
