import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { requireUser, isResponse, isMaster } from '@/lib/auth';
import { getQuotation, listActivity, setQuoteStatus, cancelQuotation } from '@/lib/repo-quotes';
import { QUOTE_STATUSES, type QuoteStatus } from '@/lib/quote-calc';

export const dynamic = 'force-dynamic';

/** A sales user may only touch their own; a master may touch anyone's. */
async function load(id: string, user: { id: string; role: string }) {
  const quotation = await getQuotation(id);
  if (!quotation) return { error: NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 }) };
  if (!isMaster(user.role) && quotation.createdBy !== user.id) {
    // 404 rather than 403: a sales user should not learn that someone else's quotation exists
    return { error: NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 }) };
  }
  return { quotation };
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const { quotation, error } = await load(params.id, user);
  if (error) return error;

  return NextResponse.json({ ok: true, data: { ...quotation, activity: await listActivity(params.id) } });
}

/**
 * PATCH /api/quotations/[id] — move it along the pipeline. Cancelling archives it; nothing here
 * deletes, because the number and the audit trail have to survive.
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const { quotation, error } = await load(params.id, user);
  if (error) return error;

  const body = (await req.json().catch(() => ({}))) as { status?: string; reason?: string };
  const status = body.status as QuoteStatus | undefined;

  if (!status || !(QUOTE_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ ok: false, error: 'Unknown status' }, { status: 400 });
  }
  if (quotation!.status === 'cancelled') {
    return NextResponse.json({ ok: false, error: 'This quotation is cancelled' }, { status: 409 });
  }

  if (status === 'cancelled') {
    await cancelQuotation(params.id, user.name, body.reason ?? '');
  } else {
    await setQuoteStatus(params.id, status, user.name);
  }

  return NextResponse.json({ ok: true, data: await getQuotation(params.id) });
}
