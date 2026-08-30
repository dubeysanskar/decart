import { randomBytes } from 'crypto';
import { all, one, run, now, newId, J, parse, type Arg, type Row } from './repo';
import { priceItem, quoteTotals, formatQuoteNumber, type PricingMode, type QuoteStatus } from './quote-calc';

/* ------------------------------------------------------------------ types */

export type QuoteClientRecord = {
  _id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
  notes: string;
  createdAt: string;
};

export type QuoteItemRecord = {
  _id: string;
  productId: string;
  code: string;
  name: string;
  family: string;
  image: string;
  mrp: number;
  mode: PricingMode;
  discountPct: number;
  unitPrice: number;
  qty: number;
  lineTotal: number;
  note: string;
};

export type QuotationRecord = {
  _id: string;
  number: string;
  token: string;
  clientId: string;
  client: QuoteClientRecord | null;
  status: QuoteStatus;
  title: string;
  notes: string;
  terms: string;
  taxRate: number;
  interState: boolean;
  subtotal: number;
  taxAmount: number;
  total: number;
  validUntil: string;
  createdBy: string;
  createdByName: string;
  office: string;
  sentAt: string;
  viewedAt: string;
  respondedAt: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  items: QuoteItemRecord[];
};

export type QuoteActivityRecord = {
  _id: string;
  event: string;
  actor: string;
  meta: Record<string, unknown>;
  at: string;
};

/* ------------------------------------------------------------------ mapping */

const num = (v: unknown) => Number(v ?? 0);
const str = (v: unknown) => String(v ?? '');

function mapClient(row: Row): QuoteClientRecord {
  return {
    _id: str(row.id),
    company: str(row.company),
    contactPerson: str(row.contactPerson),
    email: str(row.email),
    phone: str(row.phone),
    address: str(row.address),
    city: str(row.city),
    state: str(row.state),
    pincode: str(row.pincode),
    gstin: str(row.gstin),
    pan: str(row.pan),
    notes: str(row.notes),
    createdAt: str(row.createdAt),
  };
}

function mapItem(row: Row): QuoteItemRecord {
  return {
    _id: str(row.id),
    productId: str(row.productId),
    code: str(row.code),
    name: str(row.name),
    family: str(row.family),
    image: str(row.image),
    mrp: num(row.mrp),
    mode: (str(row.mode) || 'price') as PricingMode,
    discountPct: num(row.discountPct),
    unitPrice: num(row.unitPrice),
    qty: num(row.qty),
    lineTotal: num(row.lineTotal),
    note: str(row.note),
  };
}

function mapQuotation(row: Row, items: QuoteItemRecord[] = []): QuotationRecord {
  return {
    _id: str(row.id),
    number: str(row.number),
    token: str(row.token),
    clientId: str(row.clientId),
    // the snapshot is what the quotation was raised against, so it survives a later client edit
    client: parse<QuoteClientRecord | null>(row.clientSnapshot, null),
    status: (str(row.status) || 'draft') as QuoteStatus,
    title: str(row.title),
    notes: str(row.notes),
    terms: str(row.terms),
    taxRate: num(row.taxRate),
    interState: Boolean(Number(row.interState)),
    subtotal: num(row.subtotal),
    taxAmount: num(row.taxAmount),
    total: num(row.total),
    validUntil: str(row.validUntil),
    createdBy: str(row.createdBy),
    createdByName: str(row.createdByName),
    office: str(row.office),
    sentAt: str(row.sentAt),
    viewedAt: str(row.viewedAt),
    respondedAt: str(row.respondedAt),
    viewCount: num(row.viewCount),
    downloadCount: num(row.downloadCount),
    createdAt: str(row.createdAt),
    updatedAt: str(row.updatedAt),
    items,
  };
}

/* ------------------------------------------------------------------ clients */

export async function listQuoteClients(search = '', limit = 50): Promise<QuoteClientRecord[]> {
  const q = search.trim();
  if (!q) {
    const rows = await all(`SELECT * FROM quote_clients ORDER BY company ASC LIMIT ?`, [limit]);
    return rows.map(mapClient);
  }
  const like = `%${q}%`;
  const rows = await all(
    `SELECT * FROM quote_clients
     WHERE company LIKE ? OR contactPerson LIKE ? OR phone LIKE ? OR email LIKE ? OR gstin LIKE ?
     ORDER BY company ASC LIMIT ?`,
    [like, like, like, like, like, limit],
  );
  return rows.map(mapClient);
}

export async function getQuoteClient(id: string): Promise<QuoteClientRecord | null> {
  const row = await one(`SELECT * FROM quote_clients WHERE id = ?`, [id]);
  return row ? mapClient(row) : null;
}

export type QuoteClientInput = Partial<Omit<QuoteClientRecord, '_id' | 'createdAt'>> & { company: string };

