import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { productBySlug, updateProductBySlug, archiveProduct, deleteArchivedProduct } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { productSchema, fieldErrors } from '@/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const product = await productBySlug(params.slug);
  if (!product) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: product });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = productSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const existing = await productBySlug(params.slug);
  if (!existing) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const product = await updateProductBySlug(params.slug, parsed.data);
  if (!product) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  revalidatePath('/products');
  revalidatePath(`/products/${product.family}`);
  revalidatePath(`/products/${product.family}/${product.slug}`);
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: product });
}

/** Soft delete — archive. Hard delete is only offered from the archived list. */
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const hard = new URL(req.url).searchParams.get('hard') === '1';

  if (hard) {
    await deleteArchivedProduct(params.slug);
  } else {
    await archiveProduct(params.slug);
  }

  revalidatePath('/products');
  return NextResponse.json({ ok: true });
}
