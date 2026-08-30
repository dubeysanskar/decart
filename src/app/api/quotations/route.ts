import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { requireUser, isResponse, isMaster } from '@/lib/auth';
import { listQuotations, createQuotation } from '@/lib/repo-quotes';
import { quotationSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/**
 * GET /api/quotations — the list, scoped by role. A master sees everything; a sales user only
 * ever sees their own, and cannot widen that by passing a parameter.
 */
export async function GET(req: Request) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });

  const params = new URL(req.url).searchParams;
  const data = await listQuotations({
    ownerId: isMaster(user.role) ? undefined : user.id,
    status: params.get('status') ?? undefined,
    search: params.get('q') ?? undefined,
    office: isMaster(user.role) ? params.get('office') ?? undefined : undefined,
    from: params.get('from') ?? undefined,
    to: params.get('to') ?? undefined,
  });

  return NextResponse.json({ ok: true, data });
}

/** POST /api/quotations — raise a quotation. Totals are recomputed here, never trusted from the body. */
export async function POST(req: Request) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const parsed = quotationSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const quotation = await createQuotation(parsed.data, {
    id: user.id,
    name: user.name,
    office: user.office,
  });

  if (!quotation) {
    return NextResponse.json({ ok: false, error: 'That client no longer exists' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: quotation }, { status: 201 });
}
