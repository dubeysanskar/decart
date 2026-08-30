import { all, one, run, now, newId, J, parse, bool, type Row, type Arg } from './repo';

/**
 * Repository for the editable marketing content the client manages themselves:
 * home banners, the client logo wall, and Latest Projects.
 *
 * Same conventions as repo.ts — `_id` string ids, `order` mapped to the `ord` column,
 * booleans stored 0/1, arrays as JSON text.
 */

// ================================================================ banners

export type BannerRecord = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  status: string;
  order: number;
};

function mapBanner(row: Row): BannerRecord {
  return {
    _id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: String(row.subtitle ?? ''),
    image: String(row.image ?? ''),
    imageAlt: String(row.imageAlt ?? ''),
    href: String(row.href ?? ''),
    ctaLabel: String(row.ctaLabel ?? ''),
    status: String(row.status),
    order: Number(row.ord ?? 0),
  };
}

const BANNER_TEXT_FIELDS = ['title', 'subtitle', 'image', 'imageAlt', 'href', 'ctaLabel', 'status'] as const;

export async function listBanners(publishedOnly = false): Promise<BannerRecord[]> {
  const rows = publishedOnly
    ? await all(`SELECT * FROM banners WHERE status = 'published' ORDER BY ord ASC, createdAt ASC`)
    : await all(`SELECT * FROM banners ORDER BY ord ASC, createdAt ASC`);
  return rows.map(mapBanner);
}

export async function insertBanner(data: Record<string, unknown>): Promise<BannerRecord> {
  const id = newId();
  const stamp = now();
  await run(
    `INSERT INTO banners (id, title, subtitle, image, imageAlt, href, ctaLabel, status, ord, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(data.title ?? ''),
      String(data.subtitle ?? ''),
      String(data.image ?? ''),
      String(data.imageAlt ?? ''),
      String(data.href ?? ''),
      String(data.ctaLabel ?? ''),
      String(data.status ?? 'published'),
      Number(data.order ?? 0),
      stamp,
      stamp,
    ],
  );
  return mapBanner((await one(`SELECT * FROM banners WHERE id = ?`, [id]))!);
}

export async function updateBanner(id: string, patch: Record<string, unknown>): Promise<BannerRecord | null> {
  const sets: string[] = [];
  const args: Arg[] = [];
  for (const field of BANNER_TEXT_FIELDS) {
    if (patch[field] !== undefined) {
      sets.push(`${field} = ?`);
      args.push(String(patch[field]));
    }
  }
  if (patch.order !== undefined) {
    sets.push('ord = ?');
    args.push(Number(patch.order));
  }
  if (sets.length) {
    await run(`UPDATE banners SET ${sets.join(', ')}, updatedAt = ? WHERE id = ?`, [...args, now(), id]);
  }
  const row = await one(`SELECT * FROM banners WHERE id = ?`, [id]);
  return row ? mapBanner(row) : null;
}

export async function deleteBanner(id: string) {
  await run(`DELETE FROM banners WHERE id = ?`, [id]);
}

// ================================================================ client logos

export type ClientRecord = {
  _id: string;
  name: string;
  logo: string;
  website: string;
  sector: string;
  status: string;
  order: number;
};

function mapClient(row: Row): ClientRecord {
  return {
    _id: String(row.id),
    name: String(row.name),
    logo: String(row.logo ?? ''),
    website: String(row.website ?? ''),
    sector: String(row.sector ?? ''),
    status: String(row.status),
    order: Number(row.ord ?? 0),
  };
}

export async function listClients(publishedOnly = false): Promise<ClientRecord[]> {
  const rows = publishedOnly
    ? await all(`SELECT * FROM clients WHERE status = 'published' ORDER BY ord ASC, name ASC`)
    : await all(`SELECT * FROM clients ORDER BY ord ASC, name ASC`);
  return rows.map(mapClient);
}

export async function insertClient(data: Record<string, unknown>): Promise<ClientRecord> {
  const id = newId();
  const stamp = now();
  await run(
    `INSERT INTO clients (id, name, logo, website, sector, status, ord, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(data.name ?? ''),
      String(data.logo ?? ''),
      String(data.website ?? ''),
      String(data.sector ?? ''),
      String(data.status ?? 'published'),
      Number(data.order ?? 0),
      stamp,
      stamp,
    ],
  );
  return mapClient((await one(`SELECT * FROM clients WHERE id = ?`, [id]))!);
}

