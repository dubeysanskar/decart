import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { listProducts, countProducts, productBySlug, insertProduct, type ProductFilter } from '@/lib/repo';
import { requireAdmin, auth } from '@/lib/auth';
import { productSchema, fieldErrors } from '@/lib/validators';
import { allSeedProducts } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

/** GET /api/products — published for the public, everything for admins. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const session = await auth();
  const isAdmin = Boolean(session?.user);

  if (!hasDb()) {
    const seed = allSeedProducts().filter((p) => p.status === 'published');
    return NextResponse.json({ ok: true, data: { rows: seed, total: seed.length, source: 'seed' } });
  }

  const filter: ProductFilter = { publishedOnly: !isAdmin };
  const family = url.searchParams.get('family');
  const group = url.searchParams.get('group');
  const status = url.searchParams.get('status');
  if (family) filter.family = family;
  if (group) filter.group = group;
  if (status && isAdmin) filter.status = status;
  if (url.searchParams.get('needsPhoto') === '1') filter.needsPhoto = true;
  const q = url.searchParams.get('q');
  if (q) filter.q = q;

  const limit = Math.min(500, Number(url.searchParams.get('limit') ?? 200));
  const [rows, total] = await Promise.all([listProducts(filter, limit), countProducts(filter)]);

  return NextResponse.json({ ok: true, data: { rows, total, source: 'db' } });
}

/** POST /api/products — create. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = productSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const exists = await productBySlug(parsed.data.slug);
  if (exists) {
    return NextResponse.json({ ok: false, errors: { slug: 'That slug is already taken' } }, { status: 409 });
  }

  const product = await insertProduct(parsed.data);
  revalidatePath('/products');
  revalidatePath(`/products/${product.family}`);

  return NextResponse.json({ ok: true, data: product }, { status: 201 });
}
