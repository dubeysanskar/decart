/**
 * Imports the client's own category list (docs/categories.xlsx) into the database.
 *
 * Their sheet is the authority on what the catalogue is called and what order it comes in. Most
 * of its 27 rows already exist in the seed under a different name — "Educational series" is our
 * `school`, "Fold & Height Adjust Series" is our `foldable` — so this matches first and only
 * creates a category where nothing matches, which is how the ranges we never modelled (director
 * and manager tables, metal storage) come into being.
 *
 * Each row is written with the client's name, their numbering as the order, and a cover: the
 * category artwork in /public/families when we hold it. Where we do not, the cover is left empty
 * on purpose — the category shows the branded plate and the client can upload the picture from
 * /admin/categories rather than having a stand-in chosen for them.
 *
 * Idempotent: run it again after they edit the sheet and it updates the same rows.
 *
 * Run: npm run import-categories
 */
import 'dotenv/config';
import { config } from 'dotenv';
import path from 'node:path';
import { existsSync } from 'node:fs';
import XLSX from 'xlsx';

config({ path: '.env.local' });

import { saveFamilyContent, familyContent } from '../src/lib/repo';
import { FAMILIES } from '../src/data/catalogue.seed';
import { slugify } from '../src/lib/utils';

const SHEET = path.join(process.cwd(), 'docs', 'categories.xlsx');

/**
 * Their wording to ours, where a straight slug match would miss.
 *
 * Everything else falls through to slug matching on the words that carry meaning, so "Cafe
 * series" finds `cafe` without needing a line here.
 */
const ALIASES: Record<string, string> = {
  'educational series': 'school',
  'fold & height adjust series': 'foldable',
  'center table series': 'centre-table',
  'reception table': 'reception',
  'storages': 'storage',
  'hostel beds': 'hostel-bed',
  'workstation series': 'workstation',
  'computer table': 'computer-table',
  'conference table': 'conference',
  'meeting table': 'meeting',
  'imported table': 'imported-table',
  'metal storages': 'metal-storage',
  'director table': 'director-table',
  'manager table': 'manager-table',
};

/** Which nav group a new category belongs in, judged by what it is. */
function groupFor(label: string): string {
  const text = label.toLowerCase();
  if (/(table|desk|workstation)/.test(text)) return 'tables-desks';
  if (/(storage|bed|locker)/.test(text)) return 'furniture';
  return 'seating';
}

function resolve(raw: string): { slug: string; matched: boolean } {
  const label = raw.trim().replace(/\s+/g, ' ');
  const key = label.toLowerCase();

  if (ALIASES[key]) {
    const slug = ALIASES[key];
    return { slug, matched: FAMILIES.some((family) => family.slug === slug) };
  }

  // "Director series" -> "director"; "Ceo series" -> "ceo"
  const stem = slugify(label.replace(/\bseries\b/i, ''));
  const direct = FAMILIES.find((family) => family.slug === stem);
  if (direct) return { slug: direct.slug, matched: true };

  const byName = FAMILIES.find(
    (family) => slugify(family.name).startsWith(stem) || stem.startsWith(slugify(family.name)),
  );
  if (byName) return { slug: byName.slug, matched: true };

  return { slug: stem, matched: false };
}

/** Title case that leaves the client's own capitals alone where they meant them. */
const titleCase = (value: string) =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());

async function main() {
  if (!existsSync(SHEET)) throw new Error(`No spreadsheet at ${SHEET}`);
  if (!process.env.TURSO_DATABASE_URL) throw new Error('TURSO_DATABASE_URL is not set');

  const book = XLSX.readFile(SHEET);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(book.Sheets[book.SheetNames[0]], {
    defval: '',
  });

  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const label = String(row.categories ?? row.Categories ?? '').trim();
    if (!label) continue;
    const order = Number(row['S.No'] ?? 0) || 0;

    const { slug, matched } = resolve(label);
    const seeded = FAMILIES.find((family) => family.slug === slug);
    const existing = await familyContent(slug);

    // the artwork we already hold for this category; nothing invented where we hold none
    const artwork = `/hero/../families/${slug}.webp`.replace('/hero/..', '');
    const cover = existsSync(path.join(process.cwd(), 'public', 'families', `${slug}.webp`)) ? artwork : '';

    await saveFamilyContent(slug, {
      // the seed's own name is better English where it exists ("Café Chairs & Bar Stools"),
      // so their label only names the categories we had no name for
      name: seeded?.name || titleCase(label),
      groupSlug: seeded?.group || groupFor(label),
      cover: existing?.cover || cover,
      order,
      status: 'published',
    });

    if (existing) updated += 1;
    else created += 1;

    console.log(
      `${matched ? 'matched ' : 'CREATED '} ${String(order).padStart(2)} ${label.padEnd(30)} -> ${slug}${
        cover ? '  [cover]' : '  [no artwork yet]'
      }`,
    );
  }

  console.log(`\n${rows.length} rows from the sheet: ${created} written, ${updated} updated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
