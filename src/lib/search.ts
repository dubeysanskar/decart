import 'server-only';
import { getAllProducts, getNavFamilies, type CatalogueProduct } from './catalogue';
import { getPublishedPosts } from './blog';
import { getProjects } from './content';

/**
 * One search across the catalogue, the families, the writing and the projects.
 *
 * A printed catalogue of 540 model codes is unusable by browsing: a buyer arrives holding a
 * code from a spec sheet ("DS-701") or a word from a tender ("mesh, high back") and the only
 * way through thirty families was the mega menu. So this ranks by how a buyer actually types:
 * an exact code beats a code prefix, which beats a name, which beats a description.
 *
 * It scores in memory. The catalogue is a few hundred rows, cached and revalidated hourly, so
 * a query costs one pass over an array — cheaper and far more predictable than teaching SQLite
 * full-text search to rank a model code the way a person expects.
 */

export type ProductHit = { kind: 'product'; product: CatalogueProduct; score: number };
export type FamilyHit = { kind: 'family'; slug: string; name: string; count: number; lede: string; score: number };
export type PostHit = { kind: 'post'; slug: string; title: string; excerpt: string; score: number };
export type ProjectHit = { kind: 'project'; slug: string; title: string; client: string; location: string; score: number };

export type SearchResults = {
  query: string;
  products: ProductHit[];
  families: FamilyHit[];
  posts: PostHit[];
  projects: ProjectHit[];
  total: number;
};

export const MIN_QUERY = 2;

const norm = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
/** "ds 701" and "ds-701" are the same code to everyone except a string comparison. */
const loose = (value: string) => norm(value).replace(/[^a-z0-9]/g, '');

/**
 * Words, not one string. "mesh high back" is three requirements a buyer expects to be met
 * together, and matching the phrase literally found nothing because the model is called a
 * "High-Back Mesh Chair" — the words are all there, in another order.
 */
const tokenise = (q: string) => q.split(' ').filter(Boolean).slice(0, 8);

function scoreProduct(product: CatalogueProduct, q: string, qLoose: string, tokens: string[]): number {
  const codeLoose = loose(product.code);
  const name = norm(product.name);

  let score = 0;
  if (codeLoose === qLoose) score = 120;
  else if (codeLoose.startsWith(qLoose)) score = 90;
  else if (name.startsWith(q)) score = 70;
  else if (name.includes(q)) score = 50;
  else if (codeLoose.includes(qLoose)) score = 45;
  else if (norm(product.family).includes(q)) score = 30;
  else if (product.tags?.some((tag) => norm(tag).includes(q))) score = 25;
  else if (norm(product.summary ?? '').includes(q)) score = 12;

  // no phrase match: every word still has to appear somewhere, so "mesh table" stays honest
  if (!score && tokens.length > 1) {
    const hay = norm(`${product.code} ${product.name} ${product.family} ${(product.tags ?? []).join(' ')} ${product.summary ?? ''}`);
    const hayLoose = loose(hay);
    const all = tokens.every((token) => hay.includes(token) || hayLoose.includes(loose(token)));
    if (!all) return 0;
    score = 22 + tokens.filter((token) => name.includes(token) || codeLoose.includes(loose(token))).length * 5;
  }
  if (!score) return 0;

  // among equals, show the models we can actually picture
  if (product.images?.length) score += 6;
  if (product.bestSeller) score += 3;
  else if (product.featured) score += 2;
  return score;
}

/** Every word present in the text, in any order — the fallback the other collections share. */
function allTokensIn(text: string, tokens: string[]): boolean {
  if (tokens.length < 2) return false;
  const hay = norm(text);
  const hayLoose = loose(hay);
  return tokens.every((token) => hay.includes(token) || hayLoose.includes(loose(token)));
}

export async function siteSearch(rawQuery: string, limits = { products: 24, families: 6, posts: 4, projects: 4 }): Promise<SearchResults> {
  const q = norm(rawQuery);
  const empty: SearchResults = { query: rawQuery, products: [], families: [], posts: [], projects: [], total: 0 };
  if (q.length < MIN_QUERY) return empty;

  const qLoose = loose(q);
  const tokens = tokenise(q);
  const [products, families, posts, projects] = await Promise.all([
    getAllProducts(),
    getNavFamilies(),
    getPublishedPosts(),
    getProjects(),
  ]);

  const productHits = products
    .map((product) => ({ kind: 'product' as const, product, score: scoreProduct(product, q, qLoose, tokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.product.order - b.product.order)
    .slice(0, limits.products);

  const familyHits = families
    .map((family) => {
      const name = norm(family.name);
      const score =
        name === q
          ? 100
          : name.startsWith(q)
            ? 80
            : name.includes(q)
              ? 60
              : norm(family.lede ?? '').includes(q)
                ? 20
                : allTokensIn(`${family.name} ${family.lede ?? ''}`, tokens)
                  ? 18
                  : 0;
      return { kind: 'family' as const, ...family, score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .slice(0, limits.families);

  const postHits = posts
    .map((post) => {
      const title = norm(post.title);
      const score = title.includes(q)
        ? 60
        : post.tags?.some((tag) => norm(tag).includes(q))
          ? 30
          : norm(post.excerpt ?? '').includes(q)
            ? 15
            : allTokensIn(`${post.title} ${post.excerpt ?? ''} ${(post.tags ?? []).join(' ')}`, tokens)
              ? 12
              : 0;
      return { kind: 'post' as const, slug: post.slug, title: post.title, excerpt: post.excerpt ?? '', score };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limits.posts);

  const projectHits = projects
    .map((project) => {
      const haystack = norm(`${project.title} ${project.client} ${project.location} ${project.summary}`);
      const score = norm(project.title).includes(q) ? 60 : haystack.includes(q) ? 25 : allTokensIn(haystack, tokens) ? 20 : 0;
      return {
        kind: 'project' as const,
        slug: project.slug,
        title: project.title,
        client: project.client,
        location: project.location,
        score,
      };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limits.projects);

  return {
    query: rawQuery,
    products: productHits,
    families: familyHits,
    posts: postHits,
    projects: projectHits,
    total: productHits.length + familyHits.length + postHits.length + projectHits.length,
  };
}
