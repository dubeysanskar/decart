/**
 * Quotation arithmetic. Deliberately free of server-only imports: the wizard computes totals as
 * the user types and the API recomputes them on save, and both must agree to the paisa. Never
 * trust the totals a browser posts — the API stores what these functions return.
 */

export const QUOTE_STATUSES = [
  'draft',
  'generated',
  'sent',
  'viewed',
  'accepted',
  'rejected',
  'expired',
  'cancelled',
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: 'Draft',
  generated: 'Generated',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  rejected: 'Rejected',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

/** The seller's registered state. Anything else on a quotation is an inter-state supply. */
export const SELLER_STATE = 'Haryana';

export type PricingMode = 'price' | 'discount';

export type QuoteItemInput = {
  mrp: number;
  qty: number;
  mode: PricingMode;
  /** used when mode === 'discount' */
  discountPct: number;
  /** used when mode === 'price' */
  unitPrice: number;
};

export type QuoteItemTotals = {
  unitPrice: number;
  discountPct: number;
  lineTotal: number;
};

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Both pricing modes end up as a unit price and a discount percentage, so a quotation can show
 * "20% off MRP" or a flat negotiated rate and still total up the same way.
 */
export function priceItem(item: QuoteItemInput): QuoteItemTotals {
  const mrp = Math.max(0, Number(item.mrp) || 0);
  const qty = Math.max(1, Math.floor(Number(item.qty) || 1));

  if (item.mode === 'discount') {
    const discountPct = clamp(Number(item.discountPct) || 0, 0, 100);
    const unitPrice = round2(mrp * (1 - discountPct / 100));
    return { unitPrice, discountPct, lineTotal: round2(unitPrice * qty) };
  }

  const unitPrice = Math.max(0, round2(Number(item.unitPrice) || 0));
  // derive the discount for display; an above-MRP price is not a negative discount
  const discountPct = mrp > 0 ? round2(clamp(((mrp - unitPrice) / mrp) * 100, 0, 100)) : 0;
  return { unitPrice, discountPct, lineTotal: round2(unitPrice * qty) };
}

export type QuoteTotals = {
  subtotal: number;
  taxRate: number;
  interState: boolean;
  /** CGST and SGST each carry half the rate on an intra-state supply; both are 0 inter-state. */
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  total: number;
};

export function quoteTotals(
  items: QuoteItemInput[],
  { taxRate = 18, clientState = '' }: { taxRate?: number; clientState?: string } = {},
): QuoteTotals {
  const subtotal = round2(items.reduce((sum, item) => sum + priceItem(item).lineTotal, 0));
  const rate = clamp(Number(taxRate) || 0, 0, 100);

  // an unknown state is treated as intra-state rather than guessing IGST onto a local sale
  const interState = Boolean(clientState) && clientState.trim().toLowerCase() !== SELLER_STATE.toLowerCase();

  const taxAmount = round2((subtotal * rate) / 100);
  const half = round2(taxAmount / 2);

  return {
    subtotal,
    taxRate: rate,
    interState,
    cgst: interState ? 0 : half,
    // the halves must add back to taxAmount exactly, so the second one absorbs the rounding
    sgst: interState ? 0 : round2(taxAmount - half),
    igst: interState ? taxAmount : 0,
    taxAmount,
    total: round2(subtotal + taxAmount),
  };
}

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export const formatINR = (amount: number) => INR.format(Number.isFinite(amount) ? amount : 0);

/**
 * Quotation number: QM-<year>-<six digits>. The sequence comes from the database so it is never
 * reused; this only formats it.
 */
export const formatQuoteNumber = (year: number | string, seq: number) =>
  `QM-${year}-${String(seq).padStart(6, '0')}`;

/** Public link: the readable number plus a random token, so the URL cannot be guessed in order. */
export const quotePath = (number: string, token: string) => `/q/${number}-${token}`;

/** Splits `/q/QM-2026-000184-<token>` back into its two halves. */
export function parseQuoteSlug(slug: string): { number: string; token: string } | null {
  const at = slug.lastIndexOf('-');
  if (at <= 0) return null;
  const number = slug.slice(0, at);
  const token = slug.slice(at + 1);
  if (!/^QM-\d{4}-\d{6}$/.test(number) || !/^[a-f0-9]{24,64}$/i.test(token)) return null;
  return { number, token };
}
