import { NextResponse } from 'next/server';
import { leadById, updateLead, deleteLead, type LeadNote } from '@/lib/repo';
import { requireAdmin, auth } from '@/lib/auth';
import { leadPatchSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const lead = await leadById(params.id);
  if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: lead });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const session = await auth();
  const by = session?.user?.name || session?.user?.email || 'admin';

  const parsed = leadPatchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { note, ...fields } = parsed.data;

  const lead = await leadById(params.id);
  if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  // a status change writes its own timeline note so the history is self-explanatory
  const notes: LeadNote[] = [...lead.notes];
  const at = new Date().toISOString();
  if (fields.status && fields.status !== lead.status) {
    notes.push({ by, text: `Status: ${lead.status} → ${fields.status}`, at });
  }
  if (fields.disposition && fields.disposition !== lead.disposition) {
    notes.push({ by, text: `Disposition set to “${fields.disposition}”`, at });
  }
  if (note) notes.push({ by, text: note, at });

  const updated = await updateLead(params.id, { ...fields, notes });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await deleteLead(params.id);
  return NextResponse.json({ ok: true });
}
