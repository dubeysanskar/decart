import 'server-only';
import { withDb } from './db';
import * as repo from './repo-taxonomy';
import { getAllProducts, getFamilyTiles, type CatalogueProduct } from './catalogue';
import { MASTERS, CATEGORIES } from '@/data/taxonomy.seed';

/**
 * The browse structure as the site renders it: master category → category → products.
 *
 * A category is a VIEW over one or more catalogue series, not a place products are filed. A model
 * keeps its single family (and its URL), and appears under every category whose series list names
 * that family — which is how "Office Chair" can be the umbrella over every chair series while
 * "Mesh Office Chair" narrows to four of them, with no product stored twice.
 *
 * The database is the authority once it holds master categories; before that, or if it cannot be
 * reached, the seed in src/data/taxonomy.seed.ts is used, so the menu and the directory render
 * either way.
 */

export type SeriesRef = { slug: string; name: string; count: number };

export type CategoryNode = {
  slug: string;
  master: string;
  masterName: string;
  name: string;
  intro: string;
  /** Resolved: the admin's choice, else the best picture among the series it holds. */
  cover: string;
  series: SeriesRef[];
  order: number;
  status: string;
  /** Distinct models across the category's series. */
  count: number;
  href: string;
};

export type MasterNode = {
  slug: string;
  name: string;
  intro: string;
  cover: string;
  order: number;
  status: string;
  categories: CategoryNode[];
  /** Distinct models across every category — a series in two categories counts once. */
  count: number;
  href: string;
};

type Structure = { masters: repo.MasterRow[]; categories: repo.CategoryRow[] };

const seedStructure = (): Structure => ({
  masters: MASTERS.map((m) => ({ slug: m.slug, name: m.name, intro: '', cover: '', order: m.order, status: 'published' })),
  categories: CATEGORIES.map((c) => ({
    slug: c.slug,
    master: c.master,
    name: c.name,
    intro: '',
    cover: '',
    series: c.series,
    order: c.order,
    status: 'published',
  })),
});

async function loadStructure(): Promise<Structure> {
  const live = await withDb<Structure | null>(
    async () => ({ masters: await repo.listMasterRows(), categories: await repo.listCategoryRows() }),
    null,
  );
  return live && live.masters.length ? live : seedStructure();
}

/**
 * The whole tree, with counts and covers resolved.
 *
 * `includeHidden` is for the admin. The public view drops anything unpublished, and drops any
 * master whose categories are all unpublished or absent — Hotel Furniture and Home Furniture are
 * masters on the client's list with nothing under them yet, and an empty master is a dead link.
 */
export async function getTaxonomy({ includeHidden = false }: { includeHidden?: boolean } = {}): Promise<MasterNode[]> {
  const [structure, tiles] = await Promise.all([loadStructure(), getFamilyTiles()]);
  const tile = new Map(tiles.map((t) => [t.slug, t]));

  const nodes = structure.masters
    .filter((m) => includeHidden || m.status === 'published')
    .map((m): MasterNode => {
      const categories = structure.categories
        .filter((c) => c.master === m.slug && (includeHidden || c.status === 'published'))
        .map((c): CategoryNode => {
          const series = [...new Set(c.series)]
            .map((slug) => tile.get(slug))
            .filter((t): t is NonNullable<typeof t> => Boolean(t))
            .map((t) => ({ slug: t.slug, name: t.name, count: t.count }));

          // a series with a studio shot beats one with only catalogue artwork, which beats none
          const bestCover =
            series
              .map((s) => tile.get(s.slug)!)
              .filter((t) => t.cover)
              .sort((a, b) => b.photos - a.photos)[0]?.cover ?? '';

          return {
            slug: c.slug,
            master: m.slug,
            masterName: m.name,
            name: c.name,
            intro: c.intro,
            cover: c.cover || bestCover,
            series,
            order: c.order,
            status: c.status,
            count: series.reduce((sum, s) => sum + s.count, 0),
            href: `/categories/${m.slug}/${c.slug}`,
          };
        })
        .sort((a, b) => (a.order || 999) - (b.order || 999));

      const seriesInMaster = new Set(categories.flatMap((c) => c.series.map((s) => s.slug)));
      return {
        slug: m.slug,
        name: m.name,
        intro: m.intro,
        cover: m.cover || categories.find((c) => c.cover)?.cover || '',
        order: m.order,
        status: m.status,
        categories,
        count: [...seriesInMaster].reduce((sum, slug) => sum + (tile.get(slug)?.count ?? 0), 0),
        href: `/categories/${m.slug}`,
      };
    })
    .sort((a, b) => (a.order || 999) - (b.order || 999));

  return includeHidden ? nodes : nodes.filter((m) => m.categories.length > 0);
}

export async function getMaster(slug: string): Promise<MasterNode | null> {
  return (await getTaxonomy()).find((m) => m.slug === slug) ?? null;
}

export async function getCategory(
  masterSlug: string,
  categorySlug: string,
): Promise<{ master: MasterNode; category: CategoryNode } | null> {
  const master = await getMaster(masterSlug);
  const category = master?.categories.find((c) => c.slug === categorySlug);
  return master && category ? { master, category } : null;
}

/** Every model in a category, grouped by series in the order the series are listed. */
export async function getCategoryProducts(category: CategoryNode): Promise<CatalogueProduct[]> {
  const products = await getAllProducts();
  const rank = new Map(category.series.map((s, i) => [s.slug, i]));
  return products
    .filter((p) => rank.has(p.family))
    .sort((a, b) => (rank.get(a.family)! - rank.get(b.family)!) || a.order - b.order);
}

/** The categories a series appears in — for the "also filed under" line on a series page. */
export async function getCategoriesForSeries(familySlug: string): Promise<CategoryNode[]> {
  const masters = await getTaxonomy();
  return masters.flatMap((m) => m.categories.filter((c) => c.series.some((s) => s.slug === familySlug)));
}

/** Flat list of every public category — for search and the sitemap. */
export async function getAllCategories(): Promise<CategoryNode[]> {
  return (await getTaxonomy()).flatMap((m) => m.categories);
}
