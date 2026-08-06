import { NextResponse } from 'next/server';
import { leadById, updateLead, getSettings } from '@/lib/repo';
import { requireAdmin, auth } from '@/lib/auth';
import { respondSchema, fieldErrors } from '@/lib/validators';
import { sendReply, mailConfigured } from '@/lib/mail';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

const DEFAULT_SIGNATURE = `${SITE.legalName}\n${SITE.addressFactory}\n${SITE.phone} · ${SITE.emailPrimary}\nTrust is our Sign.`;

/** POST /api/leads/[id]/respond — send an email reply and append it to the lead timeline. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!mailConfigured()) {
    return NextResponse.json({ ok: false, error: 'SMTP is not configured on this deployment.' }, { status: 503 });
  }

  const parsed = respondSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const { subject, body, to } = parsed.data;

  const lead = await leadById(params.id);
  if (!lead) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const settings = await getSettings();
  const signature = (settings?.replySignature as string) || DEFAULT_SIGNATURE;

  const html = body
    .split('\n\n')
    .map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('');

  let messageId = '';
  try {
    messageId = await sendReply(to, subject, html, signature);
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Send failed: ${(err as Error).message}` }, { status: 502 });
  }

  const session = await auth();
  const at = new Date().toISOString();
  await updateLead(params.id, {
    responses: [...lead.responses, { subject, body, sentTo: to, at, messageId }],
    notes: [
      ...lead.notes,
      {
        by: session?.user?.name || session?.user?.email || 'admin',
        text: `Replied by email: “${subject}”`,
        at,
      },
    ],
    ...(lead.status === 'new' ? { status: 'contacted' } : {}),
  });

  return NextResponse.json({ ok: true, data: { messageId } });
}
