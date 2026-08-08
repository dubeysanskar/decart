/**
 * Static asset squeeze — `npm run optimise-images`.
 *
 * Re-encodes the committed brand/hero assets that were exported straight from design tools and
 * never compressed for the web. Product photography is NOT touched here: those derivatives come
 * from the 1.1 GB masters via `npm run ingest-images`, and re-compressing an already-lossy WebP
 * would stack generation loss. Change the constants in that script instead.
 *
 * Every file this touches is regenerable (`npm run brand`, `npm run ingest-images`), and a file
 * is only overwritten when the new encode is actually smaller.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());

/** PNGs exported at full canvas size; palette quantisation keeps the alpha and drops the weight. */
const PNG_TARGETS = [
  'public/brand/logo.png',
  'public/brand/logo-dark.png',
  'public/brand/logo-mark.png',
  'public/brand/logo-mark-dark.png',
  'public/brand/apple-touch-icon.png',
];

const JPEG_TARGETS = ['public/brand/og-default.jpg'];

const kb = (bytes: number) => `${String(Math.round(bytes / 1024)).padStart(4)} KB`;

async function rewrite(rel: string, encode: (input: Buffer) => Promise<Buffer>) {
  const file = path.join(ROOT, rel);
  let before: Buffer;
  try {
    before = await fs.readFile(file);
  } catch {
    console.log(`  skip     ${rel} (missing)`);
    return { saved: 0 };
  }

  const after = await encode(before);

  if (after.length >= before.length) {
    console.log(`  keep     ${kb(before.length)}            ${rel} (already optimal)`);
    return { saved: 0 };
  }

  await fs.writeFile(file, after);
  const saved = before.length - after.length;
  const pct = Math.round((saved / before.length) * 100);
  console.log(`  shrunk   ${kb(before.length)} → ${kb(after.length)}  -${String(pct).padStart(2)}%  ${rel}`);
  return { saved };
}

async function main() {
  console.log('Optimising committed brand assets\n');
  let saved = 0;

  for (const rel of PNG_TARGETS) {
    const result = await rewrite(rel, (input) =>
      sharp(input)
        // palette + max effort keeps transparency crisp while collapsing the file
        .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
        .toBuffer(),
    );
    saved += result.saved;
  }

  for (const rel of JPEG_TARGETS) {
    const result = await rewrite(rel, (input) =>
      sharp(input).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer(),
    );
    saved += result.saved;
  }

  console.log(`\nSaved ${(saved / 1024).toFixed(0)} KB across ${PNG_TARGETS.length + JPEG_TARGETS.length} files.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
