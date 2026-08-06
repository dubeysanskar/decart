/**
 * Derives the brand asset set (§6.3 `public/brand/`) from the client's master logo.
 *
 *   npm run brand
 *
 * Produces: a transparent lockup, a porcelain "on-dark" lockup, the hexagon mark in both
 * finishes, the app icons Next.js picks up from src/app/, and a 1200x630 OG card.
 *
 * The masking is done with explicit pixel maths rather than sharp's `negate`/`threshold`
 * operators: sharp applies those in a fixed internal order, not call order, so chaining them
 * silently produces an inverted mask.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());
const SRC = path.join(ROOT, 'public', 'decart logo.png');
const BRAND = path.join(ROOT, 'public', 'brand');
const APP = path.join(ROOT, 'src', 'app');

const PORCELAIN = [246, 247, 249] as const;

const PAPER_LEVEL = 244; // at or above this luminance a pixel is backdrop, not artwork
const INK_LEVEL = 120; // below this a pixel is the near-black artwork (D, wordmark, hex outline)

const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

type Raster = { data: Buffer; width: number; height: number; channels: number };

async function raster(input: Buffer | string): Promise<Raster> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: info.channels };
}

const toPng = (r: Raster) =>
  sharp(r.data, { raw: { width: r.width, height: r.height, channels: 4 } }).png();

/** Transparent where the master is bare paper. */
function keyOutPaper(r: Raster): Raster {
  const out = Buffer.alloc(r.width * r.height * 4);
  for (let i = 0, o = 0; i < r.data.length; i += r.channels, o += 4) {
    const [red, green, blue] = [r.data[i], r.data[i + 1], r.data[i + 2]];
    out[o] = red;
    out[o + 1] = green;
    out[o + 2] = blue;
    out[o + 3] = luma(red, green, blue) >= PAPER_LEVEL ? 0 : 255;
  }
  return { data: out, width: r.width, height: r.height, channels: 4 };
}

/** Repaint the near-black artwork porcelain; the blue hexagon is left alone. */
function inkToPorcelain(r: Raster): Raster {
  const out = Buffer.from(r.data);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    if (luma(out[i], out[i + 1], out[i + 2]) < INK_LEVEL) {
      out[i] = PORCELAIN[0];
      out[i + 1] = PORCELAIN[1];
      out[i + 2] = PORCELAIN[2];
    }
  }
  return { ...r, data: out };
}

async function main() {
  await fs.stat(SRC).catch(() => {
    throw new Error(`Master logo not found at ${SRC}`);
  });
  await fs.mkdir(BRAND, { recursive: true });

  // 1. flatten onto paper and trim the margin
  const trimmed = await sharp(SRC).flatten({ background: '#ffffff' }).trim({ threshold: 8 }).png().toBuffer();

  // 2. transparent lockup
  const keyed = keyOutPaper(await raster(trimmed));
  const lockup = await toPng(keyed).toBuffer();
  await sharp(lockup).resize({ width: 1000 }).png({ compressionLevel: 9 }).toFile(path.join(BRAND, 'logo.png'));

  // 3. on-dark lockup
  const darkLockup = await toPng(inkToPorcelain(keyed)).toBuffer();
  await sharp(darkLockup).resize({ width: 1000 }).png({ compressionLevel: 9 }).toFile(path.join(BRAND, 'logo-dark.png'));

  // 4. hexagon mark — the badge occupies roughly the first 36% of the lockup
  const markBox = { left: 0, top: 0, width: Math.round(keyed.width * 0.36), height: keyed.height };
  await sharp(lockup).extract(markBox).trim({ threshold: 1 }).resize({ width: 512 }).png().toFile(path.join(BRAND, 'logo-mark.png'));
  await sharp(darkLockup)
    .extract(markBox)
    .trim({ threshold: 1 })
    .resize({ width: 512 })
    .png()
    .toFile(path.join(BRAND, 'logo-mark-dark.png'));

  // 5. app icons (Next.js reads src/app/icon.png + apple-icon.png)
  const mark = await fs.readFile(path.join(BRAND, 'logo-mark.png'));
  const square = async (size: number, pad: number, background: string) =>
    sharp({ create: { width: size, height: size, channels: 4, background } })
      .composite([
        {
          input: await sharp(mark)
            .resize({ width: size - pad * 2, height: size - pad * 2, fit: 'contain', background: '#00000000' })
            .png()
            .toBuffer(),
        },
      ])
      .png()
      .toBuffer();

  await fs.writeFile(path.join(APP, 'icon.png'), await square(256, 16, '#00000000'));
  await fs.writeFile(path.join(APP, 'apple-icon.png'), await square(180, 18, '#FFFFFF'));
  await fs.writeFile(path.join(BRAND, 'apple-touch-icon.png'), await square(180, 18, '#FFFFFF'));

  // 6. OG card — dark showroom band with the porcelain lockup
  const ogLogo = await sharp(darkLockup).resize({ width: 620 }).png().toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#0F1317' } })
    .composite([{ input: ogLogo, gravity: 'centre' }])
    .jpeg({ quality: 88 })
    .toFile(path.join(BRAND, 'og-default.jpg'));

  console.log('Brand assets written to public/brand/ and src/app/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
