import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { requireUser, isResponse } from '@/lib/auth';
import { listQuoteClients, createQuoteClient } from '@/lib/repo-quotes';
import { quoteClientSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

/** GET /api/quote-clients?q= — type-ahead for the quotation wizard. */
export async function GET(req: Request) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });

  const q = new URL(req.url).searchParams.get('q') ?? '';
  return NextResponse.json({ ok: true, data: await listQuoteClients(q) });
}

/** POST /api/quote-clients — create a billing client so the details are typed once, not per quote. */
export async function POST(req: Request) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const parsed = quoteClientSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const client = await createQuoteClient(parsed.data, user.id);
  return NextResponse.json({ ok: true, data: client }, { status: 201 });
}
