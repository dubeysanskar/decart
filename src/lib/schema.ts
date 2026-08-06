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

  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    data TEXT NOT NULL DEFAULT '{}',
    updatedAt TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT NOT NULL,
    name TEXT NOT NULL DEFAULT 'DecArt Admin',
    role TEXT NOT NULL DEFAULT 'admin',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`,
];

export async function ensureSchema(db: Client) {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.execute(statement);
  }
}
