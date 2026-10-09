import { MASTERS, CATEGORIES } from '@/data/taxonomy.seed';
import { listCategoryRows, listMasterRows, saveCategory, saveMaster } from './repo-taxonomy';

/**
 * Brings the seed into an empty store before the first write lands.
 *
 * Until anyone uses the admin, the site renders src/data/taxonomy.seed.ts because the tables are
 * empty. If the first thing a person did were to add — or edit — one category, that single row
 * would become the whole database and every other category would vanish from the menu. So an
 * empty store is filled from the seed first, and every write path calls this.
 *
 * `reset` re-applies the seed over whatever is there; the import script offers it, the routes
 * never use it.
 */
export async function ensureSeeded({ reset = false }: { reset?: boolean } = {}) {
  const hasMasters = (await listMasterRows()).length > 0;
  if (!hasMasters || reset) {
    for (const m of MASTERS) await saveMaster({ slug: m.slug, name: m.name, intro: '', cover: '', order: m.order });
  }

  const hasCategories = (await listCategoryRows()).length > 0;
  if (!hasCategories || reset) {
    for (const c of CATEGORIES) {
      await saveCategory({
        slug: c.slug,
        master: c.master,
        name: c.name,
        intro: '',
        cover: '',
        series: c.series,
        order: c.order,
      });
    }
  }
}
