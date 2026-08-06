import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { postBySlug, updatePostBySlug, deletePostBySlug } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { blogSchema, fieldErrors } from '@/lib/validators';
import { readingMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = await postBySlug(params.slug);
  if (!post) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: post });
}

export async function PATCH(req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = blogSchema.partial().safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.contentHtml !== undefined) update.readingMinutes = readingMinutes(parsed.data.contentHtml);
  if (parsed.data.status === 'published') {
    update.publishedAt = new Date(parsed.data.publishedAt ?? Date.now());
  }
  if (parsed.data.status === 'draft') update.publishedAt = null;

  const existing = await postBySlug(params.slug);
  if (!existing) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  const post = await updatePostBySlug(params.slug, update);
  if (!post) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/');

  return NextResponse.json({ ok: true, data: post });
}

export async function DELETE(_req: Request, { params }: { params: { slug: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  await deletePostBySlug(params.slug);
  revalidatePath('/blog');

  return NextResponse.json({ ok: true });
}
