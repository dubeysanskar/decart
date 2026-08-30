import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { getQuotationByToken, setQuoteStatus, recordQuoteDownload } from '@/lib/repo-quotes';
import { parseQuoteSlug } from '@/lib/quote-calc';

export const dynamic = 'force-dynamic';

/**
 * POST /api/q/[slug]/respond — the client's own actions on a shared quotation: accept, reject,
 * or a recorded PDF download.
 *
 * Public by design, so the token in the slug is the only credential. A quotation already
 * answered, cancelled or expired is not re-openable from here.
 */
export async function POST(req: Request, { params }: { params: { slug: string } }) {
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const parsed = parseQuoteSlug(params.slug);
  if (!parsed) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const quotation = await getQuotationByToken(parsed.number, parsed.token);
  if (!quotation) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; note?: string };

  if (body.action === 'download') {
    await recordQuoteDownload(quotation._id);
    return NextResponse.json({ ok: true });
  }

  if (body.action !== 'accept' && body.action !== 'reject') {
    return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
  }

  if (['accepted', 'rejected', 'cancelled', 'expired'].includes(quotation.status)) {
    return NextResponse.json(
      { ok: false, error: 'This quotation has already been closed' },
      { status: 409 },
    );
  }

  const status = body.action === 'accept' ? 'accepted' : 'rejected';
  await setQuoteStatus(quotation._id, status, 'client', body.note ? { note: body.note.slice(0, 500) } : {});

  return NextResponse.json({ ok: true, data: { status } });
}
