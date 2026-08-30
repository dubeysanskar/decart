import 'server-only';
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { SITE } from './site';
import { quoteTotals } from './quote-calc';
import type { QuotationRecord } from './repo-quotes';

/**
 * Server-side quotation PDF, so the client gets a document they can file and forward rather than
 * a link they have to keep visiting.
 *
 * Built with pdf-lib on the standard Helvetica faces: no native binaries and no font files, which
 * keeps it working on serverless without a headless browser. The one cost is encoding — the
 * standard faces are WinAnsi, which has no rupee sign, so money is written as "INR 1,234.00" and
 * any character outside WinAnsi is dropped rather than throwing mid-render.
 */

const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 42;
const INK = rgb(0.17, 0.16, 0.16);
const MUTED = rgb(0.36, 0.42, 0.48);
const LINE = rgb(0.88, 0.92, 0.95);
const ACCENT = rgb(0.18, 0.55, 0.72);

/** WinAnsi cannot encode everything — drop what it cannot rather than letting the render throw. */
// printable ASCII, Latin-1, and the handful of punctuation marks WinAnsi does carry
const UNSUPPORTED = /[^ -~ -ÿ–—‘’“”•…]/g;
const safe = (value: unknown) =>
  String(value ?? '')
    .replace(/₹/g, 'INR ')
    .replace(UNSUPPORTED, '');

/** One drawText call is a single line, so a stray newline would render as a blank box. */
const oneLine = (value: unknown) => safe(value).replace(/\s*\n\s*/g, ' ');

/** Indian grouping: 9,48,720.00 rather than 948,720.00. */
function inr(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const [whole, fraction] = Math.abs(n).toFixed(2).split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return `${n < 0 ? '-' : ''}INR ${grouped}.${fraction}`;
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven',
  'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function under100(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`;
}

function under1000(n: number): string {
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  return [hundred ? `${ONES[hundred]} Hundred` : '', rest ? under100(rest) : ''].filter(Boolean).join(' ');
}

/** Amount in words, Indian scale — expected on a quotation here. */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  const parts: string[] = [];
  const crore = Math.floor(rupees / 10_000_000);
  const lakh = Math.floor((rupees % 10_000_000) / 100_000);
  const thousand = Math.floor((rupees % 100_000) / 1000);
  const rest = rupees % 1000;

  if (crore) parts.push(`${under1000(crore)} Crore`);
  if (lakh) parts.push(`${under1000(lakh)} Lakh`);
  if (thousand) parts.push(`${under1000(thousand)} Thousand`);
  if (rest) parts.push(under1000(rest));

  const words = `${parts.join(' ')} Rupees`;
  return paise ? `${words} and ${under100(paise)} Paise Only` : `${words} Only`;
}

type Ctx = {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  y: number;
  pages: PDFPage[];
};

function text(
  ctx: Ctx,
  value: string,
  x: number,
  y: number,
  { size = 9, bold = false, color = INK, align = 'left' as 'left' | 'right', width = 0 } = {},
) {
  const font = bold ? ctx.bold : ctx.font;
  const str = oneLine(value);
  const w = font.widthOfTextAtSize(str, size);
  ctx.page.drawText(str, { x: align === 'right' ? x + width - w : x, y, size, font, color });
}

/** Greedy wrap, so notes and terms cannot run off the page. */
function wrap(font: PDFFont, value: string, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  // split the raw value first: safe() drops newlines, being below WinAnsi's printable
  // range, so splitting after it would join every paragraph into one run-on line
  for (const paragraph of String(value ?? '').split('\n')) {
    let line = '';
    for (const word of safe(paragraph).split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        out.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    out.push(line);
  }
  return out;
}

function rule(ctx: Ctx, y: number, color = LINE) {
  ctx.page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4.w - MARGIN, y },
    thickness: 0.7,
    color,
  });
}

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4.w, A4.h]);
  ctx.pages.push(ctx.page);
  ctx.y = A4.h - MARGIN;
  return ctx.page;
}

