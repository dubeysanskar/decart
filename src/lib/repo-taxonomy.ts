import { all, one, run, now, type Row } from './repo';

/**
 * Repository for the browse structure: master categories and the categories inside them.
 * See src/data/taxonomy.seed.ts for what the structure is and where the first rows come from.
 */

export type MasterRow = {
  slug: string;
  name: string;
  intro: string;
  cover: string;
  order: number;
  status: string;
};

export type CategoryRow = {
  slug: string;
  master: string;
  name: string;
  intro: string;
  cover: string;
  /** Catalogue families shown in this category, in display order. */
  series: string[];
  order: number;
  status: string;
};

const split = (value: unknown) =>
  String(value ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

function mapMaster(row: Row): MasterRow {
  return {
    slug: String(row.slug),
    name: String(row.name ?? ''),
    intro: String(row.intro ?? ''),
    cover: String(row.cover ?? ''),
    order: Number(row.ord ?? 0),
    status: String(row.status ?? 'published') || 'published',
  };
}

function mapCategory(row: Row): CategoryRow {
  return {
    slug: String(row.slug),
    master: String(row.master ?? ''),
    name: String(row.name ?? ''),
    intro: String(row.intro ?? ''),
    cover: String(row.cover ?? ''),
    series: split(row.series),
    order: Number(row.ord ?? 0),
    status: String(row.status ?? 'published') || 'published',
  };
}

export async function listMasterRows(): Promise<MasterRow[]> {
  const rows = await all(`SELECT * FROM master_categories ORDER BY ord ASC, name ASC`);
  return rows.map(mapMaster);
}

export async function listCategoryRows(): Promise<CategoryRow[]> {
  const rows = await all(`SELECT * FROM catalogue_categories ORDER BY ord ASC, name ASC`);
  return rows.map(mapCategory);
}

export async function masterRow(slug: string): Promise<MasterRow | null> {
  const row = await one(`SELECT * FROM master_categories WHERE slug = ?`, [slug]);
  return row ? mapMaster(row) : null;
}

export async function categoryRow(slug: string): Promise<CategoryRow | null> {
  const row = await one(`SELECT * FROM catalogue_categories WHERE slug = ?`, [slug]);
  return row ? mapCategory(row) : null;
}

export async function saveMaster(row: Omit<MasterRow, 'status'> & { status?: string }): Promise<MasterRow> {
  await run(
    `INSERT INTO master_categories (slug, name, intro, cover, ord, status, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       name = excluded.name, intro = excluded.intro, cover = excluded.cover,
       ord = excluded.ord, status = excluded.status, updatedAt = excluded.updatedAt`,
    [row.slug, row.name, row.intro, row.cover, row.order, row.status ?? 'published', now()],
  );
  return (await masterRow(row.slug))!;
}

export async function saveCategory(row: Omit<CategoryRow, 'status'> & { status?: string }): Promise<CategoryRow> {
  await run(
    `INSERT INTO catalogue_categories (slug, master, name, intro, cover, series, ord, status, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET
       master = excluded.master, name = excluded.name, intro = excluded.intro, cover = excluded.cover,
       series = excluded.series, ord = excluded.ord, status = excluded.status, updatedAt = excluded.updatedAt`,
    [row.slug, row.master, row.name, row.intro, row.cover, row.series.join(','), row.order, row.status ?? 'published', now()],
  );
  return (await categoryRow(row.slug))!;
}

export async function deleteMaster(slug: string) {
  await run(`DELETE FROM master_categories WHERE slug = ?`, [slug]);
}

export async function deleteCategory(slug: string) {
  await run(`DELETE FROM catalogue_categories WHERE slug = ?`, [slug]);
}

export async function countCategoriesIn(master: string): Promise<number> {
  const row = await one(`SELECT COUNT(*) AS n FROM catalogue_categories WHERE master = ?`, [master]);
  return Number(row?.n ?? 0);
}
