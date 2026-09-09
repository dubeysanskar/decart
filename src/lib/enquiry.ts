/**
 * The enquiry list — a basket that ends in a quotation, not a checkout.
 *
 * A buyer furnishing a floor wants sixty task chairs, eight cabins and four boardroom tables.
 * Until now each of those was a separate enquiry from a separate product page, and whoever
 * answered had to reassemble the floor from three emails. This collects the models with
 * quantities and sends one enquiry the sales desk can quote in a single pass.
 *
 * It lives in localStorage, not on the server: nobody signs in to browse a catalogue, and a
 * half-built list is not worth a database row until the buyer actually sends it.
 *
 * Everything here is deliberately client-safe (no 'server-only') so the /enquiry page, the
 * header badge and the lead payload all share one definition of a line.
 */

export type EnquiryItem = {
  slug: string;
  family: string;
  code: string;
  name: string;
  qty: number;
  /** Only carried when the catalogue publishes a price for the model — most are quoted. */
  price?: number;
  image?: string;
};

export const ENQUIRY_KEY = 'decart.enquiry.v1';
/** A quotation with more than this many lines is a spreadsheet job, not a web form. */
export const MAX_LINES = 60;
export const MAX_QTY = 9999;

const clampQty = (qty: number) => Math.min(MAX_QTY, Math.max(1, Math.round(Number(qty) || 1)));

/** Keeps only what we wrote: a hand-edited or half-migrated store must not crash the page. */
function sane(value: unknown): EnquiryItem | null {
  if (!value || typeof value !== 'object') return null;
  const row = value as Record<string, unknown>;
  const str = (key: string) => (typeof row[key] === 'string' ? (row[key] as string).slice(0, 200) : '');
  if (!str('slug') || !str('code')) return null;
  return {
    slug: str('slug'),
    family: str('family'),
    code: str('code'),
    name: str('name') || str('code'),
    qty: clampQty(row.qty as number),
    price: typeof row.price === 'number' && row.price > 0 ? row.price : undefined,
    image: str('image') || undefined,
  };
}

export function readEnquiry(): EnquiryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ENQUIRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sane).filter(Boolean).slice(0, MAX_LINES) as EnquiryItem[];
  } catch {
    // private mode, blocked storage, corrupt JSON — an empty list is the safe answer
    return [];
  }
}

export function writeEnquiry(items: EnquiryItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ENQUIRY_KEY, JSON.stringify(items.slice(0, MAX_LINES)));
  } catch {
    /* storage full or blocked: the list still works for this page view */
  }
}

/** Adding a model already on the list tops up its quantity rather than repeating the line. */
export function mergeItem(items: EnquiryItem[], item: EnquiryItem): EnquiryItem[] {
  const at = items.findIndex((row) => row.slug === item.slug);
  if (at === -1) return items.length >= MAX_LINES ? items : [...items, { ...item, qty: clampQty(item.qty) }];
  const next = [...items];
  next[at] = { ...next[at], qty: clampQty(next[at].qty + item.qty) };
  return next;
}

export function setItemQty(items: EnquiryItem[], slug: string, qty: number): EnquiryItem[] {
  return items.map((row) => (row.slug === slug ? { ...row, qty: clampQty(qty) } : row));
}

export function removeItem(items: EnquiryItem[], slug: string): EnquiryItem[] {
  return items.filter((row) => row.slug !== slug);
}

export type EnquirySummary = {
  lines: number;
  units: number;
  /** Indicative subtotal of the lines the catalogue prices — never a quotation. */
  pricedTotal: number;
  pricedLines: number;
  onRequestLines: number;
};

export function summarise(items: EnquiryItem[]): EnquirySummary {
  return items.reduce<EnquirySummary>(
    (acc, row) => {
      acc.lines += 1;
      acc.units += row.qty;
      if (row.price) {
        acc.pricedLines += 1;
        acc.pricedTotal += row.price * row.qty;
      } else {
        acc.onRequestLines += 1;
      }
      return acc;
    },
    { lines: 0, units: 0, pricedTotal: 0, pricedLines: 0, onRequestLines: 0 },
  );
}

/**
 * The list as plain text for the lead. It goes into the message body on purpose: that is what
 * the notification email prints and what the inbox shows, so the desk reads the floor without
 * opening anything else.
 */
export function itemsAsText(items: EnquiryItem[]): string {
  if (!items.length) return '';
  const { lines, units } = summarise(items);
  const rows = items.map((row, i) => `${i + 1}. ${row.code} — ${row.name} × ${row.qty}`);
  return [`Enquiry list (${lines} ${lines === 1 ? 'model' : 'models'}, ${units} units):`, ...rows].join('\n');
}
