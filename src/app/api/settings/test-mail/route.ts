import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { mailConfig, mailConfigured, sendReply } from '@/lib/mail';
import { SITE } from '@/lib/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/settings/test-mail — proves the saved SMTP settings actually work.
 *
 * Worth having because a wrong password or port fails silently otherwise: the first anyone knows
 * is a customer enquiry that never arrived. This surfaces the SMTP server's own error message.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!(await mailConfigured())) {
    return NextResponse.json(
      { ok: false, error: 'Fill in the host, username and password first, and save.' },
      { status: 400 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { to?: string };
  const config = await mailConfig();
  const to = (body.to || config.fromEmail || SITE.emailPrimary).trim();

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    return NextResponse.json({ ok: false, error: 'Enter a valid address to test with.' }, { status: 400 });
  }

  const html = `
    <p>This is a test from the ${SITE.brandName} admin.</p>
    <p>If you are reading this, enquiries from the website will reach you. Sent via
       <strong>${config.host}:${config.port}</strong> as <strong>${config.user}</strong>.</p>
  `;

  try {
    const messageId = await sendReply(to, `Test email from ${SITE.shortName}`, html, 'Admin');
    return NextResponse.json({ ok: true, data: { to, messageId, host: config.host, port: config.port } });
  } catch (error) {
    // hand the SMTP server's own words back — "invalid login" is far more useful than "failed"
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message.slice(0, 300) : 'The send failed.' },
      { status: 502 },
    );
  }
}
