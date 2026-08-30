import { hasDb } from '@/lib/db';
import { requireUser, isResponse, isMaster } from '@/lib/auth';
import { getQuotation } from '@/lib/repo-quotes';
import { buildQuotationPdf, quotationFilename } from '@/lib/quote-pdf';

// pdf-lib needs the Node runtime; it will not run on the edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/quotations/[id]/pdf — the salesperson's own copy, straight from the admin. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return Response.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const quotation = await getQuotation(params.id);
  // 404 rather than 403, so a sales user cannot discover someone else's quotation
  if (!quotation || (!isMaster(user.role) && quotation.createdBy !== user.id)) {
    return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const pdf = await buildQuotationPdf(quotation);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quotationFilename(quotation)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
