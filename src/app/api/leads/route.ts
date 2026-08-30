import { NextResponse } from 'next/server';
import { hasDb } from '@/lib/db';
import {
  insertLead,
  setLeadMailStatus,
  listLeads,
  countLeads,
  productBySlug,
  type LeadFilter,
} from '@/lib/repo';
import { leadSchema, fieldErrors } from '@/lib/validators';
import { rateLimit, clientIp, sweep } from '@/lib/rate-limit';
import { requireAdmin } from '@/lib/auth';
import { sendAdminNotify, sendCustomerAck, mailConfigured, type LeadMailData } from '@/lib/mail';
import { SITE } from '@/lib/site';
import { absoluteUrl } from '@/lib/origin';
import { allSeedProducts } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

const MIN_FILL_MS = 3000;

/**
 * POST /api/leads — public, rate-limited, honeypot + time-trap.
 *
 * Order matters (§9): validate → anti-spam → save → respond → *then* attempt mail.
 * A mail failure is recorded on the lead but never fails the request.
 */
export async function POST(req: Request) {
  sweep();

  const ip = clientIp(req);
  const limit = rateLimit(`lead:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Too many submissions. Please WhatsApp us instead.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed request' }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  // honeypot + time trap: accept silently so bots learn nothing
  const tooFast = data.startedAt ? Date.now() - data.startedAt < MIN_FILL_MS : false;
  if (data.website || tooFast) {
    return NextResponse.json({ ok: true, data: { id: null } }, { status: 202 });
  }

  if (!hasDb()) {
    return NextResponse.json(
      { ok: false, error: 'Lead capture is not configured on this deployment. Please WhatsApp or call us.' },
      { status: 503 },
    );
  }

  // resolve the product name for the emails
  let productName = '';
  if (data.productSlug) {
    try {
      const found = await productBySlug(data.productSlug);
      productName = found?.name ?? '';
    } catch {
      /* fall through to the seed lookup */
    }
    if (!productName) productName = allSeedProducts().find((p) => p.slug === data.productSlug)?.name ?? '';
  }

  let lead;
  try {
    lead = await insertLead({
      type: data.type,
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      city: data.city,
      message: data.message,
      productSlug: data.productSlug,
      productCode: data.productCode,
      quantity: data.quantity,
      targetDate: data.targetDate,
      extra: data.extra,
      sourcePage: data.page,
      sourceUtm: data.utm,
    });
  } catch (err) {
    console.error('[leads] save failed', err);
    return NextResponse.json(
      { ok: false, error: 'We could not save that. Please WhatsApp or call us — nothing is lost.' },
      { status: 500 },
    );
  }

  // The lead is safe in the DB. Mail is best-effort from here on.
  const mailData: LeadMailData = {
    type: data.type,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    city: data.city,
    message: data.message,
    productName,
    productCode: data.productCode,
    productUrl: data.productSlug ? `${SITE.url}/products` : undefined,
    quantity: data.quantity,
    targetDate: data.targetDate,
    // the host the form was actually submitted from. SITE.url is a build-time constant and
    // still points at decartseatings.in, which serves the old WordPress site.
    page: data.page ? absoluteUrl(data.page) : '',
    extra: data.extra,
    createdAt: new Date(),
  };

  const mailStatus = { admin: '', ack: '' };

  if (mailConfigured()) {
    try {
      await sendAdminNotify(mailData);
      mailStatus.admin = 'sent';
    } catch (err) {
      mailStatus.admin = `failed:${(err as Error).message}`.slice(0, 200);
      console.error('[leads] admin notify failed', err);
    }

    if (data.email) {
      try {
        await sendCustomerAck(mailData);
        mailStatus.ack = 'sent';
      } catch (err) {
        mailStatus.ack = `failed:${(err as Error).message}`.slice(0, 200);
        console.error('[leads] ack failed', err);
      }
    } else {
      mailStatus.ack = 'skipped:no-email';
    }
  } else {
    mailStatus.admin = 'skipped:smtp-not-configured';
    mailStatus.ack = 'skipped:smtp-not-configured';
  }

  try {
    await setLeadMailStatus(lead._id, mailStatus);
  } catch (err) {
    console.error('[leads] mailStatus update failed', err);
  }

  return NextResponse.json({ ok: true, data: { id: lead._id } }, { status: 202 });
}

/** GET /api/leads — admin list with filters + pagination. */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const perPage = Math.min(100, Number(url.searchParams.get('perPage') ?? 25));

  const filter: LeadFilter = {};
  for (const key of ['type', 'status', 'disposition', 'assignedTo', 'q', 'from', 'to'] as const) {
    const value = url.searchParams.get(key);
    if (value) filter[key] = value;
  }

  const [rows, total] = await Promise.all([
    listLeads(filter, perPage, (page - 1) * perPage),
    countLeads(filter),
  ]);

  return NextResponse.json({ ok: true, data: { rows, total, page, perPage } });
}