export async function updateClient(id: string, patch: Record<string, unknown>): Promise<ClientRecord | null> {
  const sets: string[] = [];
  const args: Arg[] = [];
  for (const field of ['name', 'logo', 'website', 'sector', 'status'] as const) {
    if (patch[field] !== undefined) {
      sets.push(`${field} = ?`);
      args.push(String(patch[field]));
    }
  }
  if (patch.order !== undefined) {
    sets.push('ord = ?');
    args.push(Number(patch.order));
  }
  if (sets.length) {
    await run(`UPDATE clients SET ${sets.join(', ')}, updatedAt = ? WHERE id = ?`, [...args, now(), id]);
  }
  const row = await one(`SELECT * FROM clients WHERE id = ?`, [id]);
  return row ? mapClient(row) : null;
}

export async function deleteClient(id: string) {
  await run(`DELETE FROM clients WHERE id = ?`, [id]);
}

// ================================================================ latest projects

export type ProjectImage = { src: string; alt: string };

export type ProjectRecord = {
  _id: string;
  title: string;
  slug: string;
  client: string;
  location: string;
  summary: string;
  bodyHtml: string;
  images: ProjectImage[];
  scope: string[];
  completedAt: string;
  featured: boolean;
  status: string;
  order: number;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
};

function mapProject(row: Row): ProjectRecord {
  return {
    _id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    client: String(row.client ?? ''),
    location: String(row.location ?? ''),
    summary: String(row.summary ?? ''),
    bodyHtml: String(row.bodyHtml ?? ''),
    images: parse(row.images, [] as ProjectImage[]),
    scope: parse(row.scope, [] as string[]),
    completedAt: String(row.completedAt ?? ''),
    featured: bool(row.featured),
    status: String(row.status),
    order: Number(row.ord ?? 0),
    seoTitle: String(row.seoTitle ?? ''),
    seoDescription: String(row.seoDescription ?? ''),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

/** field -> [column, value] for every column a project write may touch. */
const PROJECT_COLUMNS: Record<string, (v: unknown) => [string, Arg]> = {
  title: (v) => ['title', String(v)],
  slug: (v) => ['slug', String(v)],
  client: (v) => ['client', String(v ?? '')],
  location: (v) => ['location', String(v ?? '')],
  summary: (v) => ['summary', String(v ?? '')],
  bodyHtml: (v) => ['bodyHtml', String(v ?? '')],
  images: (v) => ['images', J(v ?? [])],
  scope: (v) => ['scope', J(v ?? [])],
  completedAt: (v) => ['completedAt', String(v ?? '')],
  featured: (v) => ['featured', v ? 1 : 0],
  status: (v) => ['status', String(v)],
  order: (v) => ['ord', Number(v ?? 0)],
  seoTitle: (v) => ['seoTitle', String(v ?? '')],
  seoDescription: (v) => ['seoDescription', String(v ?? '')],
};

function projectPairs(data: Record<string, unknown>): [string, Arg][] {
  const pairs: [string, Arg][] = [];
  for (const [field, value] of Object.entries(data)) {
    const to = PROJECT_COLUMNS[field];
    if (to && value !== undefined) pairs.push(to(value));
  }
  return pairs;
}

export async function listProjects(publishedOnly = false, limit?: number): Promise<ProjectRecord[]> {
  const where = publishedOnly ? `WHERE status = 'published'` : '';
  const rows = await all(
    `SELECT * FROM projects ${where} ORDER BY ord ASC, completedAt DESC, createdAt DESC${limit ? ' LIMIT ?' : ''}`,
    limit ? [limit] : [],
  );
  return rows.map(mapProject);
}

export async function projectBySlug(slug: string): Promise<ProjectRecord | null> {
  const row = await one(`SELECT * FROM projects WHERE slug = ?`, [slug]);
  return row ? mapProject(row) : null;
}

export async function publishedProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  const row = await one(`SELECT * FROM projects WHERE slug = ? AND status = 'published'`, [slug]);
  return row ? mapProject(row) : null;
}

export async function insertProject(data: Record<string, unknown>): Promise<ProjectRecord> {
  const id = newId();
  const stamp = now();
  const pairs = projectPairs(data);
  const columns = ['id', ...pairs.map(([c]) => c), 'createdAt', 'updatedAt'];
  await run(`INSERT INTO projects (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`, [
    id,
    ...pairs.map(([, v]) => v),
    stamp,
    stamp,
  ]);
  return (await projectBySlug(String(data.slug)))!;
}

export async function updateProjectBySlug(
  slug: string,
  patch: Record<string, unknown>,
): Promise<ProjectRecord | null> {
  const pairs = projectPairs(patch);
  if (pairs.length) {
    await run(`UPDATE projects SET ${pairs.map(([c]) => `${c} = ?`).join(', ')}, updatedAt = ? WHERE slug = ?`, [
      ...pairs.map(([, v]) => v),
      now(),
      slug,
    ]);
  }
  return projectBySlug(String(patch.slug ?? slug));
}

export async function deleteProject(slug: string) {
  await run(`DELETE FROM projects WHERE slug = ?`, [slug]);
}
