/**
 * Pull category cover images out of the client's own 68-page catalogue PDF.
 *
 *   node scripts/catalogue-covers.mjs <catalogue.pdf>
 *
 * Families with no studio photography were rendering branded placeholders. The catalogue is the
 * only other source of real imagery we have, so this lifts the largest photo off the page each
 * family is printed on (the page numbers come from FAMILIES in the catalogue seed).
 *
 * The PDF stores its photos as plain DCTDecode (JPEG) XObjects and does not use compressed
 * object streams, so the raw bytes between `stream`/`endstream` are already a valid JPEG —
 * no rasteriser needed. Output is resized WebP, matching the rest of /public.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const PDF = process.argv[2] || 'cat.pdf';
const OUT = path.join(process.cwd(), 'public', 'families');

/** slug -> the catalogue page to lift a photo from (first page of the family's spread). */
const TARGETS = {
  imported: 7,
  auditorium: 43,
  reception: 45,
  'imported-table': 47,
  table: 49,
  workstation: 52,
  cubicle: 55,
  conference: 57,
  meeting: 60,
  'computer-table': 61,
  foldable: 62,
  'hostel-bed': 63,
  storage: 64,
  'cafe-table': 29,
};

const raw = await fs.readFile(PDF);
const latin = raw.toString('latin1');

// ---- 1. index every "N 0 obj" definition -------------------------------------------------
const objects = new Map();
for (const m of latin.matchAll(/(\d+)\s+0\s+obj\b/g)) {
  objects.set(Number(m[1]), m.index + m[0].length);
}

const objectBody = (num) => {
  const start = objects.get(num);
  if (start === undefined) return null;
  const end = latin.indexOf('endobj', start);
  return { start, end, text: latin.slice(start, end === -1 ? start + 4000 : end) };
};

// ---- 2. walk the page tree so page order is the printed order ------------------------------
function collectPages() {
  const rootMatch = latin.match(/\/Type\s*\/Catalog[\s\S]{0,400}?\/Pages\s+(\d+)\s+0\s+R/);
  const pages = [];
  const walk = (num, depth = 0) => {
    if (depth > 12) return;
    const body = objectBody(num);
    if (!body) return;
    if (/\/Type\s*\/Page[^s]/.test(body.text)) {
      pages.push(num);
      return;
    }
    const kids = body.text.match(/\/Kids\s*\[([\s\S]*?)\]/);
    if (!kids) return;
    for (const k of kids[1].matchAll(/(\d+)\s+0\s+R/g)) walk(Number(k[1]), depth + 1);
  };
  if (rootMatch) walk(Number(rootMatch[1]));
  return pages;
}

let pageObjects = collectPages();
if (pageObjects.length < 60) {
  // fall back to document order if the tree could not be walked
  pageObjects = [...latin.matchAll(/(\d+)\s+0\s+obj\s*<<[^>]*\/Type\s*\/Page[^s]/g)].map((m) => Number(m[1]));
}
console.log(`pages found: ${pageObjects.length}`);

/** every image XObject referenced by a page, following /Resources indirection once. */
function imageRefsForPage(pageNum) {
  const body = objectBody(pageNum);
  if (!body) return [];
  let resText = body.text;
  const indirect = resText.match(/\/Resources\s+(\d+)\s+0\s+R/);
  if (indirect) resText = objectBody(Number(indirect[1]))?.text ?? resText;
  const xo = resText.match(/\/XObject\s*<<([\s\S]*?)>>/) || (() => {
    const ref = resText.match(/\/XObject\s+(\d+)\s+0\s+R/);
    return ref ? ['', objectBody(Number(ref[1]))?.text ?? ''] : null;
  })();
  if (!xo) return [];
  return [...xo[1].matchAll(/\/\w+\s+(\d+)\s+0\s+R/g)].map((m) => Number(m[1]));
}

