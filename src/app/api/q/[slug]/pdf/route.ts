import { hasDb } from '@/lib/db';
import { getQuotationByToken, recordQuoteDownload } from '@/lib/repo-quotes';
import { parseQuoteSlug } from '@/lib/quote-calc';
import { buildQuotationPdf, quotationFilename } from '@/lib/quote-pdf';

// pdf-lib needs the Node runtime; it will not run on the edge
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/q/[slug]/pdf — the client's own copy from the shared link.
 *
 * Public by design: the token in the slug is the only credential. The download is counted, which
 * is the whole reason for serving it from here rather than as a static file.
 */
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  if (!hasDb()) return Response.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const parsed = parseQuoteSlug(params.slug);
  if (!parsed) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });

  const quotation = await getQuotationByToken(parsed.number, parsed.token);
  if (!quotation) return Response.json({ ok: false, error: 'Not found' }, { status: 404 });

  // a withdrawn quotation should not keep handing out a document
  if (quotation.status === 'cancelled') {
    return Response.json({ ok: false, error: 'This quotation has been withdrawn' }, { status: 410 });
  }

  const pdf = await buildQuotationPdf(quotation);
  await recordQuoteDownload(quotation._id);

  return new Response(Buffer.from(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${quotationFilename(quotation)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