// laid out so no two columns can touch: the widest amount is 65.5pt at 9pt bold, and the
// amount column is 95pt wide, so it starts at 487 while qty ends at 454
const COLS = { num: MARGIN, item: MARGIN + 22, mrp: 262, disc: 326, rate: 364, qty: 428, amount: 458 };
const W = { mrp: 60, disc: 34, rate: 60, qty: 26, item: 195 };
const RIGHT_EDGE = A4.w - MARGIN;

function tableHead(ctx: Ctx) {
  text(ctx, '#', COLS.num, ctx.y, { size: 7.5, bold: true, color: MUTED });
  text(ctx, 'ITEM', COLS.item, ctx.y, { size: 7.5, bold: true, color: MUTED });
  text(ctx, 'MRP', COLS.mrp, ctx.y, { size: 7.5, bold: true, color: MUTED, align: 'right', width: W.mrp });
  text(ctx, 'DISC', COLS.disc, ctx.y, { size: 7.5, bold: true, color: MUTED, align: 'right', width: W.disc });
  text(ctx, 'RATE', COLS.rate, ctx.y, { size: 7.5, bold: true, color: MUTED, align: 'right', width: W.rate });
  text(ctx, 'QTY', COLS.qty, ctx.y, { size: 7.5, bold: true, color: MUTED, align: 'right', width: W.qty });
  text(ctx, 'AMOUNT', COLS.amount, ctx.y, {
    size: 7.5,
    bold: true,
    color: MUTED,
    align: 'right',
    width: RIGHT_EDGE - COLS.amount,
  });
  ctx.y -= 7;
  rule(ctx, ctx.y);
  ctx.y -= 14;
}

