/**
 * Photo-shoot ingestion.
 *
 * Reads the client's master photo-shoot folder (4–6K JPEG masters, ~1.1 GB) and produces
 * web-ready WebP derivatives under /public/products/<family>/<product-slug>/, plus a
 * generated manifest at src/data/photoshoot-images.generated.ts.
 *
 *   npm run ingest-images            # transcode + write manifest
 *   npm run ingest-images -- --force # re-transcode files that already exist
 *
 * The masters are never modified. Move them to /source-images (git-ignored) when done.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

// each worker gets one libvips thread; the pool below provides the parallelism
sharp.concurrency(1);
sharp.cache(false);

const ROOT = path.resolve(process.cwd());
const SOURCE_CANDIDATES = [
  path.join(ROOT, 'source-images'),
  path.join(ROOT, 'public', 'Photo Shoot Images -'),
];
const OUT_PRODUCTS = path.join(ROOT, 'public', 'products');
const OUT_DOWNLOADS = path.join(ROOT, 'public', 'downloads');
const OUT_HERO = path.join(ROOT, 'public', 'hero');
const MANIFEST = path.join(ROOT, 'src', 'data', 'photoshoot-images.generated.ts');

const FORCE = process.argv.includes('--force');
/**
 * Nothing on the site displays a product above ~700 CSS px (the PDP gallery is the largest),
 * so 1200 still covers a 1.7x retina crop while cutting a third of the pixels versus 1400.
 * q74/effort-6 is visually indistinguishable on white-backdrop studio shots at these sizes.
 */
const WIDTH = 1200;
const QUALITY = 74;
/** Decoding 6K masters is the bottleneck; one worker per core keeps all of them busy. */
const CONCURRENCY = Math.max(2, os.cpus().length - 1);

