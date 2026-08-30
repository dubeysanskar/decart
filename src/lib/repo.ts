import { randomUUID } from 'node:crypto';
import { getDb } from './db';

/**
 * Repository layer over Turso (libSQL). Every function returns plain objects in the same
 * shape the old Mongoose `.lean()` documents had — `_id` string ids, `group`/`order`
 * field names, nested `price`/`seo`/`source`/`mailStatus` objects — so components,
 * admin pages and API consumers are unaffected by the storage change.
 *
 * Conventions: booleans are stored as 0/1, arrays/objects as JSON text, dates as ISO
 * strings (which sort/compare correctly as text).
 */

export type Row = Record<string, unknown>;
export type Arg = string | number | null;

export const now = () => new Date().toISOString();
export const newId = () => randomUUID();
export const J = (value: unknown) => JSON.stringify(value ?? null);
export const parse = <T>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};
export const bool = (value: unknown) => Boolean(Number(value));
const likeArg = (q: string) => `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;

export async function all(sql: string, args: Arg[] = []): Promise<Row[]> {
  const result = await getDb().execute({ sql, args });
  return result.rows as unknown as Row[];
}

export async function one(sql: string, args: Arg[] = []): Promise<Row | null> {
  const rows = await all(sql, args);
  return rows[0] ?? null;
}

export async function run(sql: string, args: Arg[] = []) {
  return getDb().execute({ sql, args });
}

async function count(sql: string, args: Arg[] = []): Promise<number> {
  const row = await one(sql, args);
  return Number(row?.n ?? 0);
}

// ================================================================ products

export type ProductRecord = {
  _id: string;
  code: string;
  name: string;
  slug: string;
  family: string;
  group: string;
  tags: string[];
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
  buildOptions: boolean;
  sizeMm: string;
  finishNote: string;
  images: { src: string; alt: string }[];
  colourways: { label: string; slug: string; images: string[] }[];
  cataloguePage?: number;
  price: { amount: number; show: boolean };
  moq: number;
  featured: boolean;
  bestSeller: boolean;
  status: string;
  needsPhoto: boolean;
  needsReview: boolean;
  order: number;
  seo: { title?: string; description?: string };
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
};

function mapProduct(row: Row): ProductRecord {
  return {
    _id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    slug: String(row.slug),
    family: String(row.family),
    group: String(row.grp),
    tags: parse(row.tags, [] as string[]),
    summary: String(row.summary ?? ''),
    description: String(row.description ?? ''),
    specs: parse(row.specs, [] as { label: string; value: string }[]),
    buildOptions: bool(row.buildOptions),
    sizeMm: String(row.sizeMm ?? ''),
    finishNote: String(row.finishNote ?? ''),
    images: parse(row.images, [] as { src: string; alt: string }[]),
    colourways: parse(row.colourways, [] as { label: string; slug: string; images: string[] }[]),
    cataloguePage: row.cataloguePage == null ? undefined : Number(row.cataloguePage),
    price: { amount: Number(row.priceAmount ?? 0), show: bool(row.priceShow) },
    moq: Number(row.moq ?? 1),
    featured: bool(row.featured),
    bestSeller: bool(row.bestSeller),
    status: String(row.status),
    needsPhoto: bool(row.needsPhoto),
    needsReview: bool(row.needsReview),
    order: Number(row.ord ?? 0),
    seo: parse(row.seo, {} as { title?: string; description?: string }),
    ratingAvg: Number(row.ratingAvg ?? 0),
    ratingCount: Number(row.ratingCount ?? 0),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

/** JS field name → column + serialiser, for INSERT/UPDATE from validator output. */
const PRODUCT_COLUMNS: Record<string, (value: unknown) => [string, Arg][]> = {
  code: (v) => [['code', String(v).toUpperCase()]],
  name: (v) => [['name', String(v)]],
  slug: (v) => [['slug', String(v)]],
  family: (v) => [['family', String(v)]],
  group: (v) => [['grp', String(v)]],
  tags: (v) => [['tags', J(v ?? [])]],
  summary: (v) => [['summary', String(v ?? '')]],
  description: (v) => [['description', String(v ?? '')]],
  specs: (v) => [['specs', J(v ?? [])]],
  buildOptions: (v) => [['buildOptions', v ? 1 : 0]],
  sizeMm: (v) => [['sizeMm', String(v ?? '')]],
  finishNote: (v) => [['finishNote', String(v ?? '')]],
  images: (v) => [['images', J(v ?? [])]],
  colourways: (v) => [['colourways', J(v ?? [])]],
  cataloguePage: (v) => [['cataloguePage', v == null ? null : Number(v)]],
  price: (v) => {
    const price = (v ?? {}) as { amount?: number; show?: boolean };
    return [
      ['priceAmount', Number(price.amount ?? 0)],
      ['priceShow', price.show ? 1 : 0],
    ];
  },
  moq: (v) => [['moq', Number(v ?? 1)]],
  featured: (v) => [['featured', v ? 1 : 0]],
  bestSeller: (v) => [['bestSeller', v ? 1 : 0]],
  status: (v) => [['status', String(v)]],
  needsPhoto: (v) => [['needsPhoto', v ? 1 : 0]],
  needsReview: (v) => [['needsReview', v ? 1 : 0]],
  order: (v) => [['ord', Number(v ?? 0)]],
  seo: (v) => [['seo', J(v ?? {})]],
  ratingAvg: (v) => [['ratingAvg', Number(v ?? 0)]],
  ratingCount: (v) => [['ratingCount', Number(v ?? 0)]],
};

function productPairs(data: Record<string, unknown>): [string, Arg][] {
  const pairs: [string, Arg][] = [];
  for (const [field, value] of Object.entries(data)) {
    const toColumns = PRODUCT_COLUMNS[field];
    if (toColumns && value !== undefined) pairs.push(...toColumns(value));
  }
  return pairs;
}

export async function insertProduct(data: Record<string, unknown>): Promise<ProductRecord> {
  const id = newId();
  const stamp = now();
  const pairs = productPairs(data);
  const columns = ['id', ...pairs.map(([c]) => c), 'createdAt', 'updatedAt'];
  const args: Arg[] = [id, ...pairs.map(([, v]) => v), stamp, stamp];
  await run(
    `INSERT INTO products (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`,
    args,
  );
  return (await productBySlug(String(data.slug)))!;
}

export async function updateProductBySlug(
  slug: string,
  patch: Record<string, unknown>,
): Promise<ProductRecord | null> {
  const pairs = productPairs(patch);
  if (pairs.length) {
    await run(
      `UPDATE products SET ${pairs.map(([c]) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE slug = ?`,
      [...pairs.map(([, v]) => v), now(), slug],
    );
  }
  return productBySlug(String(patch.slug ?? slug));
}

export async function productBySlug(slug: string): Promise<ProductRecord | null> {
  const row = await one(`SELECT * FROM products WHERE slug = ?`, [slug]);
  return row ? mapProduct(row) : null;
}

export async function publishedProductBySlug(slug: string): Promise<ProductRecord | null> {
  const row = await one(`SELECT * FROM products WHERE slug = ? AND status != 'archived'`, [slug]);
  return row ? mapProduct(row) : null;
}

export async function publishedByFamily(family: string): Promise<ProductRecord[]> {
  const rows = await all(
    `SELECT * FROM products WHERE family = ? AND status = 'published' ORDER BY ord ASC, code ASC`,
    [family],
  );
  return rows.map(mapProduct);
}

export async function publishedProducts(): Promise<ProductRecord[]> {
  const rows = await all(`SELECT * FROM products WHERE status = 'published' ORDER BY family ASC, ord ASC`);
  return rows.map(mapProduct);
}

export async function featuredProducts(limit: number): Promise<ProductRecord[]> {
  const rows = await all(
    `SELECT * FROM products WHERE status = 'published' AND (featured = 1 OR bestSeller = 1)
     ORDER BY bestSeller DESC, ord ASC LIMIT ?`,
    [limit],
  );
  return rows.map(mapProduct);
}

export async function familyCounts(): Promise<Record<string, number>> {
  const rows = await all(`SELECT family, COUNT(*) AS n FROM products WHERE status = 'published' GROUP BY family`);
  return Object.fromEntries(rows.map((r) => [String(r.family), Number(r.n)]));
}

export type ProductFilter = {
  family?: string;
  group?: string;
  status?: string;
  needsPhoto?: boolean;
  q?: string;
  publishedOnly?: boolean;
};

function productWhere(filter: ProductFilter): { where: string; args: Arg[] } {
  const parts: string[] = [];
  const args: Arg[] = [];
  if (filter.publishedOnly) parts.push(`status = 'published'`);
  if (filter.family) {
    parts.push('family = ?');
    args.push(filter.family);
  }
  if (filter.group) {
    parts.push('grp = ?');
    args.push(filter.group);
  }
  if (filter.status) {
    parts.push('status = ?');
    args.push(filter.status);
  }
  if (filter.needsPhoto) parts.push('needsPhoto = 1');
  if (filter.q) {
    parts.push(`(name LIKE ? ESCAPE '\\' OR code LIKE ? ESCAPE '\\')`);
    args.push(likeArg(filter.q), likeArg(filter.q));
  }
  return { where: parts.length ? `WHERE ${parts.join(' AND ')}` : '', args };
}

export async function listProducts(filter: ProductFilter, limit = 400): Promise<ProductRecord[]> {
  const { where, args } = productWhere(filter);
  const rows = await all(`SELECT * FROM products ${where} ORDER BY family ASC, ord ASC LIMIT ?`, [...args, limit]);
  return rows.map(mapProduct);
}

export async function countProducts(filter: ProductFilter = {}): Promise<number> {
  const { where, args } = productWhere(filter);
  return count(`SELECT COUNT(*) AS n FROM products ${where}`, args);
}

export async function archiveProduct(slug: string) {
  await run(`UPDATE products SET status = 'archived', updatedAt = ? WHERE slug = ?`, [now(), slug]);
}

export async function deleteArchivedProduct(slug: string) {
  await run(`DELETE FROM products WHERE slug = ? AND status = 'archived'`, [slug]);
}

export async function setProductRating(slug: string, ratingCount: number, ratingAvg: number) {
  await run(`UPDATE products SET ratingCount = ?, ratingAvg = ?, updatedAt = ? WHERE slug = ?`, [
    ratingCount,
    ratingAvg,
    now(),
    slug,
  ]);
}

// ================================================================ leads

export type LeadNote = { by: string; text: string; at: string };
export type LeadResponse = { subject: string; body: string; sentTo: string; at: string; messageId: string };

export type LeadRecord = {
  _id: string;
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  productSlug: string;
  productCode: string;
  quantity: string;
  targetDate: string;
  extra: Record<string, string>;
  source: { page: string; utm: Record<string, string> };
  status: string;
  disposition: string;
  notes: LeadNote[];
  responses: LeadResponse[];
  assignedTo: string;
  isRead: boolean;
  mailStatus: { admin: string; ack: string };
  createdAt: string;
  updatedAt: string;
};

function mapLead(row: Row): LeadRecord {
  return {
    _id: String(row.id),
    type: String(row.type),
    name: String(row.name),
    company: String(row.company ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone),
    city: String(row.city ?? ''),
    message: String(row.message ?? ''),
    productSlug: String(row.productSlug ?? ''),
    productCode: String(row.productCode ?? ''),
    quantity: String(row.quantity ?? ''),
    targetDate: String(row.targetDate ?? ''),
    extra: parse(row.extra, {} as Record<string, string>),
    source: { page: String(row.sourcePage ?? ''), utm: parse(row.sourceUtm, {} as Record<string, string>) },
    status: String(row.status),
    disposition: String(row.disposition ?? ''),
    notes: parse(row.notes, [] as LeadNote[]),
    responses: parse(row.responses, [] as LeadResponse[]),
    assignedTo: String(row.assignedTo ?? ''),
    isRead: bool(row.isRead),
    mailStatus: { admin: String(row.mailAdmin ?? ''), ack: String(row.mailAck ?? '') },
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function insertLead(data: {
  type: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  message: string;
  productSlug: string;
  productCode: string;
  quantity: string;
  targetDate: string;
  extra: Record<string, string>;
  sourcePage: string;
  sourceUtm: Record<string, string>;
}): Promise<LeadRecord> {
  const id = newId();
  const stamp = now();
  await run(
    `INSERT INTO leads (id, type, name, company, email, phone, city, message, productSlug, productCode,
       quantity, targetDate, extra, sourcePage, sourceUtm, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.type,
      data.name,
      data.company,
      data.email.toLowerCase(),
      data.phone,
      data.city,
      data.message,
      data.productSlug,
      data.productCode,
      data.quantity,
      data.targetDate,
      J(data.extra),
      data.sourcePage,
      J(data.sourceUtm),
      stamp,
      stamp,
    ],
  );
  return (await leadById(id))!;
}

export async function leadById(id: string): Promise<LeadRecord | null> {
  const row = await one(`SELECT * FROM leads WHERE id = ?`, [id]);
  return row ? mapLead(row) : null;
}

export async function setLeadMailStatus(id: string, mailStatus: { admin: string; ack: string }) {
  await run(`UPDATE leads SET mailAdmin = ?, mailAck = ?, updatedAt = ? WHERE id = ?`, [
    mailStatus.admin,
    mailStatus.ack,
    now(),
    id,
  ]);
}

export type LeadFilter = {
  type?: string;
  status?: string;
  statusIn?: string[];
  disposition?: string;
  assignedTo?: string;
  q?: string;
  from?: string; // ISO date or yyyy-mm-dd
  to?: string; // yyyy-mm-dd (inclusive end of day)
};

function leadWhere(filter: LeadFilter): { where: string; args: Arg[] } {
  const parts: string[] = [];
  const args: Arg[] = [];
  if (filter.type) {
    parts.push('type = ?');
    args.push(filter.type);
  }
  if (filter.status) {
    parts.push('status = ?');
    args.push(filter.status);
  }
  if (filter.statusIn?.length) {
    parts.push(`status IN (${filter.statusIn.map(() => '?').join(', ')})`);
    args.push(...filter.statusIn);
  }
  if (filter.disposition) {
    parts.push('disposition = ?');
    args.push(filter.disposition);
  }
  if (filter.assignedTo) {
    parts.push('assignedTo = ?');
    args.push(filter.assignedTo);
  }
  if (filter.q) {
    const like = likeArg(filter.q);
    parts.push(
      `(name LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\' OR phone LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR productCode LIKE ? ESCAPE '\\')`,
    );
    args.push(like, like, like, like, like);
  }
  if (filter.from) {
    parts.push('createdAt >= ?');
    args.push(new Date(filter.from).toISOString());
  }
  if (filter.to) {
    parts.push('createdAt <= ?');
    args.push(new Date(`${filter.to}T23:59:59`).toISOString());
  }
  return { where: parts.length ? `WHERE ${parts.join(' AND ')}` : '', args };
}

export async function listLeads(filter: LeadFilter, limit = 300, offset = 0): Promise<LeadRecord[]> {
  const { where, args } = leadWhere(filter);
  const rows = await all(`SELECT * FROM leads ${where} ORDER BY createdAt DESC LIMIT ? OFFSET ?`, [
    ...args,
    limit,
    offset,
  ]);
  return rows.map(mapLead);
}

export async function countLeads(filter: LeadFilter = {}): Promise<number> {
  const { where, args } = leadWhere(filter);
  return count(`SELECT COUNT(*) AS n FROM leads ${where}`, args);
}

/**
 * Field patch + full replacement of the notes/responses timelines (the caller appends in JS,
 * mirroring the old `lead.notes.push(...); lead.save()` pattern).
 */
export async function updateLead(
  id: string,
  patch: Partial<{
    status: string;
    disposition: string;
    assignedTo: string;
    isRead: boolean;
    notes: LeadNote[];
    responses: LeadResponse[];
  }>,
): Promise<LeadRecord | null> {
  const sets: string[] = [];
  const args: Arg[] = [];
  if (patch.status !== undefined) {
    sets.push('status = ?');
    args.push(patch.status);
  }
  if (patch.disposition !== undefined) {
    sets.push('disposition = ?');
    args.push(patch.disposition);
  }
  if (patch.assignedTo !== undefined) {
    sets.push('assignedTo = ?');
    args.push(patch.assignedTo);
  }
  if (patch.isRead !== undefined) {
    sets.push('isRead = ?');
    args.push(patch.isRead ? 1 : 0);
  }
  if (patch.notes !== undefined) {
    sets.push('notes = ?');
    args.push(J(patch.notes));
  }
  if (patch.responses !== undefined) {
    sets.push('responses = ?');
    args.push(J(patch.responses));
  }
  if (sets.length) {
    await run(`UPDATE leads SET ${sets.join(', ')}, updatedAt = ? WHERE id = ?`, [...args, now(), id]);
  }
  return leadById(id);
}

export async function deleteLead(id: string) {
  await run(`DELETE FROM leads WHERE id = ?`, [id]);
}

export async function markLeadRead(id: string) {
  await run(`UPDATE leads SET isRead = 1 WHERE id = ?`, [id]);
}

/** Dashboard helpers */
export const countLeadsSince = (iso: string) => count(`SELECT COUNT(*) AS n FROM leads WHERE createdAt >= ?`, [iso]);
export const countLeadsByStatus = (status: string) =>
  count(`SELECT COUNT(*) AS n FROM leads WHERE status = ?`, [status]);
export const countStaleNew = (cutoffIso: string) =>
  count(`SELECT COUNT(*) AS n FROM leads WHERE status = 'new' AND createdAt < ?`, [cutoffIso]);
export const countLeadsStatusIn = (statuses: string[]) =>
  count(`SELECT COUNT(*) AS n FROM leads WHERE status IN (${statuses.map(() => '?').join(', ')})`, statuses);
export const countWonSince = (iso: string) =>
  count(`SELECT COUNT(*) AS n FROM leads WHERE status = 'won' AND updatedAt >= ?`, [iso]);

export async function latestLeads(limit = 5): Promise<LeadRecord[]> {
  const rows = await all(`SELECT * FROM leads ORDER BY createdAt DESC LIMIT ?`, [limit]);
  return rows.map(mapLead);
}

export async function leadTypeBreakdownSince(iso: string): Promise<{ _id: string; n: number }[]> {
  const rows = await all(
    `SELECT type, COUNT(*) AS n FROM leads WHERE createdAt >= ? GROUP BY type ORDER BY n DESC`,
    [iso],
  );
  return rows.map((r) => ({ _id: String(r.type), n: Number(r.n) }));
}

// ================================================================ reviews

export type ReviewRecord = {
  _id: string;
  productSlug: string | null;
  name: string;
  company: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  photo: string;
  status: string;
  featured: boolean;
  adminReply: string;
  createdAt: string;
  updatedAt: string;
};

function mapReview(row: Row): ReviewRecord {
  return {
    _id: String(row.id),
    productSlug: row.productSlug == null ? null : String(row.productSlug),
    name: String(row.name),
    company: String(row.company ?? ''),
    city: String(row.city ?? ''),
    rating: Number(row.rating),
    title: String(row.title ?? ''),
    body: String(row.body),
    photo: String(row.photo ?? ''),
    status: String(row.status),
    featured: bool(row.featured),
    adminReply: String(row.adminReply ?? ''),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function insertReview(data: {
  productSlug: string | null;
  name: string;
  company: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  photo: string;
}): Promise<ReviewRecord> {
  const id = newId();
  const stamp = now();
  await run(
    `INSERT INTO reviews (id, productSlug, name, company, city, rating, title, body, photo, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
    [id, data.productSlug, data.name, data.company, data.city, data.rating, data.title, data.body, data.photo, stamp, stamp],
  );
  return { ...(await one(`SELECT * FROM reviews WHERE id = ?`, [id]).then((r) => mapReview(r!))) };
}

/**
 * A testimonial typed in by the client rather than submitted through the public form. It lands
 * approved because an admin is the one entering it — there is nothing to moderate.
 */
export async function insertTestimonial(data: {
  name: string;
  company: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  photo: string;
  productSlug: string | null;
  featured: boolean;
}): Promise<ReviewRecord> {
  const id = newId();
  const stamp = now();
  await run(
    `INSERT INTO reviews (id, productSlug, name, company, city, rating, title, body, photo, status, featured, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?)`,
    [
      id,
      data.productSlug,
      data.name,
      data.company,
      data.city,
      data.rating,
      data.title,
      data.body,
      data.photo,
      data.featured ? 1 : 0,
      stamp,
      stamp,
    ],
  );
  return mapReview((await one(`SELECT * FROM reviews WHERE id = ?`, [id]))!);
}

export async function approvedReviewsFor(productSlug: string): Promise<ReviewRecord[]> {
  const rows = await all(
    `SELECT * FROM reviews WHERE productSlug = ? AND status = 'approved' ORDER BY createdAt DESC`,
    [productSlug],
  );
  return rows.map(mapReview);
}

export async function featuredApprovedReviews(limit = 3): Promise<ReviewRecord[]> {
  const rows = await all(
    `SELECT * FROM reviews WHERE status = 'approved' AND featured = 1 ORDER BY createdAt DESC LIMIT ?`,
    [limit],
  );
  return rows.map(mapReview);
}

export async function listReviews(status?: string): Promise<ReviewRecord[]> {
  const rows = status
    ? await all(`SELECT * FROM reviews WHERE status = ? ORDER BY createdAt DESC`, [status])
    : await all(`SELECT * FROM reviews ORDER BY createdAt DESC`);
  return rows.map(mapReview);
}

export async function reviewCountsByStatus(): Promise<Record<string, number>> {
  const rows = await all(`SELECT status, COUNT(*) AS n FROM reviews GROUP BY status`);
  return Object.fromEntries(rows.map((r) => [String(r.status), Number(r.n)]));
}

export const countPendingReviews = () => count(`SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'`);

export async function updateReview(
  id: string,
  patch: Partial<{ status: string; featured: boolean; adminReply: string }>,
): Promise<ReviewRecord | null> {
  const sets: string[] = [];
  const args: Arg[] = [];
  if (patch.status !== undefined) {
    sets.push('status = ?');
    args.push(patch.status);
  }
  if (patch.featured !== undefined) {
    sets.push('featured = ?');
    args.push(patch.featured ? 1 : 0);
  }
  if (patch.adminReply !== undefined) {
    sets.push('adminReply = ?');
    args.push(patch.adminReply);
  }
  if (sets.length) {
    await run(`UPDATE reviews SET ${sets.join(', ')}, updatedAt = ? WHERE id = ?`, [...args, now(), id]);
  }
  const row = await one(`SELECT * FROM reviews WHERE id = ?`, [id]);
  return row ? mapReview(row) : null;
}

export async function deleteReview(id: string): Promise<ReviewRecord | null> {
  const row = await one(`SELECT * FROM reviews WHERE id = ?`, [id]);
  if (!row) return null;
  await run(`DELETE FROM reviews WHERE id = ?`, [id]);
  return mapReview(row);
}

export async function approvedRatingsFor(productSlug: string): Promise<number[]> {
  const rows = await all(`SELECT rating FROM reviews WHERE productSlug = ? AND status = 'approved'`, [productSlug]);
  return rows.map((r) => Number(r.rating));
}

// ================================================================ blog

export type BlogRecord = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: { src: string; alt: string };
  contentHtml: string;
  tags: string[];
  status: string;
  publishedAt: string | null;
  author: string;
  readingMinutes: number;
  relatedProductSlugs: string[];
  seo: { metaTitle?: string; metaDescription?: string; ogImage?: string; keywords?: string[] };
  createdAt: string;
  updatedAt: string;
};

function mapPost(row: Row): BlogRecord {
  return {
    _id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    excerpt: String(row.excerpt ?? ''),
    cover: parse(row.cover, { src: '', alt: '' }),
    contentHtml: String(row.contentHtml ?? ''),
    tags: parse(row.tags, [] as string[]),
    status: String(row.status),
    publishedAt: row.publishedAt == null ? null : String(row.publishedAt),
    author: String(row.author ?? 'DecArt Team'),
    readingMinutes: Number(row.readingMinutes ?? 1),
    relatedProductSlugs: parse(row.relatedProductSlugs, [] as string[]),
    seo: parse(row.seo, {}),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

const BLOG_COLUMNS: Record<string, (value: unknown) => [string, Arg]> = {
  title: (v) => ['title', String(v)],
  slug: (v) => ['slug', String(v)],
  excerpt: (v) => ['excerpt', String(v ?? '')],
  cover: (v) => ['cover', J(v ?? { src: '', alt: '' })],
  contentHtml: (v) => ['contentHtml', String(v ?? '')],
  tags: (v) => ['tags', J(v ?? [])],
  status: (v) => ['status', String(v)],
  publishedAt: (v) => ['publishedAt', v == null ? null : new Date(v as string | number | Date).toISOString()],
  author: (v) => ['author', String(v ?? 'DecArt Team')],
  readingMinutes: (v) => ['readingMinutes', Number(v ?? 1)],
  relatedProductSlugs: (v) => ['relatedProductSlugs', J(v ?? [])],
  seo: (v) => ['seo', J(v ?? {})],
};

function blogPairs(data: Record<string, unknown>): [string, Arg][] {
  const pairs: [string, Arg][] = [];
  for (const [field, value] of Object.entries(data)) {
    const toColumn = BLOG_COLUMNS[field];
    if (toColumn && value !== undefined) pairs.push(toColumn(value));
  }
  return pairs;
}

export async function insertPost(data: Record<string, unknown>): Promise<BlogRecord> {
  const id = newId();
  const stamp = now();
  const pairs = blogPairs(data);
  const columns = ['id', ...pairs.map(([c]) => c), 'createdAt', 'updatedAt'];
  await run(`INSERT INTO blog_posts (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, [
    id,
    ...pairs.map(([, v]) => v),
    stamp,
    stamp,
  ]);
  return (await postBySlug(String(data.slug)))!;
}

export async function updatePostBySlug(slug: string, patch: Record<string, unknown>): Promise<BlogRecord | null> {
  const pairs = blogPairs(patch);
  if (pairs.length) {
    await run(`UPDATE blog_posts SET ${pairs.map(([c]) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE slug = ?`, [
      ...pairs.map(([, v]) => v),
      now(),
      slug,
    ]);
  }
  return postBySlug(String(patch.slug ?? slug));
}

export async function postBySlug(slug: string): Promise<BlogRecord | null> {
  const row = await one(`SELECT * FROM blog_posts WHERE slug = ?`, [slug]);
  return row ? mapPost(row) : null;
}

export async function publishedPostBySlug(slug: string): Promise<BlogRecord | null> {
  const row = await one(`SELECT * FROM blog_posts WHERE slug = ? AND status = 'published'`, [slug]);
  return row ? mapPost(row) : null;
}

export async function publishedPosts(limit?: number): Promise<BlogRecord[]> {
  const rows = await all(
    `SELECT * FROM blog_posts WHERE status = 'published' ORDER BY publishedAt DESC${limit ? ' LIMIT ?' : ''}`,
    limit ? [limit] : [],
  );
  return rows.map(mapPost);
}

export async function listPosts(sort: 'updated' | 'published' = 'published'): Promise<BlogRecord[]> {
  const orderBy = sort === 'updated' ? 'updatedAt DESC' : 'publishedAt DESC, createdAt DESC';
  const rows = await all(`SELECT * FROM blog_posts ORDER BY ${orderBy}`);
  return rows.map(mapPost);
}

export async function deletePostBySlug(slug: string) {
  await run(`DELETE FROM blog_posts WHERE slug = ?`, [slug]);
}

// ================================================================ family content

export type FaqItem = { q: string; a: string };

export type FamilyContentRecord = {
  slug: string;
  heading: string;
  intro: string;
  bodyHtml: string;
  faq: FaqItem[];
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
};

function mapFamilyContent(row: Row): FamilyContentRecord {
  return {
    slug: String(row.slug),
    heading: String(row.heading ?? ''),
    intro: String(row.intro ?? ''),
    bodyHtml: String(row.bodyHtml ?? ''),
    faq: parse(row.faq, [] as FaqItem[]),
    seoTitle: String(row.seoTitle ?? ''),
    seoDescription: String(row.seoDescription ?? ''),
    updatedAt: String(row.updatedAt),
  };
}

export async function familyContent(slug: string): Promise<FamilyContentRecord | null> {
  const row = await one(`SELECT * FROM family_content WHERE slug = ?`, [slug]);
  return row ? mapFamilyContent(row) : null;
}

export async function allFamilyContent(): Promise<FamilyContentRecord[]> {
  const rows = await all(`SELECT * FROM family_content ORDER BY slug ASC`);
  return rows.map(mapFamilyContent);
}

/** Upsert — the admin screen saves the whole record for one family at a time. */
export async function saveFamilyContent(
  slug: string,
  data: Partial<Omit<FamilyContentRecord, 'slug' | 'updatedAt'>>,
): Promise<FamilyContentRecord> {
  const current = await familyContent(slug);
  const merged = {
    heading: data.heading ?? current?.heading ?? '',
    intro: data.intro ?? current?.intro ?? '',
    bodyHtml: data.bodyHtml ?? current?.bodyHtml ?? '',
    faq: data.faq ?? current?.faq ?? [],
    seoTitle: data.seoTitle ?? current?.seoTitle ?? '',
    seoDescription: data.seoDescription ?? current?.seoDescription ?? '',
  };
  await run(
    `INSERT INTO family_content (slug, heading, intro, bodyHtml, faq, seoTitle, seoDescription, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       heading = excluded.heading, intro = excluded.intro, bodyHtml = excluded.bodyHtml,
       faq = excluded.faq, seoTitle = excluded.seoTitle, seoDescription = excluded.seoDescription,
       updatedAt = excluded.updatedAt`,
    [
      slug,
      merged.heading,
      merged.intro,
      merged.bodyHtml,
      J(merged.faq),
      merged.seoTitle,
      merged.seoDescription,
      now(),
    ],
  );
  return (await familyContent(slug))!;
}

// ================================================================ settings

export type SettingsRecord = Record<string, unknown> & { key: string };

export async function getSettings(): Promise<SettingsRecord | null> {
  const row = await one(`SELECT * FROM settings WHERE key = 'site'`);
  if (!row) return null;
  return { ...parse(row.data, {} as Record<string, unknown>), key: 'site' };
}

/** Shallow-merge patch into the singleton, creating it when missing. */
export async function upsertSettings(patch: Record<string, unknown>): Promise<SettingsRecord> {
  const current = (await getSettings()) ?? { key: 'site' };
  const { key: _key, ...data } = { ...current, ...patch };
  await run(
    `INSERT INTO settings (key, data, updatedAt) VALUES ('site', ?, ?)
     ON CONFLICT(key) DO UPDATE SET data = excluded.data, updatedAt = excluded.updatedAt`,
    [J(data), now()],
  );
  return { ...data, key: 'site' };
}

// ================================================================ admin users

export type AdminRecord = {
  _id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
};

export async function adminByEmail(email: string): Promise<AdminRecord | null> {
  const row = await one(`SELECT * FROM admin_users WHERE email = ?`, [email.toLowerCase()]);
  if (!row) return null;
  return {
    _id: String(row.id),
    email: String(row.email),
    passwordHash: String(row.passwordHash),
    name: String(row.name),
    role: String(row.role),
  };
}

export async function createAdmin(email: string, passwordHash: string, name = 'DecArt Admin', role = 'admin') {
  const stamp = now();
  await run(
    `INSERT INTO admin_users (id, email, passwordHash, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [newId(), email.toLowerCase(), passwordHash, name, role, stamp, stamp],
  );
}

export async function setAdminPassword(email: string, passwordHash: string) {
  await run(`UPDATE admin_users SET passwordHash = ?, updatedAt = ? WHERE email = ?`, [
    passwordHash,
    now(),
    email.toLowerCase(),
  ]);
}
