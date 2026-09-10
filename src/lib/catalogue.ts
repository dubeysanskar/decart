import 'server-only';
import { withDb, hasDb } from './db';
import { publicFileExists } from './assets';
import * as repo from './repo';
import {
  FAMILIES,
  FAMILY_LEDE,
  GROUPS,
  allSeedProducts,
  familyBySlug,
  visibleFamilies,
  type SeedProduct,
} from '@/data/catalogue.seed';

export type CatalogueProduct = SeedProduct & {
  ratingAvg?: number;
  ratingCount?: number;
  price?: { amount: number; show: boolean };
  moq?: number;
  finishNote?: string;
};

const SEED = allSeedProducts();
const seedPublished = () => SEED.filter((p) => p.status === 'published');

/** Repo records carry every SeedProduct field; narrow the string unions back for consumers. */
const asCatalogue = (rows: repo.ProductRecord[]) => rows as unknown as CatalogueProduct[];
const asCatalogueOne = (row: repo.ProductRecord | null) => (row ? (row as unknown as CatalogueProduct) : null);

/** Products in a family, ordered as the catalogue prints them. Falls back to the static seed. */
export async function getFamilyProducts(family: string): Promise<CatalogueProduct[]> {
  return withDb(
    async () => asCatalogue(await repo.publishedByFamily(family)),
    seedPublished()
      .filter((p) => p.family === family)
      .sort((a, b) => a.order - b.order),
  );
}

export async function getProduct(slug: string): Promise<CatalogueProduct | null> {
  return withDb(
    async () => asCatalogueOne(await repo.publishedProductBySlug(slug)),
    seedPublished().find((p) => p.slug === slug) ?? null,
  );
}

export async function getAllProducts(): Promise<CatalogueProduct[]> {
  return withDb(async () => asCatalogue(await repo.publishedProducts()), seedPublished());
}

export async function getFeatured(limit = 12): Promise<CatalogueProduct[]> {
  const withPhotos = (list: CatalogueProduct[]) =>
    [...list].sort((a, b) => (b.images?.length ? 1 : 0) - (a.images?.length ? 1 : 0));

  return withDb(
    async () => asCatalogue(await repo.featuredProducts(limit)),
    withPhotos(seedPublished().filter((p) => p.featured || p.bestSeller)).slice(0, limit),
  );
}

/** Per-family published counts — drives nav visibility and family tiles. */
export async function getFamilyCounts(): Promise<Record<string, number>> {
  const seedCounts = seedPublished().reduce<Record<string, number>>((acc, p) => {
    acc[p.family] = (acc[p.family] ?? 0) + 1;
    return acc;
  }, {});

  return withDb(() => repo.familyCounts(), seedCounts);
}

/** Category rows the client manages in /admin/categories, keyed by slug. */
async function categoryRows(): Promise<Record<string, repo.FamilyContentRecord>> {
  const rows = await withDb(() => repo.allFamilyContent(), [] as repo.FamilyContentRecord[]);
  return Object.fromEntries(rows.map((row) => [row.slug, row]));
}

/**
 * The categories the site shows.
 *
 * The seed's thirty-one families are the starting point; the client's own list is the authority.
 * A row in /admin/categories renames, re-orders, re-groups, re-covers or hides a family — and a
 * row for a slug the seed never had is a category in its own right, which is how the three
 * ranges on the client's list that we had never modelled (director and manager tables, metal
 * storage) exist at all.
 *
 * A seed family still has to hold a published model to appear, or the nav fills with empty
 * pages. A category the client added by hand appears regardless: they asked for it, and its
 * page invites an enquiry rather than listing nothing.
 */