/** Run `task` over `items` with a bounded worker pool, preserving input order in the result. */
async function mapPool<T, R>(items: T[], limit: number, task: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const worker = async () => {
    for (;;) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await task(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

type ModelConfig = {
  dir: string;
  prefix: string; // printed model prefix inside the filenames
  model: string; // display name
  family: string; // §7.1 family slug
  fallbackColour: string; // used when the filename carries no colourway
  /** files that don't match `prefix` but belong to this model anyway */
  strays?: { match: RegExp; back: 'HB' | 'MB' | ''; colour: string };
};

const MODELS: ModelConfig[] = [
  { dir: 'Bonai', prefix: 'BONAI WITH HANGER', model: 'Bonai', family: 'mesh', fallbackColour: 'Black' },
  { dir: 'Comfort Hi Stool', prefix: 'COMFORT HI-STOOL', model: 'Comfort Hi-Stool', family: 'cafe', fallbackColour: 'Black' },
  { dir: 'Ecco', prefix: 'ECCO', model: 'Ecco', family: 'task-mesh', fallbackColour: 'Black' },
  { dir: 'Eiffel', prefix: 'EIFFEL', model: 'Eiffel', family: 'special-luxury-mesh', fallbackColour: 'Black' },
  { dir: 'Feather', prefix: 'FEATHER', model: 'Feather', family: 'task-mesh', fallbackColour: 'Black' },
  { dir: 'Glanza', prefix: 'GLANZA', model: 'Glanza', family: 'mesh', fallbackColour: 'Grey' },
  { dir: 'Hilite', prefix: 'HILITE', model: 'Hilite', family: 'ultra-luxury-mesh', fallbackColour: 'Black' },
  {
    dir: 'Mustang',
    prefix: 'MUSTANG',
    model: 'Mustang',
    family: 'ultra-luxury-mesh',
    fallbackColour: 'Black',
    strays: { match: /^fc\b/i, back: 'MB', colour: 'Studio' },
  },
  { dir: 'Optimus', prefix: 'OPTIMUS PRE', model: 'Optimus Pre', family: 'ultra-luxury-mesh', fallbackColour: 'Black' },
  { dir: 'Polar', prefix: 'BUBBLE', model: 'Bubble', family: 'task-mesh', fallbackColour: 'Black' },
  { dir: 'Yarish', prefix: 'YARIS', model: 'Yaris', family: 'special-luxury-mesh', fallbackColour: 'Black' },
];

/** Spec-sheet PDFs shipped with the shoot. */
const PDF_MAP: Record<string, string> = {
  'HILITE HB - FCD.PDF': 'hilite-hb-spec-sheet.pdf',
  'HILITE  MB FCD.PDF': 'hilite-mb-spec-sheet.pdf',
};

/**
 * The showroom hero cut-out (§4.6-3): a black high-back on transparent.
 * Bonai is the pick because its masters carry no studio label to scrub.
 */
const HERO_SOURCE = { dir: 'Bonai', file: 'BONAI WITH HANGER - HB - ANGLE - 002.jpg' };

const NOISE = /^(chair|angle|hd\s*photos|copy|photos|hd|fcd)$/i;
const INDEX_TOKEN = /^\(?\s*(\d+)\s*\)?(\s*copy)?$/i;

const kebab = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split(' ')
    .map((w) => (w === 'with' ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');

type Parsed = { back: 'HB' | 'MB' | ''; colour: string; index: number };

function parse(fileBase: string, cfg: ModelConfig): Parsed | null {
  const upper = fileBase.toUpperCase().replace(/\s+/g, ' ').trim();

  if (cfg.strays && cfg.strays.match.test(fileBase)) {
    const n = fileBase.match(/(\d+)/);
    return { back: cfg.strays.back, colour: cfg.strays.colour, index: n ? Number(n[1]) : 0 };
  }

  const prefix = cfg.prefix.toUpperCase();
  if (!upper.startsWith(prefix)) return null;

  const rest = upper.slice(prefix.length);
  const tokens = rest
    .split('-')
    .map((t) => t.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  let back: 'HB' | 'MB' | '' = '';
  let index = 0;
  const words: string[] = [];

  for (const token of tokens) {
    if (token === 'HB' || token === 'MB') {
      back = token;
      continue;
    }
    const idx = token.match(INDEX_TOKEN);
    if (idx) {
      if (!index) index = Number(idx[1]);
      continue;
    }
    // "BLACK WITH GREEN (1)" — trailing paren index glued to the colour
    const glued = token.match(/^(.*?)\s*\((\d+)\)$/);
    const body = glued ? glued[1].trim() : token;
    if (glued && !index) index = Number(glued[2]);
    if (!body || NOISE.test(body)) continue;
    words.push(body.replace(/\s+CHAIR$/i, '').trim());
  }

  const colour = words.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  return { back, colour: colour || cfg.fallbackColour, index };
}

type Shot = { colour: string; colourSlug: string; index: number; src: string; out: string };

async function findSourceDir() {
  for (const dir of SOURCE_CANDIDATES) {
    try {
      const st = await fs.stat(dir);
      if (st.isDirectory()) return dir;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

/**
 * The masters carry a studio label ("MUSTANG HB CHAIR") in the top-right corner. Paint it out,
 * but only when that corner really is empty backdrop — the mean-luminance guard means a shot
 * where the product reaches into the corner is left untouched.
 */
const LABEL_LEFT = 0.66; // label box starts here, as a fraction of the width
const LABEL_HEIGHT = 0.17;
/**
 * Mean luminance above which the label box counts as bare paper.
 * Measured across the shoot: paper + label ink lands at 241–255, while a product intruding
 * into that corner pulls it to ~210 or below.
 */
const BACKDROP_MEAN = 238;

/** Post-rotation dimensions (metadata reports pre-rotation; orientations 5–8 swap the axes). */
async function dimensions(src: string) {
  const meta = await sharp(src).metadata();
  const swap = (meta.orientation ?? 1) >= 5;
  return { width: (swap ? meta.height : meta.width) ?? 0, height: (swap ? meta.width : meta.height) ?? 0 };
}

/**
 * True when the top-right corner holds nothing but backdrop and the studio label.
 *
 * `stats()` reports on the *input* image and ignores pipeline operations, so the crop has to
 * be materialised into a buffer before it can be measured — measuring the pipeline directly
 * silently returns whole-image statistics.
 */
async function cornerIsEmpty(src: string, width: number, height: number) {
  const left = Math.round(width * LABEL_LEFT);
  const region = { left, top: 0, width: width - left, height: Math.round(height * LABEL_HEIGHT) };
  const crop = await sharp(src).rotate().extract(region).toBuffer();
  const stats = await sharp(crop).stats();
  const mean = stats.channels.slice(0, 3).reduce((sum, c) => sum + c.mean, 0) / 3;
  return mean >= BACKDROP_MEAN;
}

async function transcode(src: string, out: string) {
  if (!FORCE) {
    try {
      await fs.stat(out);
      return false;
    } catch {
      /* not built yet */
    }
  }
  await fs.mkdir(path.dirname(out), { recursive: true });

  const { width, height } = await dimensions(src);
  let pipeline = sharp(src)
    .rotate()
    .resize({ width: WIDTH, height: WIDTH, fit: 'inside', withoutEnlargement: true });

  // The masters carry a studio label ("MUSTANG HB CHAIR") top-right. Paint it out — but sharp
  // always composites *after* resize, so the patch is measured in output pixels, not source ones.
  if (width && height && (await cornerIsEmpty(src, width, height))) {
    const scale = Math.min(1, WIDTH / Math.max(width, height));
    const outW = Math.round(width * scale);
    const outH = Math.round(height * scale);
    const left = Math.round(outW * LABEL_LEFT);
    const patch = await sharp({
      create: { width: outW - left, height: Math.round(outH * LABEL_HEIGHT), channels: 3, background: '#FFFFFF' },
    })
      .png()
      .toBuffer();
    pipeline = pipeline.composite([{ input: patch, left, top: 0 }]);
  }

  await pipeline.webp({ quality: QUALITY, effort: 6 }).toFile(out);
  return true;
}

/**
 * Hero asset for the showroom section.
 *
 * Chroma-keying these masters is not reliable: a see-through mesh back averages lighter than
 * the paper it is shot on, so any luminance mask either eats the mesh or keeps the shadow.
 * The hero therefore ships as a straight high-resolution crop and the page stages it on a
 * porcelain plate against the ink band. Replace with a properly masked PNG from the
 * photographer when one is available and the component will use it as-is.
 */
async function buildHero(src: string, out: string) {
  await fs.mkdir(path.dirname(out), { recursive: true });
  await sharp(src)
    .rotate()
    .resize({ width: 1500, height: 1500, fit: 'inside', withoutEnlargement: true })
    .trim({ threshold: 8 })
    .webp({ quality: 86 })
    .toFile(out);
}

async function main() {
  const SOURCE = await findSourceDir();
  if (!SOURCE) {
    console.error(
      `No photo-shoot source found. Expected one of:\n${SOURCE_CANDIDATES.map((d) => `  ${d}`).join('\n')}`,
    );
    process.exit(1);
  }
  console.log(`Source: ${SOURCE}\n`);

  const manifest: Record<
    string,
    { model: string; back: string; family: string; colours: { label: string; slug: string; images: string[] }[] }
  > = {};

  let built = 0;
  let skipped = 0;
  const unmatched: string[] = [];

  for (const cfg of MODELS) {
    const dir = path.join(SOURCE, cfg.dir);
    let files: string[];
    try {
      files = await fs.readdir(dir);
    } catch {
      console.warn(`  ! missing folder: ${cfg.dir}`);
      continue;
    }

    const byProduct = new Map<string, Shot[]>();

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const base = path.basename(file, path.extname(file));

      if (ext === '.pdf') {
        const target = PDF_MAP[file];
        if (target) {
          await fs.mkdir(OUT_DOWNLOADS, { recursive: true });
          await fs.copyFile(path.join(dir, file), path.join(OUT_DOWNLOADS, target));
          console.log(`  pdf  ${cfg.dir}/${file} -> /downloads/${target}`);
        }
        continue;
      }
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

      const parsed = parse(base, cfg);
      if (!parsed) {
        unmatched.push(`${cfg.dir}/${file}`);
        continue;
      }

      const productSlug = parsed.back ? `${kebab(cfg.model)}-${parsed.back.toLowerCase()}` : kebab(cfg.model);
      const colourSlug = kebab(parsed.colour);
      const list = byProduct.get(productSlug) ?? [];
      list.push({
        colour: titleCase(parsed.colour),
        colourSlug,
        index: parsed.index || list.length + 1,
        src: path.join(dir, file),
        out: '',
      });
      byProduct.set(productSlug, list);
    }

    for (const [productSlug, shots] of byProduct) {
      // stable, de-duplicated output names: <colour>-<n>.webp
      const seen = new Map<string, number>();
      shots.sort(
        (a, b) => a.colourSlug.localeCompare(b.colourSlug) || a.index - b.index || a.src.localeCompare(b.src),
      );
      for (const shot of shots) {
        const n = (seen.get(shot.colourSlug) ?? 0) + 1;
        seen.set(shot.colourSlug, n);
        shot.out = `/products/${cfg.family}/${productSlug}/${shot.colourSlug}-${n}.webp`;
      }

      const made = await mapPool(shots, CONCURRENCY, (shot) =>
        transcode(shot.src, path.join(ROOT, 'public', shot.out.slice(1))),
      );
      for (const madeIt of made) madeIt ? built++ : skipped++;

      const colours = new Map<string, { label: string; slug: string; images: string[] }>();
      for (const shot of shots) {
        const entry = colours.get(shot.colourSlug) ?? { label: shot.colour, slug: shot.colourSlug, images: [] };
        entry.images.push(shot.out);
        colours.set(shot.colourSlug, entry);
      }

      // black/standard colourway leads the gallery
      const ordered = [...colours.values()].sort((a, b) => {
        const rank = (s: string) => (/^black|^grey|^standard|^studio/.test(s) ? 0 : 1);
        return rank(a.slug) - rank(b.slug) || a.label.localeCompare(b.label);
      });

      manifest[productSlug] = {
        model: cfg.model,
        back: productSlug.endsWith('-hb') ? 'HB' : productSlug.endsWith('-mb') ? 'MB' : '',
        family: cfg.family,
        colours: ordered,
      };
      console.log(
        `  ${productSlug.padEnd(18)} ${String(shots.length).padStart(3)} shots · ${ordered.length} colourway(s)`,
      );
    }
  }

  // hero asset
  try {
    const heroSrc = path.join(SOURCE, HERO_SOURCE.dir, HERO_SOURCE.file);
    await fs.stat(heroSrc);
    await buildHero(heroSrc, path.join(OUT_HERO, 'home-chair.webp'));
    console.log('\n  hero /hero/home-chair.webp');
  } catch (err) {
    console.warn('\n  ! hero build skipped:', (err as Error).message);
  }

  const header = `// GENERATED by \`npm run ingest-images\` — do not edit by hand.
// Source: DecArt product photo-shoot masters.

export type ColourwayShots = { label: string; slug: string; images: string[] };
export type PhotoshootEntry = { model: string; back: string; family: string; colours: ColourwayShots[] };

export const PHOTOSHOOT: Record<string, PhotoshootEntry> = `;

  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.writeFile(MANIFEST, `${header}${JSON.stringify(manifest, null, 2)};\n`, 'utf8');

  console.log(`\nBuilt ${built} webp · skipped ${skipped} (already built) · ${Object.keys(manifest).length} products`);
  console.log(`Manifest: ${path.relative(ROOT, MANIFEST)}`);
  if (unmatched.length) {
    console.log(`\nUnmatched files (${unmatched.length}) — left out of the catalogue:`);
    unmatched.forEach((f) => console.log(`  ${f}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
