import Link from 'next/link';
import { Plus } from 'lucide-react';
import { hasDb } from '@/lib/db';
import { listPosts } from '@/lib/repo';
import { formatDate, cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Blog unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to write and publish posts.</p>
      </div>
    );
  }

  const posts = await listPosts('updated');

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Blog</h1>
          <p className="mt-1 text-sm text-steel-600">{posts.length} posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink-900 px-4 text-sm font-semibold text-porcelain hover:bg-ink-800"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {posts.length ? (
        <div className="overflow-x-auto rounded-card border border-line bg-paper">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left">
                {['Title', 'Status', 'Published', 'Reading', 'Tags'].map((head) => (
                  <th key={head} className="px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-steel-600">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-porcelain">
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/blog/${post.slug}`} className="font-medium text-ink-950 hover:text-decart-700">
                      {post.title}
                    </Link>
                    <p className="font-mono text-[10px] text-steel-400">/{post.slug}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-medium',
                        post.status === 'published' ? 'bg-success/12 text-success' : 'bg-porcelain text-steel-600',
                      )}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-steel-600">
                    {post.publishedAt ? formatDate(post.publishedAt as unknown as Date) : '—'}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-steel-600">{post.readingMinutes} min</td>
                  <td className="px-3 py-2.5 text-xs text-steel-600">{post.tags?.join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-paper p-10 text-center text-sm text-steel-600">
          No posts yet. The blog section is hidden from the homepage until the first post publishes.
        </p>
      )}
    </div>
  );
}