export async function getNavFamilies() {
  const [counts, rows] = await Promise.all([getFamilyCounts(), categoryRows()]);

  const fromSeed = visibleFamilies()
    .map((family) => {
      const row = rows[family.slug];
      return {
        ...family,
        name: row?.name || family.name,
        group: (row?.groupSlug || family.group) as typeof family.group,
        count: counts[family.slug] ?? 0,
        lede: row?.intro || FAMILY_LEDE[family.slug] || '',
        order: row?.order ?? 0,
        managed: Boolean(row),
        hiddenByAdmin: row?.status === 'hidden',
      };
    })
    .filter((family) => !family.hiddenByAdmin && (family.count > 0 || family.managed));

  const seedSlugs = new Set(FAMILIES.map((family) => family.slug));
  const fromAdmin = Object.values(rows)
    .filter((row) => !seedSlugs.has(row.slug) && row.status !== 'hidden' && row.name)
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      singular: row.name.replace(/s$/, ''),
      group: (row.groupSlug || 'seating') as (typeof FAMILIES)[number]['group'],
      pages: '',
      spec: 'task' as (typeof FAMILIES)[number]['spec'],
      named: [] as string[],
      tags: [] as string[],
      count: counts[row.slug] ?? 0,
      lede: row.intro || '',
      order: row.order ?? 0,
      managed: true,
      hiddenByAdmin: false,
    }));

  // the client's numbering wins where they gave one; everything else keeps catalogue order
  return [...fromSeed, ...fromAdmin].sort((a, b) => {
    const left = a.order || Number.MAX_SAFE_INTEGER;
    const right = b.order || Number.MAX_SAFE_INTEGER;
    return left - right;
  });
}

/**
 * One category by slug, seed or admin-created.
 *
 * familyBySlug only knows the seed, so a category the client added in /admin/categories used to
 * 404 on its own page. This resolves against the merged list instead.
 */
export async function getFamily(slug: string) {
  const families = await getNavFamilies();
  return families.find((family) => family.slug === slug) ?? null;
}

/**
 * Every visible family as a tile, with a cover image where we hold photography.
 * Photographed families sort first; the rest keep their catalogue order by size.
 */
export async function getFamilyTiles() {
  const families = await getNavFamilies();
  const products = await getAllProducts();
  const photoCount = products.reduce<Record<string, number>>((acc, p) => {
    if (p.images?.length) acc[p.family] = (acc[p.family] ?? 0) + 1;
    return acc;
  }, {});

  const rows = await categoryRows();

  /**
   * Cover priority: the image the client set in /admin/categories, else a real studio shot of a
   * product in the family, else the category artwork in /public/families, else nothing — the
   * tile then renders the branded placeholder.
   *
   * The admin choice comes first on purpose: it is the one someone picked deliberately.
   */
  const cover = (slug: string) => {
    const chosen = rows[slug]?.cover;
    if (chosen) return chosen;
    const shot = products.find((p) => p.family === slug && p.images?.length)?.images?.[0]?.src;
    if (shot) return shot;
    const artwork = `/families/${slug}.webp`;
    return publicFileExists(artwork) ? artwork : '';
  };

  return families
    .map((f) => ({ ...f, photos: photoCount[f.slug] ?? 0, cover: cover(f.slug) }))
    .sort((a, b) => b.photos - a.photos || b.count - a.count);
}

/** Family tiles for the homepage grid — families we hold real photography for lead the list. */
export async function getFeaturedFamilies(limit = 8) {
  const tiles = await getFamilyTiles();
  // a homepage tile with no cover image is a hole in the grid — only pad with them if we must
  const shot = tiles.filter((t) => t.cover);
  return (shot.length >= 4 ? shot : tiles).slice(0, limit);
}

export async function getRelated(product: CatalogueProduct, limit = 8): Promise<CatalogueProduct[]> {
  const siblings = await getFamilyProducts(product.family);
  const pool = siblings.filter((p) => p.slug !== product.slug);
  const withImages = pool.filter((p) => p.images?.length);
  return (withImages.length >= 4 ? withImages : pool).slice(0, limit);
}

/** Admin-authored category copy + FAQ. Null when the client has not written it yet. */
export async function getFamilyContent(slug: string) {
  return withDb(() => repo.familyContent(slug), null as repo.FamilyContentRecord | null);
}

export async function getApprovedReviews(productSlug: string) {
  return withDb(() => repo.approvedReviewsFor(productSlug), [] as repo.ReviewRecord[]);
}

export async function getFeaturedReviews(limit = 3) {
  return withDb(() => repo.featuredApprovedReviews(limit), [] as repo.ReviewRecord[]);
}

export { FAMILIES, GROUPS, FAMILY_LEDE, familyBySlug, visibleFamilies, hasDb };
