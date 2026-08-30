import 'server-only';
import nodemailer from 'nodemailer';
import { SITE, LEAD_TYPE_LABEL, type LeadType } from './site';
import { waLink, WA } from './whatsapp';
import { formatDateTime } from './utils';
import { getSettings } from './repo';

/** §10.3 — SMTP transport, routing map and the two branded templates. */

export type MailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
};

/**
 * SMTP comes from the Settings screen first and the environment second.
 *
 * The environment cannot be edited on a deployed host without a redeploy, which is why the
 * client can set this themselves. Anything they leave blank falls back to the env value, so an
 * existing deployment keeps working untouched.
 */
export async function mailConfig(): Promise<MailConfig> {
  let saved: Partial<MailConfig> = {};
  try {
    const doc = (await getSettings()) as { smtp?: Partial<MailConfig> } | null;
    saved = doc?.smtp ?? {};
  } catch {
    // settings unreadable (no database yet) — the environment still stands on its own
  }

  const port = Number(saved.port || process.env.SMTP_PORT || 587);
  return {
    host: saved.host || process.env.SMTP_HOST || '',
    port,
    user: saved.user || process.env.SMTP_USER || '',
    pass: saved.pass || process.env.SMTP_PASS || '',
    fromName: saved.fromName || process.env.SMTP_FROM_NAME || SITE.shortName,
    fromEmail: saved.fromEmail || process.env.SMTP_FROM || process.env.SMTP_USER || SITE.emailPrimary,
  };
}

export async function mailConfigured() {
  const c = await mailConfig();
  return Boolean(c.host && c.user && c.pass);
}

// cached per configuration, so saving new settings builds a fresh transport instead of
// silently reusing a connection pointed at the old server
let transport: nodemailer.Transporter | null = null;
let transportKey = '';

export async function getTransport() {
  const c = await mailConfig();
  if (!c.host || !c.user || !c.pass) throw new Error('SMTP is not configured');

  const key = `${c.host}:${c.port}:${c.user}:${c.pass.length}`;
  if (!transport || transportKey !== key) {
    transport = nodemailer.createTransport({
      host: c.host,
      port: c.port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS
      secure: c.port === 465,
      auth: { user: c.user, pass: c.pass },
    });
    transportKey = key;
  }
  return transport;
}

type Routing = Record<string, string[]>;

export function mailRouting(): Routing {
  try {
    const parsed = JSON.parse(process.env.MAIL_ROUTING_JSON || '{}') as Routing;
    if (!parsed.default?.length) parsed.default = [SITE.emailPrimary];
    return parsed;
  } catch {
    return { default: [SITE.emailPrimary] };
  }
}

export function recipientsFor(type: string, routing = mailRouting()) {
  return routing[type]?.length ? routing[type] : routing.default;
}

// kept for the env-only path; mailConfig() is what actually decides the from line now
const fromName = () => process.env.MAIL_FROM_NAME || SITE.shortName;

// ---------------------------------------------------------------- templates

