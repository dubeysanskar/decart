import type { Client } from '@libsql/client';

/**
 * SQLite schema for the Turso database. Executed by `npm run seed` (idempotent DDL);
 * the app itself never runs DDL. Nested/array data (specs, images, notes, responses…)
 * lives in JSON text columns; everything filtered or sorted on is a real column.
 *
 * `group` and `order` are reserved words in SQL — stored as `grp` and `ord`, and mapped
 * back to `group`/`order` by the repo layer so the rest of the app is unaffected.
 */
export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    family TEXT NOT NULL,
    grp TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]',
    summary TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs TEXT NOT NULL DEFAULT '[]',
    buildOptions INTEGER NOT NULL DEFAULT 0,
    sizeMm TEXT NOT NULL DEFAULT '',
    finishNote TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    colourways TEXT NOT NULL DEFAULT '[]',
    cataloguePage INTEGER,
    priceAmount REAL NOT NULL DEFAULT 0,
    priceShow INTEGER NOT NULL DEFAULT 0,
    moq INTEGER NOT NULL DEFAULT 1,
    featured INTEGER NOT NULL DEFAULT 0,
    bestSeller INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    needsPhoto INTEGER NOT NULL DEFAULT 0,
    needsReview INTEGER NOT NULL DEFAULT 0,
    ord INTEGER NOT NULL DEFAULT 0,
    seo TEXT NOT NULL DEFAULT '{}',
    ratingAvg REAL NOT NULL DEFAULT 0,
    ratingCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_products_family ON products (family, status, ord)`,
  `CREATE INDEX IF NOT EXISTS idx_products_status ON products (status)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_products_code_family ON products (code, family)`,

  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    productSlug TEXT NOT NULL DEFAULT '',
    productCode TEXT NOT NULL DEFAULT '',
    quantity TEXT NOT NULL DEFAULT '',
    targetDate TEXT NOT NULL DEFAULT '',
    extra TEXT NOT NULL DEFAULT '{}',
    sourcePage TEXT NOT NULL DEFAULT '',
    sourceUtm TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'new',
    disposition TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '[]',
    responses TEXT NOT NULL DEFAULT '[]',
    assignedTo TEXT NOT NULL DEFAULT '',
    isRead INTEGER NOT NULL DEFAULT 0,
    mailAdmin TEXT NOT NULL DEFAULT '',
    mailAck TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_type ON leads (type)`,

  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    productSlug TEXT,
    name TEXT NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    rating INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL,
    photo TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    featured INTEGER NOT NULL DEFAULT 0,
    adminReply TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (productSlug, status)`,
  `CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status)`,

  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '{}',
    contentHtml TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft',
    publishedAt TEXT,
    author TEXT NOT NULL DEFAULT 'DecArt Team',
    readingMinutes INTEGER NOT NULL DEFAULT 1,
    relatedProductSlugs TEXT NOT NULL DEFAULT '[]',
    seo TEXT NOT NULL DEFAULT '{}',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts (status, publishedAt DESC)`,

  /**
   * Editorial content per product family — the SEO copy that sits under a category listing
   * and the category FAQ. Kept in its own table (not on `products`) because it belongs to the
   * family, and the client edits it from /admin/categories without touching any product.
   */
  `CREATE TABLE IF NOT EXISTS family_content (
    slug TEXT PRIMARY KEY,
    heading TEXT NOT NULL DEFAULT '',
    intro TEXT NOT NULL DEFAULT '',
    bodyHtml TEXT NOT NULL DEFAULT '',
    faq TEXT NOT NULL DEFAULT '[]',
    seoTitle TEXT NOT NULL DEFAULT '',
    seoDescription TEXT NOT NULL DEFAULT '',
    updatedAt TEXT NOT NULL
  )`,

  /**
   * Home-page banners: the campaign artwork the client swaps for seasons and offers.
   * `image` is whatever the upload returns (a Cloudinary URL) or a /public path typed by hand.
   */
  `CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL,
    imageAlt TEXT NOT NULL DEFAULT '',
    href TEXT NOT NULL DEFAULT '',
    ctaLabel TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published',
    ord INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_banners_status ON banners (status, ord)`,

  /** Client logo wall — replaces the file-system scan of /public/clients once rows exist. */
  `CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    sector TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'published',
    ord INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status, ord)`,

  /**
   * Latest projects — the installations the client wants to publish as they finish them:
   * a few photos plus the story. `images` is a JSON array of { src, alt }.
   */
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    client TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    bodyHtml TEXT NOT NULL DEFAULT '',
    images TEXT NOT NULL DEFAULT '[]',
    scope TEXT NOT NULL DEFAULT '[]',
    completedAt TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    ord INTEGER NOT NULL DEFAULT 0,
    seoTitle TEXT NOT NULL DEFAULT '',
    seoDescription TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status, ord, completedAt DESC)`,

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL DEFAULT '{}',
    updatedAt TEXT NOT NULL
  )`,

  /* ---------------------------------------------------------------- Quote Master
     Quotation module. Clients are kept apart from the marketing `clients` logo wall: this is
     the billing party on a quotation, with GSTIN and address. */
  `CREATE TABLE IF NOT EXISTS quote_clients (
    id TEXT PRIMARY KEY,
    company TEXT NOT NULL,
    contactPerson TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    pincode TEXT NOT NULL DEFAULT '',
    gstin TEXT NOT NULL DEFAULT '',
    pan TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    createdBy TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quote_clients_company ON quote_clients (company)`,

  /* A quotation number is never reused, so the sequence lives in its own row and only ever
     moves forward — cancelling a quotation does not release its number. */
  `CREATE TABLE IF NOT EXISTS quotation_counters (
    year TEXT PRIMARY KEY,
    seq INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL UNIQUE,
    token TEXT NOT NULL UNIQUE,
    clientId TEXT NOT NULL,
    clientSnapshot TEXT NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'draft',
    title TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    terms TEXT NOT NULL DEFAULT '',
    taxRate REAL NOT NULL DEFAULT 18,
    interState INTEGER NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    taxAmount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    validUntil TEXT NOT NULL DEFAULT '',
    createdBy TEXT NOT NULL DEFAULT '',
    createdByName TEXT NOT NULL DEFAULT '',
    office TEXT NOT NULL DEFAULT '',
    sentAt TEXT NOT NULL DEFAULT '',
    viewedAt TEXT NOT NULL DEFAULT '',
    respondedAt TEXT NOT NULL DEFAULT '',
    viewCount INTEGER NOT NULL DEFAULT 0,
    downloadCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quotations_created ON quotations (createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_quotations_owner ON quotations (createdBy, createdAt DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations (status, createdAt DESC)`,

  /* Line items carry a snapshot of the product as it was when the quotation was raised, so a
     later price or name change never rewrites history on a quotation already sent out. */
  `CREATE TABLE IF NOT EXISTS quotation_items (
    id TEXT PRIMARY KEY,
    quotationId TEXT NOT NULL,
    productId TEXT NOT NULL DEFAULT '',
    code TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    family TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    mrp REAL NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'price',
    discountPct REAL NOT NULL DEFAULT 0,
    unitPrice REAL NOT NULL DEFAULT 0,
    qty INTEGER NOT NULL DEFAULT 1,
    lineTotal REAL NOT NULL DEFAULT 0,
    note TEXT NOT NULL DEFAULT '',
    ord INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quotation_items_q ON quotation_items (quotationId, ord)`,

  `CREATE TABLE IF NOT EXISTS quotation_activity (
    id TEXT PRIMARY KEY,
    quotationId TEXT NOT NULL,
    event TEXT NOT NULL,
    actor TEXT NOT NULL DEFAULT '',
    meta TEXT NOT NULL DEFAULT '{}',
    at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_quotation_activity_q ON quotation_activity (quotationId, at DESC)`,

  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'DecArt Admin',
    role TEXT NOT NULL DEFAULT 'admin',
    phone TEXT NOT NULL DEFAULT '',
    designation TEXT NOT NULL DEFAULT '',
    office TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
];

/**
 * Columns added to tables that already exist in a live database. CREATE TABLE IF NOT EXISTS
 * silently skips a table that is already there, so a new column on an old table never lands
 * without this. Adding a column that already exists throws, hence the PRAGMA check.
 */
const ADDED_COLUMNS: { table: string; column: string; ddl: string }[] = [
  { table: 'admin_users', column: 'phone', ddl: "phone TEXT NOT NULL DEFAULT ''" },
  { table: 'admin_users', column: 'designation', ddl: "designation TEXT NOT NULL DEFAULT ''" },
  { table: 'admin_users', column: 'office', ddl: "office TEXT NOT NULL DEFAULT ''" },
  { table: 'admin_users', column: 'active', ddl: 'active INTEGER NOT NULL DEFAULT 1' },
];

export async function ensureSchema(db: Client) {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }

  const seen = new Map<string, Set<string>>();
  for (const { table, column, ddl } of ADDED_COLUMNS) {
    if (!seen.has(table)) {
      const info = await db.execute(`PRAGMA table_info(${table})`);
      seen.set(table, new Set(info.rows.map((row) => String(row.name))));
    }
    if (seen.get(table)!.has(column)) continue;
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
    seen.get(table)!.add(column);
  }
}
