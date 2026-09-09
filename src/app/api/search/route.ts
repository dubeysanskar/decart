import { NextResponse } from 'next/server';
import { siteSearch } from '@/lib/search';
import { rateLimit, clientIp, sweep } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/search?q= — what the header's search box calls as you type.
 *
 * Public and read-only, but still rate-limited: it is the one public endpoint that walks the
 * whole catalogue, and a typing loop is exactly the shape of an accidental hammering.
 */
export async function GET(req: Request) {
  sweep();
  const limit = rateLimit(`search:${clientIp(req)}`, 90, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: 'Slow down a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const q = new URL(req.url).searchParams.get('q') ?? '';
  const results = await siteSearch(q, { products: 6, families: 3, posts: 2, projects: 2 });

  return NextResponse.json({
    ok: true,
    data: {
      query: results.query,
      total: results.total,
      // trimmed to what the dropdown draws — the full page does its own search
      products: results.products.map(({ product }) => ({
        slug: product.slug,
        family: product.family,
        code: product.code,
        name: product.name,
        image: product.images?.[0]?.src ?? null,
      })),
      families: results.families.map(({ slug, name, count }) => ({ slug, name, count })),
      posts: results.posts.map(({ slug, title }) => ({ slug, title })),
      projects: results.projects.map(({ slug, title, client }) => ({ slug, title, client })),
    },
  });
}