const esc = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const shell = (title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#F6F7F9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F7F9;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid #E3E7EC;border-radius:12px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#161B21;">
        <tr><td style="background:#0F1317;padding:20px 24px;">
          <div style="font-size:20px;font-weight:bold;color:#F6F7F9;letter-spacing:.02em;">DecArt Industries</div>
          <div style="font-size:12px;color:#8B949E;margin-top:4px;">Trust is our Sign</div>
        </td></tr>
        <tr><td style="height:2px;background:#4FAEE3;line-height:2px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:24px;">${body}</td></tr>
        <tr><td style="background:#F6F7F9;border-top:1px solid #E3E7EC;padding:18px 24px;font-size:12px;line-height:1.6;color:#5C6670;">
          DecArt Industries Private Limited<br>
          ${esc(SITE.addressFactory)}<br>
          <a href="${SITE.phoneHref}" style="color:#20719F;text-decoration:none;">${esc(SITE.phone)}</a> ·
          <a href="mailto:${SITE.emailPrimary}" style="color:#20719F;text-decoration:none;">${SITE.emailPrimary}</a><br>
          ${esc(SITE.hours)} · GSTIN ${SITE.gstin}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

const row = (label: string, value?: string) =>
  value
    ? `<tr>
        <td style="padding:7px 12px;border-bottom:1px solid #E3E7EC;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#5C6670;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
        <td style="padding:7px 12px;border-bottom:1px solid #E3E7EC;font-size:14px;color:#161B21;">${value}</td>
      </tr>`
    : '';

const button = (href: string, label: string, bg: string) =>
  `<a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 20px;border-radius:8px;margin:0 8px 8px 0;">${esc(label)}</a>`;

export type LeadMailData = {
  type: LeadType | string;
  name: string;
  company?: string;
  email?: string;
  phone: string;
  city?: string;
  message?: string;
  productName?: string;
  productCode?: string;
  productUrl?: string;
  quantity?: string;
  targetDate?: string;
  page?: string;
  extra?: Record<string, string>;
  createdAt?: Date;
};

export function adminNotifyHtml(d: LeadMailData) {
  const mono = 'font-family:Consolas,Menlo,monospace;letter-spacing:.06em;';
  const product = d.productName
    ? `${esc(d.productName)}${d.productCode ? ` <span style="${mono}">(${esc(d.productCode)})</span>` : ''}${
        d.productUrl ? ` — <a href="${d.productUrl}" style="color:#20719F;">view</a>` : ''
      }`
    : '';
  const extras = Object.entries(d.extra ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => row(k.replace(/([A-Z])/g, ' $1'), esc(v)))
    .join('');

  const body = `
    <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#2E8FC7;font-weight:bold;">New website query</div>
    <h1 style="margin:8px 0 16px;font-size:22px;line-height:1.2;">${esc(LEAD_TYPE_LABEL[d.type as LeadType] ?? d.type)} — ${esc(d.name)}</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E3E7EC;border-radius:8px;border-collapse:separate;overflow:hidden;">
      ${row('Type', esc(String(d.type).toUpperCase()))}
      ${row('Name', esc(d.name))}
      ${row('Company', esc(d.company))}
      ${row('Phone', `<a href="tel:${esc(d.phone)}" style="color:#20719F;text-decoration:none;">${esc(d.phone)}</a>`)}
      ${row('Email', d.email ? `<a href="mailto:${esc(d.email)}" style="color:#20719F;text-decoration:none;">${esc(d.email)}</a>` : '')}
      ${row('City', esc(d.city))}
      ${row('Product', product)}
      ${row('Quantity', esc(d.quantity))}
      ${row('Target date', esc(d.targetDate))}
      ${extras}
      ${row('Message', esc(d.message).replace(/\n/g, '<br>'))}
      ${row('Page', esc(d.page))}
    </table>
    <div style="margin-top:20px;">
      ${button(`tel:${d.phone}`, `Call ${d.name}`, '#20719F')}
      ${button(waLink(WA.reply(d.name, String(d.type), d.productName ?? ''), d.phone.replace(/\D/g, '').length >= 10 ? `91${d.phone.replace(/\D/g, '').slice(-10)}` : SITE.whatsapp), 'Reply on WhatsApp', '#25D366')}
    </div>
    <p style="margin:18px 0 0;font-size:12px;color:#5C6670;">DecArt website · received ${esc(formatDateTime(d.createdAt ?? new Date()))} IST</p>`;

  return shell(`New ${d.type} query`, body);
}

export function adminNotifyText(d: LeadMailData) {
  return [
    `New ${String(d.type).toUpperCase()} query from the DecArt website`,
    '',
    `Name: ${d.name}`,
    d.company && `Company: ${d.company}`,
    `Phone: ${d.phone}`,
    d.email && `Email: ${d.email}`,
    d.city && `City: ${d.city}`,
    d.productName && `Product: ${d.productName} ${d.productCode ?? ''}`,
    d.quantity && `Quantity: ${d.quantity}`,
    d.targetDate && `Target date: ${d.targetDate}`,
    ...Object.entries(d.extra ?? {}).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    d.message && `\nMessage:\n${d.message}`,
    d.page && `\nPage: ${d.page}`,
    `\nReceived ${formatDateTime(d.createdAt ?? new Date())} IST`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function ackHtml(d: LeadMailData) {
  const mono = 'font-family:Consolas,Menlo,monospace;letter-spacing:.06em;';
  const summary = [
    d.productName ? row('Product', `${esc(d.productName)} <span style="${mono}">${esc(d.productCode ?? '')}</span>`) : '',
    row('Quantity', esc(d.quantity)),
    row('Your message', esc(d.message).replace(/\n/g, '<br>')),
  ].join('');

  const body = `
    <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">Namaste ${esc(d.name)},</h1>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.65;">Thank you for reaching out to DecArt Industries. Your query is with our sales desk and you'll hear from us within one working day (Mon–Sat, 9:30 AM–6:00 PM).</p>
    ${summary ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E3E7EC;border-radius:8px;border-collapse:separate;overflow:hidden;margin:18px 0;">${summary}</table>` : ''}
    <p style="margin:18px 0 8px;font-size:15px;font-weight:bold;">Need it faster?</p>
    <div>
      ${button(waLink(WA.float()), 'WhatsApp us', '#25D366')}
      ${button(SITE.phoneHref, `Call ${SITE.phone}`, '#20719F')}
    </div>
    <div style="margin-top:14px;">
      ${button(SITE.catalogueHref, 'Download the catalogue', '#161B21')}
    </div>
    <p style="margin:22px 0 0;font-size:13px;color:#5C6670;">DecArt Industries Private Limited · Trust is our Sign.</p>`;

  return shell('We’ve received your query', body);
}

export function ackText(d: LeadMailData) {
  return [
    `Namaste ${d.name},`,
    '',
    "Thank you for reaching out to DecArt Industries. Your query is with our sales desk and you'll hear from us within one working day (Mon-Sat, 9:30 AM-6:00 PM).",
    '',
    d.productName && `Product: ${d.productName} ${d.productCode ?? ''}`,
    d.quantity && `Quantity: ${d.quantity}`,
    d.message && `Your message: ${d.message}`,
    '',
    `Need it faster? WhatsApp ${waLink(WA.float())} or call ${SITE.phone}.`,
    `Catalogue: ${SITE.catalogueHref}`,
    '',
    'DecArt Industries Private Limited',
    SITE.addressFactory,
    `${SITE.emailPrimary} · Trust is our Sign.`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Minimal wrapper for admin-composed inbox replies (§14.9-C). */
export function replyHtml(bodyHtml: string, signature: string) {
  return shell(
    'DecArt Industries',
    `<div style="font-size:15px;line-height:1.65;">${bodyHtml}</div>
     ${signature ? `<div style="margin-top:22px;padding-top:14px;border-top:1px solid #E3E7EC;font-size:13px;color:#5C6670;">${signature.replace(/\n/g, '<br>')}</div>` : ''}`,
  );
}

// ---------------------------------------------------------------- senders

async function send(opts: nodemailer.SendMailOptions) {
  const [tx, config] = await Promise.all([getTransport(), mailConfig()]);
  const name = config.fromName || fromName();
  const info = await tx.sendMail({ ...opts, from: `${name} <${config.fromEmail}>` });
  return info.messageId as string;
}

export async function sendAdminNotify(d: LeadMailData) {
  const to = recipientsFor(String(d.type));
  return send({
    to,
    replyTo: d.email || undefined,
    subject: `New ${String(d.type).toUpperCase()} query — ${d.name} (${d.phone})`,
    html: adminNotifyHtml(d),
    text: adminNotifyText(d),
  });
}

export async function sendCustomerAck(d: LeadMailData) {
  if (!d.email) throw new Error('no customer email');
  return send({
    to: d.email,
    replyTo: SITE.emailPrimary,
    subject: 'We’ve received your query — DecArt Industries',
    html: ackHtml(d),
    text: ackText(d),
  });
}

export async function sendReply(
  to: string,
  subject: string,
  bodyHtml: string,
  signature: string,
  attachments?: nodemailer.SendMailOptions['attachments'],
) {
  return send({
    to,
    replyTo: SITE.emailPrimary,
    subject,
    html: replyHtml(bodyHtml, signature),
    text: bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    attachments,
  });
}
