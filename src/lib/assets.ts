import 'server-only';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Public-folder introspection. The spec's rule is "render only what exists" — cert badges,
 * gallery tabs, marketplace links and downloads all key off these helpers so the client can
 * light a section up simply by dropping files in.
 */

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const IMAGE_EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

const cache = new Map<string, string[]>();

export function listPublic(dir: string, { images = true }: { images?: boolean } = {}): string[] {
  const key = `${dir}:${images}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const abs = path.join(PUBLIC_DIR, dir);
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(abs, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => (images ? IMAGE_EXT.has(path.extname(name).toLowerCase()) : true))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name) => `/${dir}/${name}`.replace(/\/+/g, '/'));
  } catch {
    files = [];
  }

  cache.set(key, files);
  return files;
}

export function publicFileExists(relative: string) {
  try {
    return fs.statSync(path.join(PUBLIC_DIR, relative.replace(/^\//, ''))).isFile();
  } catch {
    return false;
  }
}

export function fileSizeLabel(relative: string) {
  try {
    const bytes = fs.statSync(path.join(PUBLIC_DIR, relative.replace(/^\//, ''))).size;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } catch {
    return '';
  }
}
