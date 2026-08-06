import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { hasDb } from '@/lib/db';
import { listPosts, publishedPosts, postBySlug, insertPost } from '@/lib/repo';
import { requireAdmin, auth } from '@/lib/auth';
import { blogSchema, fieldErrors } from '@/lib/validators';
import { readingMinutes } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!hasDb()) return NextResponse.json({ ok: true, data: [] });

  const session = await auth();
  const rows = session?.user ? await listPosts('published') : await publishedPosts();

  return NextResponse.json({ ok: true, data: rows });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = blogSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: fieldErrors(parsed.error) }, { status: 400 });
  }

  const exists = await postBySlug(parsed.data.slug);
  if (exists) {
    return NextResponse.json({ ok: false, errors: { slug: 'That slug is already taken' } }, { status: 409 });
  }

  const post = await insertPost({
    ...parsed.data,
    readingMinutes: readingMinutes(parsed.data.contentHtml),
    publishedAt: parsed.data.status === 'published' ? new Date(parsed.data.publishedAt ?? Date.now()) : null,
  });

  revalidatePath('/blog');
  return NextResponse.json({ ok: true, data: post }, { status: 201 });
}
