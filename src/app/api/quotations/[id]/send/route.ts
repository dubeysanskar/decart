import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import { requireUser, isResponse, isMaster } from '@/lib/auth';
import { getQuotation, setQuoteStatus, addActivity } from '@/lib/repo-quotes';
import { formatINR, quotePath } from '@/lib/quote-calc';
import { mailConfigured, sendReply } from '@/lib/mail';
import { buildQuotationPdf, quotationFilename } from '@/lib/quote-pdf';
import { SITE } from '@/lib/site';
import { absoluteUrl } from '@/lib/origin';

// pdf-lib needs the Node runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/quotations/[id]/send — mark a quotation sent and, for the email channel, mail the
 * link to the client.
 *
 * The mail carries a link rather than a PDF attachment: the PDF is produced by the print view in
 * the browser, so there is no server-side renderer to attach from. The link also lets us record
 * opens, which an attachment cannot.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  if (!hasDb()) return NextResponse.json({ ok: false, error: 'Database is not configured' }, { status: 503 });

  const quotation = await getQuotation(params.id);
  if (!quotation || (!isMaster(user.role) && quotation.createdBy !== user.id)) {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as { channel?: string; to?: string };
  const channel = body.channel === 'email' ? 'email' : body.channel === 'whatsapp' ? 'whatsapp' : 'link';
  // built from the serving host, not SITE.url: that domain still runs the old WordPress site
  const link = absoluteUrl(quotePath(quotation.number, quotation.token));

  if (channel === 'email') {
    const to = (body.to || quotation.client?.email || '').trim();
    if (!to) {
      return NextResponse.json({ ok: false, error: 'This client has no email address' }, { status: 400 });
    }
    if (!mailConfigured()) {
      return NextResponse.json({ ok: false, error: 'SMTP is not configured' }, { status: 503 });
    }

    const html = `
      <p>Dear ${quotation.client?.contactPerson || quotation.client?.company || 'Sir/Madam'},</p>
      <p>Thank you for your enquiry. Your quotation <strong>${quotation.number}</strong> is ready,
         totalling <strong>${formatINR(quotation.total)}</strong> inclusive of GST.</p>
      <p>The full quotation is attached as a PDF.${quotation.validUntil ? ` It is valid until ${quotation.validUntil}.` : ''}</p>
      <p><a href="${link}">You can also view and accept it online</a> — or reply to this email with any change you need.</p>
    `;

    // sendReply resolves to a message id and throws on an SMTP failure, so this has to catch
    try {
      const pdf = await buildQuotationPdf(quotation);
      const messageId = await sendReply(
        to,
        `Quotation ${quotation.number} from ${SITE.shortName}`,
        html,
        user.name,
        [{ filename: quotationFilename(quotation), content: Buffer.from(pdf), contentType: 'application/pdf' }],
      );
      await addActivity(params.id, 'emailed', user.name, { to, messageId });
    } catch (error) {
      await addActivity(params.id, 'email-failed', user.name, {
        to,
        error: error instanceof Error ? error.message.slice(0, 200) : 'unknown',
      });
      return NextResponse.json({ ok: false, error: 'The email could not be sent' }, { status: 502 });
    }
  } else {
    await addActivity(params.id, channel === 'whatsapp' ? 'shared-whatsapp' : 'link-copied', user.name);
  }

  // opening the link is what moves it to "viewed" later; sending is as far as this goes
  if (quotation.status === 'generated' || quotation.status === 'draft') {
    await setQuoteStatus(params.id, 'sent', user.name, { channel });
  }

  return NextResponse.json({ ok: true, data: { link, channel } });
}
