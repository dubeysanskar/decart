'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Check, X, Star, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { Stars } from '@/components/product/Reviews';
import { formatDate, cn } from '@/lib/utils';

export type ReviewRow = {
  _id: string;
  productSlug?: string | null;
  name: string;
  company?: string;
  city?: string;
  rating: number;
  title?: string;
  body: string;
  status: string;
  featured: boolean;
  adminReply?: string;
  createdAt: string;
};

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

export function ReviewQueue({
  rows,
  status,
  counts,
}: {
  rows: ReviewRow[];
  status: string;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [local, setLocal] = useState(rows);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [reply, setReply] = useState('');

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.push('Could not save that.', 'error');
      return;
    }
    toast.push('Saved. Product rating recalculated.');
    setLocal((current) =>
      body.status && body.status !== status
        ? current.filter((row) => row._id !== id)
        : current.map((row) => (row._id === id ? { ...row, ...(body as object) } : row)),
    );
    setReplyTo(null);
    setReply('');
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.push('Delete failed.', 'error');
      return;
    }
    setLocal((current) => current.filter((row) => row._id !== id));
    toast.push('Deleted.');
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Reviews</h1>
        <p className="mt-1 text-sm text-steel-600">
          Approved reviews drive the product star rating; featured ones appear on the homepage.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/reviews?status=${tab.id}`}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium',
              status === tab.id ? 'border-ink-900 bg-ink-900 text-porcelain' : 'border-line bg-paper text-steel-600',
            )}
          >
            {tab.label}
            <span className="ml-2 font-mono text-[10px]">{counts[tab.id] ?? 0}</span>
          </Link>
        ))}
      </div>

      {local.length ? (
        <ul className="flex flex-col gap-4">
          {local.map((review) => (
            <li key={review._id} className="rounded-card border border-line bg-paper p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={review.rating} />
                <span className="font-medium text-ink-950">{review.name}</span>
                <span className="text-xs text-steel-600">
                  {[review.company, review.city].filter(Boolean).join(' · ')}
                </span>
                {review.productSlug ? (
                  <span className="rounded-full bg-porcelain px-2.5 py-1 font-mono text-[10px] text-steel-600">
                    {review.productSlug}
                  </span>
                ) : (
                  <span className="rounded-full bg-porcelain px-2.5 py-1 text-[10px] text-steel-600">General</span>
                )}
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {review.title ? <h2 className="mt-3 font-semibold text-ink-950">{review.title}</h2> : null}
              <p className="mt-2 text-sm leading-relaxed text-steel-600">{review.body}</p>

              {review.adminReply ? (
                <p className="mt-3 border-l-2 border-decart-500 pl-3 text-sm text-steel-600">
                  <span className="font-semibold text-decart-700">DecArt replied: </span>
                  {review.adminReply}
                </p>
              ) : null}

              {replyTo === review._id ? (
                <div className="mt-4">
                  <Textarea
                    label="Public reply"
                    rows={3}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => patch(review._id, { adminReply: reply })}>
                      Save reply
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  {review.status !== 'approved' ? (
                    <Button size="sm" onClick={() => patch(review._id, { status: 'approved' })}>
                      <Check className="h-4 w-4" /> Approve
                    </Button>
                  ) : null}
                  {review.status !== 'rejected' ? (
                    <Button size="sm" variant="secondary" onClick={() => patch(review._id, { status: 'rejected' })}>
                      <X className="h-4 w-4" /> Reject
                    </Button>
                  ) : null}
                  {review.status === 'approved' ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => patch(review._id, { featured: !review.featured })}
                    >
                      <Star className={cn('h-4 w-4', review.featured && 'fill-cognac-500 text-cognac-500')} />
                      {review.featured ? 'Unfeature' : 'Feature on homepage'}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyTo(review._id);
                      setReply(review.adminReply ?? '');
                    }}
                  >
                    <MessageSquare className="h-4 w-4" /> Reply
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(review._id)}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-paper p-10 text-center text-sm text-steel-600">
          Nothing in this queue.
        </p>
      )}
    </div>
  );
}
