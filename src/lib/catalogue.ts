import 'server-only';
import { withDb, hasDb } from './db';
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

/** Families that should appear in nav: not hidden, and holding at least one published product. */
export async function getNavFamilies() {
  const counts = await getFamilyCounts();
  return visibleFamilies()
    .filter((f) => (counts[f.slug] ?? 0) > 0)
    .map((f) => ({ ...f, count: counts[f.slug] ?? 0, lede: FAMILY_LEDE[f.slug] ?? '' }));
}

/** Family tiles for the homepage — families we hold real photography for lead the list. */
export async function getFeaturedFamilies(limit = 8) {
  const families = await getNavFamilies();
  const products = await getAllProducts();
  const photoCount = products.reduce<Record<string, number>>((acc, p) => {
    if (p.images?.length) acc[p.family] = (acc[p.family] ?? 0) + 1;
    return acc;
  }, {});

  const cover = (slug: string) =>
    products.find((p) => p.family === slug && p.images?.length)?.images?.[0]?.src ?? '';

  const tiles = families
    .map((f) => ({ ...f, photos: photoCount[f.slug] ?? 0, cover: cover(f.slug) }))
    .sort((a, b) => b.photos - a.photos || b.count - a.count);

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

export async function getApprovedReviews(productSlug: string) {
  return withDb(() => repo.approvedReviewsFor(productSlug), [] as repo.ReviewRecord[]);
}

export async function getFeaturedReviews(limit = 3) {
  return withDb(() => repo.featuredApprovedReviews(limit), [] as repo.ReviewRecord[]);
}

export { FAMILIES, GROUPS, FAMILY_LEDE, familyBySlug, visibleFamilies, hasDb };
