import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateClient, deleteClient } from '@/lib/repo-content';
import { requireAdmin } from '@/lib/auth';
import { clientLogoSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = clientLogoSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const client = await updateClient(params.id, parsed.data);
  if (!client) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  revalidatePath('/');
  revalidatePath('/clients');
  return NextResponse.json({ ok: true, data: client });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await deleteClient(params.id);
  revalidatePath('/');
  revalidatePath('/clients');
  return NextResponse.json({ ok: true });
}
