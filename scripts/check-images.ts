/**
 * `npm run check-images` — prints which manifest paths are missing from /public.
 * Share the output with the client; every missing file renders the branded placeholder.
 */
import fs from 'node:fs';
import path from 'node:path';
import { allSeedProducts, FAMILIES } from '../src/data/catalogue.seed';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const exists = (relative: string) => {
  try {
    return fs.statSync(path.join(PUBLIC_DIR, relative.replace(/^\//, ''))).isFile();
  } catch {
    return false;
  }
};

const BRAND = [
  '/brand/logo.png',
  '/brand/logo-dark.png',
  '/brand/logo-mark.png',
  '/brand/og-default.jpg',
  '/hero/home-chair.webp',
  '/downloads/decart-catalogue.pdf',
];

function main() {
  const products = allSeedProducts();

  console.log('DecArt image manifest check\n');

  const missingBrand = BRAND.filter((file) => !exists(file));
  console.log(`Brand & core assets: ${BRAND.length - missingBrand.length}/${BRAND.length} present`);
  missingBrand.forEach((file) => console.log(`  missing  ${file}`));

  const withPhotos = products.filter((product) => product.images.some((image) => exists(image.src)));
  const broken = products.flatMap((product) =>
    product.images.filter((image) => !exists(image.src)).map((image) => `${product.code}: ${image.src}`),
  );

  console.log(`\nProducts with photography: ${withPhotos.length}/${products.length}`);
  if (broken.length) {
    console.log(`\nManifest paths pointing at missing files (${broken.length}):`);
    broken.slice(0, 40).forEach((line) => console.log(`  ${line}`));
    if (broken.length > 40) console.log(`  … and ${broken.length - 40} more`);
  }

  console.log('\nFamilies still awaiting photography:');
  for (const family of FAMILIES) {
    const inFamily = products.filter((product) => product.family === family.slug);
    const shot = inFamily.filter((product) => product.images.some((image) => exists(image.src))).length;
    if (shot < inFamily.length) {
      console.log(
        `  ${family.slug.padEnd(20)} ${String(shot).padStart(3)}/${String(inFamily.length).padEnd(4)} · catalogue pp. ${family.pages}`,
      );
    }
  }

  const optional = [
    ['certificates', 'compliance badge strip'],
    ['clients', 'client logo wall'],
    ['factory', 'manufacturing page gallery'],
    ['gallery/installations', 'home project strip + gallery tab'],
    ['gallery/warehouse', 'gallery tab'],
    ['gallery/exhibitions', 'gallery tab'],
    ['team', 'MD portrait on About'],
  ] as const;

  console.log('\nOptional folders (sections stay hidden until files land):');
  for (const [dir, purpose] of optional) {
    let count = 0;
    try {
      count = fs.readdirSync(path.join(PUBLIC_DIR, dir)).filter((f) => /\.(webp|jpe?g|png|avif)$/i.test(f)).length;
    } catch {
      count = 0;
    }
    console.log(`  ${dir.padEnd(24)} ${String(count).padStart(3)} files — ${purpose}`);
  }
}

main();
