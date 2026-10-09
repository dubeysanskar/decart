/**
 * Writes the browse structure — master categories and the categories under them — to the
 * database, from src/data/taxonomy.seed.ts (which was written from docs/master-categories.xlsx).
 *
 * Safe to run more than once, and safe after the client has used /admin/structure:
 *
 *   npm run import-structure            adds only what is MISSING. Rows that exist are left alone,
 *                                       so nothing the client renamed, re-ordered, re-mapped or
 *                                       hid is overwritten.
 *   npm run import-structure -- --reset re-applies the seed over everything, discarding admin
 *                                       edits to those slugs. Rows the client added themselves
 *                                       (slugs not in the seed) are left alone either way.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { MASTERS, CATEGORIES } from '../src/data/taxonomy.seed';
import { categoryRow, masterRow, saveCategory, saveMaster } from '../src/lib/repo-taxonomy';
import { FAMILIES } from '../src/data/catalogue.seed';

const reset = process.argv.includes('--reset');

async function main() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not set');

  let added = 0;
  let kept = 0;
  let rewritten = 0;

  for (const m of MASTERS) {
    const existing = await masterRow(m.slug);
    if (existing && !reset) {
      kept += 1;
      continue;
    }
    await saveMaster({ slug: m.slug, name: m.name, intro: existing?.intro ?? '', cover: existing?.cover ?? '', order: m.order });
    existing ? (rewritten += 1) : (added += 1);
    console.log(`${existing ? 'reset  ' : 'added  '} master    ${m.name}`);
  }

  // a series name the catalogue does not know is almost certainly a typo in the seed
  const knownSeries = new Set(FAMILIES.map((f) => f.slug));
  for (const c of CATEGORIES) {
    const unknown = c.series.filter((s) => !knownSeries.has(s));
    if (unknown.length) console.warn(`  note: ${c.slug} lists series not in the seed catalogue (${unknown.join(', ')}) — fine for admin-created ones`);

    const existing = await categoryRow(c.slug);
    if (existing && !reset) {
      kept += 1;
      continue;
    }
    await saveCategory({
      slug: c.slug,
      master: c.master,
      name: c.name,
      intro: existing?.intro ?? '',
      cover: existing?.cover ?? '',
      series: c.series,
      order: c.order,
    });
    existing ? (rewritten += 1) : (added += 1);
    console.log(`${existing ? 'reset  ' : 'added  '} category  ${c.name.padEnd(28)} <- ${c.series.join(', ') || '(no series yet)'}`);
  }

  console.log(`\n${MASTERS.length} master categories and ${CATEGORIES.length} categories in the seed: ${added} added, ${kept} left as they were, ${rewritten} reset.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
