import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { getSettings, upsertSettings } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { settingsSchema, fieldErrors } from '@/lib/validators';
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

  const doc = await getSettings();
  return NextResponse.json({ ok: true, data: doc ?? defaults() });
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = settingsSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const doc = await upsertSettings(parsed.data);

  for (const path of ['/', '/contact', '/about', '/products']) revalidatePath(path);

  return NextResponse.json({ ok: true, data: doc });
}
