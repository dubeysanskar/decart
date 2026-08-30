import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { getSettings, upsertSettings } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { settingsSchema, fieldErrors, SMTP_UNCHANGED } from '@/lib/validators';
import { SITE } from '@/lib/site';
import { mailRouting } from '@/lib/mail';

export const dynamic = 'force-dynamic';

const defaults = () => ({
  key: 'site',
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  emailPrimary: SITE.emailPrimary,
  mailRouting: mailRouting(),
  addressFactory: SITE.addressFactory,
  addressShowroom: '',
  mapUrl: SITE.mapUrl,
  hours: SITE.hours,
  gstin: SITE.gstin,
  social: SITE.social,
  counters: { years: 10, models: 350, families: 30, clients: 40 },
  announcement: '',
  replySignature: '',
});

export async function GET() {
  if (!hasDb()) return NextResponse.json({ ok: true, data: defaults() });

  const doc = (await getSettings()) as Record<string, unknown> | null;
  return NextResponse.json({ ok: true, data: mask(doc ?? defaults()) });
}

/**
 * The SMTP password never leaves the server. The client is told only whether one is stored, and
 * sends the sentinel back to mean "keep it" — otherwise saving any other field would blank it.
 */
function mask<T extends Record<string, unknown>>(doc: T) {
  const smtp = doc.smtp as Record<string, unknown> | undefined;
  if (!smtp) return doc;
  const { pass, ...rest } = smtp;
  return { ...doc, smtp: { ...rest, pass: '', hasPassword: Boolean(pass) } };
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = settingsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const incoming = parsed.data as Record<string, unknown> & { smtp?: { pass?: string } };
  if (incoming.smtp && (incoming.smtp.pass === SMTP_UNCHANGED || !incoming.smtp.pass)) {
    const current = (await getSettings()) as { smtp?: { pass?: string } } | null;
    incoming.smtp.pass = current?.smtp?.pass ?? '';
  }

  const doc = (await upsertSettings(incoming)) as Record<string, unknown>;

  for (const path of ['/', '/contact', '/about', '/products']) revalidatePath(path);

  return NextResponse.json({ ok: true, data: mask(doc) });
}