/**
 * A sharp instance for an image XObject, or null when it is not a usable photo.
 *
 * The catalogue writes photos two ways: `/Filter [/FlateDecode /DCTDecode]` (a zlib-wrapped
 * JPEG — inflate once and the JPEG falls out) and plain `/FlateDecode` (raw samples, where the
 * channel count is recoverable from the inflated length).
 */
function imageFor(num) {
  const start = objects.get(num);
  if (start === undefined) return null;
  const head = latin.slice(start, start + 1200);
  if (!/\/Subtype\s*\/Image/.test(head)) return null;

  const width = Number(head.match(/\/Width\s+(\d+)/)?.[1] ?? 0);
  const height = Number(head.match(/\/Height\s+(\d+)/)?.[1] ?? 0);
  if (width < 350 || height < 350) return null;

  const sIdx = latin.indexOf('stream', start);
  if (sIdx === -1) return null;
  let dataStart = sIdx + 'stream'.length;
  if (latin[dataStart] === '\r') dataStart++;
  if (latin[dataStart] === '\n') dataStart++;
  const eIdx = latin.indexOf('endstream', dataStart);
  if (eIdx === -1) return null;

  let buf = raw.subarray(dataStart, eIdx);
  const hasFlate = /FlateDecode/.test(head);
  const hasDct = /DCTDecode/.test(head);

  if (hasFlate) {
    try {
      buf = zlib.inflateSync(buf);
    } catch {
      return null;
    }
  }

  if (buf[0] === 0xff && buf[1] === 0xd8) return { jpeg: buf, width, height };
  if (hasDct) return null; // claimed JPEG but no SOI marker

  // raw samples: derive channels from the inflated size
  const channels = Math.round(buf.length / (width * height));
  if (![1, 3, 4].includes(channels)) return null;
  return { raw: { buf, channels }, width, height };
}

/**
 * These are print-CMYK JPEGs written with the Adobe inverted convention and no embedded
 * profile, so a straight decode comes out as a photographic negative (teal cabinets on black).
 * Inverting after the CMYK->sRGB decode restores the real colours — verified against four
 * pages before switching it on.
 */
async function toPipeline(found) {
  if (found.raw) {
    return sharp(found.raw.buf, { raw: { width: found.width, height: found.height, channels: found.raw.channels } });
  }
  const meta = await sharp(found.jpeg).metadata();
  const pipeline = sharp(found.jpeg);
  return meta.space === 'cmyk' ? pipeline.negate({ alpha: false }) : pipeline;
}

await fs.mkdir(OUT, { recursive: true });
let saved = 0;
let skipped = 0;

for (const [slug, printedPage] of Object.entries(TARGETS)) {
  const dest = path.join(OUT, `${slug}.webp`);
  try {
    await fs.stat(dest);
    console.log(`  skip   ${slug} (already has artwork)`);
    skipped++;
    continue;
  } catch {
    /* not built yet */
  }

  // try the family's own page first, then the next two (spreads often lead with a title page)
  let best = null;
  for (const offset of [0, 1, 2]) {
    const idx = printedPage - 1 + offset;
    const pageObj = pageObjects[idx];
    if (!pageObj) continue;
    for (const ref of imageRefsForPage(pageObj)) {
      const found = imageFor(ref);
      if (!found) continue;
      const area = found.width * found.height;
      if (!best || area > best.area) best = { ...found, area, page: idx + 1 };
    }
    if (best) break;
  }

  if (!best) {
    console.log(`  MISS   ${slug} (page ${printedPage}) — no usable photo`);
    continue;
  }

  const pipeline = await toPipeline(best);
  await pipeline
    .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .webp({ quality: 76, effort: 6 })
    .toFile(dest);
  const st = await fs.stat(dest);
  console.log(
    `  saved  ${slug.padEnd(15)} page ${String(best.page).padStart(2)}  ${best.width}x${best.height} -> ${Math.round(st.size / 1024)}KB`,
  );
  saved++;
}

console.log(`\n${saved} covers extracted, ${skipped} already present`);
