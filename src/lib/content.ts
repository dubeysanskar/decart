import 'server-only';
import { withDb } from './db';
import * as content from './repo-content';

/**
 * Read side of the client-managed marketing content. Every getter falls back to an empty list
 * when the database is unreachable, so the marketing pages render regardless — the sections
 * that depend on this content simply do not appear.
 */

export async function getBanners(page = 'home') {
  return withDb(() => content.listBanners(true, page), [] as content.BannerRecord[]);
}

/**
 * The hero row for a page that has one, or null.
 *
 * Every page's opener used to be hardcoded in its own file, so changing a headline meant a
 * deploy. A published banner filed under that page now overrides the eyebrow, title, lede and
 * artwork; with no row the page keeps the copy it ships with.
 */
export async function getPageHero(page: string) {
  const rows = await getBanners(page);
  return rows[0] ?? null;
}

export async function getClientLogos() {
  return withDb(() => content.listClients(true), [] as content.ClientRecord[]);
}

/** Featured projects first; falls back to the most recent when none are flagged for the home page. */
export async function getHomeProjects(limit = 3) {
  return withDb(async () => {
    const published = await content.listProjects(true);
    const featured = published.filter((project) => project.featured);
    return (featured.length ? featured : published).slice(0, limit);
  }, [] as content.ProjectRecord[]);
}

export async function getProjects() {
  return withDb(() => content.listProjects(true), [] as content.ProjectRecord[]);
}

export async function getProject(slug: string) {
  return withDb(() => content.publishedProjectBySlug(slug), null as content.ProjectRecord | null);
}