export async function createQuoteClient(input: QuoteClientInput, createdBy = ''): Promise<QuoteClientRecord> {
  const id = newId();
  const at = now();
  await run(
    `INSERT INTO quote_clients
      (id, company, contactPerson, email, phone, address, city, state, pincode, gstin, pan, notes, createdBy, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      input.company.trim(),
      input.contactPerson ?? '',
      input.email ?? '',
      input.phone ?? '',
      input.address ?? '',
      input.city ?? '',
      input.state ?? '',
      input.pincode ?? '',
      input.gstin ?? '',
      input.pan ?? '',
      input.notes ?? '',
      createdBy,
      at,
      at,
    ],
  );
  return (await getQuoteClient(id))!;
}

export async function updateQuoteClient(id: string, input: QuoteClientInput): Promise<QuoteClientRecord | null> {
  await run(
    `UPDATE quote_clients SET company=?, contactPerson=?, email=?, phone=?, address=?, city=?, state=?,
       pincode=?, gstin=?, pan=?, notes=?, updatedAt=? WHERE id=?`,
    [
      input.company.trim(),
      input.contactPerson ?? '',
      input.email ?? '',
      input.phone ?? '',
      input.address ?? '',
      input.city ?? '',
      input.state ?? '',
      input.pincode ?? '',
      input.gstin ?? '',
      input.pan ?? '',
      input.notes ?? '',
      now(),
      id,
    ],
  );
  return getQuoteClient(id);
}

/* ------------------------------------------------------------------ numbering */

/**
 * Reserves the next number for the current year. The upsert with RETURNING is a single
 * statement, so two salespeople clicking Generate at the same moment cannot take the same
 * number. The sequence only ever moves forward — cancelling never releases a number.
 */
async function reserveNumber(): Promise<string> {
  const year = String(new Date().getFullYear());
  const row = await one(
    `INSERT INTO quotation_counters (year, seq) VALUES (?, 1)
     ON CONFLICT(year) DO UPDATE SET seq = seq + 1
     RETURNING seq`,
    [year],
  );
  return formatQuoteNumber(year, Number(row?.seq ?? 1));
}

/* ------------------------------------------------------------------ quotations */

export type QuoteItemInputRecord = {
  productId?: string;
  code?: string;
  name: string;
  family?: string;
  image?: string;
  mrp?: number;
  mode?: PricingMode;
  discountPct?: number;
  unitPrice?: number;
  qty?: number;
  note?: string;
};

export type CreateQuotationInput = {
  clientId: string;
  title?: string;
  notes?: string;
  terms?: string;
  taxRate?: number;
  validUntil?: string;
  items: QuoteItemInputRecord[];
};

export type QuoteActor = { id: string; name: string; office?: string };

export async function createQuotation(
  input: CreateQuotationInput,
  actor: QuoteActor,
): Promise<QuotationRecord | null> {
  const client = await getQuoteClient(input.clientId);
  if (!client) return null;

  const priced = input.items
    .filter((item) => item.name?.trim())
    .map((item, index) => {
      const base = {
        mrp: Number(item.mrp ?? 0),
        qty: Number(item.qty ?? 1),
        mode: (item.mode ?? 'price') as PricingMode,
        discountPct: Number(item.discountPct ?? 0),
        unitPrice: Number(item.unitPrice ?? 0),
      };
      return { ...item, ...base, ...priceItem(base), ord: index };
    });

  // recomputed here, never taken from the request body
  const totals = quoteTotals(priced, { taxRate: input.taxRate ?? 18, clientState: client.state });

  const id = newId();
  const at = now();
  const number = await reserveNumber();
  const token = randomBytes(16).toString('hex');

  await run(
    `INSERT INTO quotations
      (id, number, token, clientId, clientSnapshot, status, title, notes, terms, taxRate, interState,
       subtotal, taxAmount, total, validUntil, createdBy, createdByName, office, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id,
      number,
      token,
      client._id,
      J(client),
      'generated',
      input.title ?? '',
      input.notes ?? '',
      input.terms ?? '',
      totals.taxRate,
      totals.interState ? 1 : 0,
      totals.subtotal,
      totals.taxAmount,
      totals.total,
      input.validUntil ?? '',
      actor.id,
      actor.name,
      actor.office ?? '',
      at,
      at,
    ],
  );

  for (const item of priced) {
    await run(
      `INSERT INTO quotation_items
        (id, quotationId, productId, code, name, family, image, mrp, mode, discountPct, unitPrice, qty, lineTotal, note, ord)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        newId(),
        id,
        item.productId ?? '',
        item.code ?? '',
        item.name,
        item.family ?? '',
        item.image ?? '',
        item.mrp,
        item.mode,
        item.discountPct,
        item.unitPrice,
        item.qty,
        item.lineTotal,
        item.note ?? '',
        item.ord,
      ],
    );
  }

  await addActivity(id, 'created', actor.name, { number, total: totals.total });
  return getQuotation(id);
}

async function itemsFor(quotationId: string): Promise<QuoteItemRecord[]> {
  const rows = await all(`SELECT * FROM quotation_items WHERE quotationId = ? ORDER BY ord ASC`, [quotationId]);
  return rows.map(mapItem);
}

export async function getQuotation(id: string): Promise<QuotationRecord | null> {
  const row = await one(`SELECT * FROM quotations WHERE id = ?`, [id]);
  return row ? mapQuotation(row, await itemsFor(id)) : null;
}

/** Public lookup. Both halves of the link must match, so the number alone is not enough. */
export async function getQuotationByToken(number: string, token: string): Promise<QuotationRecord | null> {
  const row = await one(`SELECT * FROM quotations WHERE number = ? AND token = ?`, [number, token]);
  return row ? mapQuotation(row, await itemsFor(str(row.id))) : null;
}

export type QuoteListFilter = {
  /** non-master users only ever see their own */
  ownerId?: string;
  status?: string;
  search?: string;
  office?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export async function listQuotations(filter: QuoteListFilter = {}): Promise<QuotationRecord[]> {
  const where: string[] = [];
  const args: Arg[] = [];

  if (filter.ownerId) {
    where.push('createdBy = ?');
    args.push(filter.ownerId);
  }
  if (filter.status) {
    where.push('status = ?');
    args.push(filter.status);
  }
  if (filter.office) {
    where.push('office = ?');
    args.push(filter.office);
  }
  if (filter.from) {
    where.push('createdAt >= ?');
    args.push(filter.from);
  }
  if (filter.to) {
    where.push('createdAt <= ?');
    args.push(filter.to);
  }
  if (filter.search?.trim()) {
    const like = `%${filter.search.trim()}%`;
    where.push('(number LIKE ? OR clientSnapshot LIKE ? OR createdByName LIKE ? OR title LIKE ?)');
    args.push(like, like, like, like);
  }

  const rows = await all(
    `SELECT * FROM quotations ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY createdAt DESC LIMIT ?`,
    [...args, filter.limit ?? 200],
  );
  return rows.map((row) => mapQuotation(row));
}

export async function quoteStats(ownerId?: string) {
  const scope = ownerId ? ' WHERE createdBy = ?' : '';
  const args: Arg[] = ownerId ? [ownerId] : [];
  const rows = await all(
    `SELECT status, COUNT(*) n, COALESCE(SUM(total), 0) value FROM quotations${scope} GROUP BY status`,
    args,
  );
  const byStatus: Record<string, { count: number; value: number }> = {};
  let count = 0;
  let value = 0;
  for (const row of rows) {
    const n = Number(row.n ?? 0);
    const v = Number(row.value ?? 0);
    byStatus[str(row.status)] = { count: n, value: v };
    count += n;
    value += v;
  }
  return { count, value, byStatus };
}

/* ------------------------------------------------------------------ status + activity */

export async function addActivity(
  quotationId: string,
  event: string,
  actor = '',
  meta: Record<string, unknown> = {},
) {
  await run(`INSERT INTO quotation_activity (id, quotationId, event, actor, meta, at) VALUES (?,?,?,?,?,?)`, [
    newId(),
    quotationId,
    event,
    actor,
    J(meta),
    now(),
  ]);
}

export async function listActivity(quotationId: string): Promise<QuoteActivityRecord[]> {
  const rows = await all(`SELECT * FROM quotation_activity WHERE quotationId = ? ORDER BY at DESC`, [quotationId]);
  return rows.map((row) => ({
    _id: str(row.id),
    event: str(row.event),
    actor: str(row.actor),
    meta: parse<Record<string, unknown>>(row.meta, {}),
    at: str(row.at),
  }));
}

export async function setQuoteStatus(id: string, status: QuoteStatus, actor = '', meta: Record<string, unknown> = {}) {
  const at = now();
  const stamp =
    status === 'sent' ? ', sentAt = ?' : status === 'accepted' || status === 'rejected' ? ', respondedAt = ?' : '';
  const args: Arg[] = stamp ? [status, at, at, id] : [status, at, id];
  await run(`UPDATE quotations SET status = ?, updatedAt = ?${stamp} WHERE id = ?`, args);
  await addActivity(id, status, actor, meta);
}

/**
 * A view from the public link. Only the first view promotes `sent` to `viewed` — a client
 * opening it again should not drag an accepted quotation backwards through the pipeline.
 */
export async function recordQuoteView(id: string, currentStatus: QuoteStatus, meta: Record<string, unknown> = {}) {
  const at = now();
  const promote = currentStatus === 'sent' || currentStatus === 'generated';
  await run(
    `UPDATE quotations SET viewCount = viewCount + 1, viewedAt = CASE WHEN viewedAt = '' THEN ? ELSE viewedAt END
       ${promote ? ', status = ?' : ''}, updatedAt = ? WHERE id = ?`,
    promote ? [at, 'viewed', at, id] : [at, at, id],
  );
  await addActivity(id, 'viewed', 'client', meta);
}

export async function recordQuoteDownload(id: string) {
  await run(`UPDATE quotations SET downloadCount = downloadCount + 1, updatedAt = ? WHERE id = ?`, [now(), id]);
  await addActivity(id, 'downloaded', 'client');
}

/** Archive rather than delete: the spec is explicit that a shared quotation is never hard-deleted. */
export async function cancelQuotation(id: string, actor = '', reason = '') {
  await setQuoteStatus(id, 'cancelled', actor, reason ? { reason } : {});
}