export async function buildQuotationPdf(quotation: QuotationRecord): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const ctx: Ctx = { doc, font, bold, page: null as unknown as PDFPage, y: 0, pages: [] };
  newPage(ctx);

  doc.setTitle(`Quotation ${quotation.number}`);
  doc.setSubject(`Quotation for ${quotation.client?.company ?? ''}`);
  doc.setProducer(SITE.legalName);
  doc.setCreator(SITE.legalName);

  /* ---------------------------------------------------------------- header */
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'public', 'brand', 'logo.png'));
    const logo = await doc.embedPng(bytes);
    const scaled = logo.scaleToFit(132, 40);
    ctx.page.drawImage(logo, { x: MARGIN, y: ctx.y - scaled.height, width: scaled.width, height: scaled.height });
  } catch {
    // a missing logo must not cost the client their quotation
    text(ctx, SITE.brandName, MARGIN, ctx.y - 14, { size: 15, bold: true });
  }

  text(ctx, 'QUOTATION', COLS.amount - 120, ctx.y - 6, {
    size: 8,
    bold: true,
    color: MUTED,
    align: 'right',
    width: RIGHT_EDGE - (COLS.amount - 120),
  });
  text(ctx, quotation.number, COLS.amount - 120, ctx.y - 24, {
    size: 15,
    bold: true,
    align: 'right',
    width: RIGHT_EDGE - (COLS.amount - 120),
  });

  ctx.y -= 52;
  const raisedOn = new Date(quotation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  text(ctx, `Date: ${raisedOn}`, COLS.amount - 120, ctx.y, {
    size: 8.5,
    color: MUTED,
    align: 'right',
    width: RIGHT_EDGE - (COLS.amount - 120),
  });
  if (quotation.validUntil) {
    ctx.y -= 12;
    text(ctx, `Valid until: ${quotation.validUntil}`, COLS.amount - 120, ctx.y, {
      size: 8.5,
      color: MUTED,
      align: 'right',
      width: RIGHT_EDGE - (COLS.amount - 120),
    });
  }

  // seller block, under the logo
  let sellerY = A4.h - MARGIN - 48;
  for (const line of [SITE.legalName, ...SITE.addressLines, `GSTIN ${SITE.gstin}`]) {
    text(ctx, line, MARGIN, sellerY, { size: 8, color: MUTED });
    sellerY -= 11;
  }

  ctx.y = Math.min(ctx.y, sellerY) - 12;
  rule(ctx, ctx.y);
  ctx.y -= 18;

  /* ------------------------------------------------------------- bill / from */
  const client = quotation.client;
  const blockTop = ctx.y;

  text(ctx, 'QUOTATION FOR', MARGIN, ctx.y, { size: 7.5, bold: true, color: MUTED });
  ctx.y -= 14;
  text(ctx, client?.company ?? '', MARGIN, ctx.y, { size: 11, bold: true });
  ctx.y -= 13;
  for (const line of [
    client?.contactPerson,
    client?.address,
    [client?.city, client?.state, client?.pincode].filter(Boolean).join(', '),
    client?.gstin ? `GSTIN ${client.gstin}` : '',
    client?.phone,
  ].filter(Boolean) as string[]) {
    for (const wrapped of wrap(font, line, 8.5, 230)) {
      text(ctx, wrapped, MARGIN, ctx.y, { size: 8.5, color: MUTED });
      ctx.y -= 11;
    }
  }

  let rightY = blockTop;
  const rightX = 330;
  text(ctx, 'RAISED BY', rightX, rightY, { size: 7.5, bold: true, color: MUTED });
  rightY -= 14;
  text(ctx, quotation.createdByName || SITE.shortName, rightX, rightY, { size: 10, bold: true });
  rightY -= 13;
  for (const line of [quotation.office, SITE.phone, SITE.emailPrimary, quotation.title].filter(Boolean)) {
    text(ctx, line, rightX, rightY, { size: 8.5, color: MUTED });
    rightY -= 11;
  }

  ctx.y = Math.min(ctx.y, rightY) - 10;
  rule(ctx, ctx.y);
  ctx.y -= 16;

  /* ---------------------------------------------------------------- items */
  tableHead(ctx);

  for (const [i, item] of quotation.items.entries()) {
    const nameLines = wrap(bold, item.name, 9, W.item);
    const needed = 14 + (nameLines.length - 1) * 11 + (item.code ? 10 : 0) + (item.note ? 10 : 0);

    // keep the totals block off a page of its own
    if (ctx.y - needed < MARGIN + 90) {
      newPage(ctx);
      tableHead(ctx);
    }

    const rowTop = ctx.y;
    text(ctx, String(i + 1).padStart(2, '0'), COLS.num, rowTop, { size: 8, color: MUTED });

    let lineY = rowTop;
    for (const nameLine of nameLines) {
      text(ctx, nameLine, COLS.item, lineY, { size: 9, bold: true });
      lineY -= 11;
    }
    if (item.code) {
      text(ctx, item.code, COLS.item, lineY, { size: 7.5, color: MUTED });
      lineY -= 10;
    }
    if (item.note) {
      for (const noteLine of wrap(font, item.note, 7.5, W.item)) {
        text(ctx, noteLine, COLS.item, lineY, { size: 7.5, color: MUTED });
        lineY -= 10;
      }
    }

    text(ctx, item.mrp ? inr(item.mrp) : '-', COLS.mrp, rowTop, { size: 8.5, color: MUTED, align: 'right', width: W.mrp });
    text(ctx, item.discountPct ? `${item.discountPct}%` : '-', COLS.disc, rowTop, {
      size: 8.5,
      color: MUTED,
      align: 'right',
      width: W.disc,
    });
    text(ctx, inr(item.unitPrice), COLS.rate, rowTop, { size: 8.5, align: 'right', width: W.rate });
    text(ctx, String(item.qty), COLS.qty, rowTop, { size: 8.5, align: 'right', width: W.qty });
    text(ctx, inr(item.lineTotal), COLS.amount, rowTop, {
      size: 9,
      bold: true,
      align: 'right',
      width: RIGHT_EDGE - COLS.amount,
    });

    ctx.y = Math.min(lineY, rowTop - 14) - 4;
    rule(ctx, ctx.y + 6, rgb(0.94, 0.96, 0.98));
  }

  /* ---------------------------------------------------------------- totals */
  const totals = quoteTotals(quotation.items, {
    taxRate: quotation.taxRate,
    clientState: client?.state ?? '',
  });

  if (ctx.y < MARGIN + 130) newPage(ctx);
  ctx.y -= 12;

  const labelX = 360;
  const valueX = COLS.amount;
  const valueW = RIGHT_EDGE - COLS.amount;

  const totalRows: [string, string][] = [['Subtotal', inr(totals.subtotal)]];
  if (totals.interState) {
    totalRows.push([`IGST ${totals.taxRate}%`, inr(totals.igst)]);
  } else {
    totalRows.push([`CGST ${totals.taxRate / 2}%`, inr(totals.cgst)]);
    totalRows.push([`SGST ${totals.taxRate / 2}%`, inr(totals.sgst)]);
  }

  for (const [label, value] of totalRows) {
    text(ctx, label, labelX, ctx.y, { size: 9, color: MUTED });
    text(ctx, value, valueX, ctx.y, { size: 9, align: 'right', width: valueW });
    ctx.y -= 14;
  }

  ctx.page.drawLine({
    start: { x: labelX, y: ctx.y + 5 },
    end: { x: RIGHT_EDGE, y: ctx.y + 5 },
    thickness: 0.7,
    color: LINE,
  });
  ctx.y -= 6;
  text(ctx, 'Total', labelX, ctx.y, { size: 10.5, bold: true });
  text(ctx, inr(totals.total), valueX, ctx.y, { size: 11.5, bold: true, color: ACCENT, align: 'right', width: valueW });
  ctx.y -= 20;

  text(ctx, 'Amount in words', MARGIN, ctx.y, { size: 7.5, bold: true, color: MUTED });
  ctx.y -= 11;
  for (const line of wrap(font, amountInWords(totals.total), 8.5, RIGHT_EDGE - MARGIN)) {
    text(ctx, line, MARGIN, ctx.y, { size: 8.5 });
    ctx.y -= 11;
  }

  /* ------------------------------------------------------------ notes/terms */
  for (const [heading, body] of [
    ['Notes', quotation.notes],
    ['Terms', quotation.terms],
  ] as [string, string][]) {
    if (!body?.trim()) continue;
    const lines = wrap(font, body, 8.5, RIGHT_EDGE - MARGIN);
    if (ctx.y - (lines.length * 11 + 26) < MARGIN + 40) newPage(ctx);
    ctx.y -= 14;
    text(ctx, heading, MARGIN, ctx.y, { size: 7.5, bold: true, color: MUTED });
    ctx.y -= 12;
    for (const line of lines) {
      text(ctx, line, MARGIN, ctx.y, { size: 8.5, color: MUTED });
      ctx.y -= 11;
    }
  }

  /* ---------------------------------------------------------------- footer */
  ctx.pages.forEach((page, i) => {
    page.drawLine({
      start: { x: MARGIN, y: MARGIN + 22 },
      end: { x: RIGHT_EDGE, y: MARGIN + 22 },
      thickness: 0.7,
      color: LINE,
    });
    const note = safe(
      `Computer-generated quotation - no signature required. Questions? ${SITE.phone} / ${SITE.emailPrimary}`,
    );
    page.drawText(note, { x: MARGIN, y: MARGIN + 10, size: 7.5, font, color: MUTED });
    const label = safe(`Page ${i + 1} of ${ctx.pages.length}`);
    page.drawText(label, {
      x: RIGHT_EDGE - font.widthOfTextAtSize(label, 7.5),
      y: MARGIN + 10,
      size: 7.5,
      font,
      color: MUTED,
    });
  });

  return doc.save();
}

export const quotationFilename = (quotation: QuotationRecord) =>
  `${quotation.number}-${safe(quotation.client?.company ?? 'quotation').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
