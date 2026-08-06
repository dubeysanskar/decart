'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Honeypot } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { COPY } from '@/lib/site';
import { formatDate, cn } from '@/lib/utils';

export type PublicReview = {
  _id: string;
  name: string;
  company?: string;
  city?: string;
  rating: number;
  title?: string;
  body: string;
  adminReply?: string;
  createdAt: string;
};

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn('h-4 w-4', i < Math.round(value) ? 'fill-cognac-500 text-cognac-500' : 'text-line')}
        />
      ))}
    </span>
  );
}

export function ReviewsBlock({
  productSlug,
  reviews,
  ratingAvg,
  ratingCount,
}: {
  productSlug: string;
  reviews: PublicReview[];
  ratingAvg: number;
  ratingCount: number;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setErrors({});
    const form = new FormData(event.currentTarget);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug,
          name: form.get('name'),
          company: form.get('company'),
          city: form.get('city'),
          rating,
          title: form.get('title'),
          body: form.get('body'),
          website: form.get('website'),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrors(json.errors ?? { form: json.error ?? 'Something went wrong.' });
        return;
      }
      setDone(true);
      toast.push(COPY.reviewThanks);
    } catch {
      setErrors({ form: 'Could not send that. Please try again or WhatsApp us.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-h3 text-ink-950">Reviews</h2>
        {ratingCount > 0 ? (
          <p className="flex items-center gap-2 text-sm text-steel-600">
            <Stars value={ratingAvg} />
            <span className="font-mono text-xs">
              {ratingAvg.toFixed(1)} · {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
            </span>
          </p>
        ) : null}
      </div>

      {reviews.length ? (
        <ul className="mt-6 space-y-5">
          {reviews.map((review) => (
            <li key={review._id} className="rounded-card border border-line bg-porcelain p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={review.rating} />
                <span className="text-sm font-semibold text-ink-950">{review.name}</span>
                <span className="text-xs text-steel-600">
                  {[review.company, review.city].filter(Boolean).join(' · ')}
                </span>
                <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              {review.title ? <h3 className="mt-3 font-semibold text-ink-950">{review.title}</h3> : null}
              <p className="mt-2 text-sm leading-relaxed text-steel-600">{review.body}</p>
              {review.adminReply ? (
                <div className="mt-4 border-l-2 border-decart-500 pl-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-decart-700">DecArt replied</p>
                  <p className="mt-1 text-sm text-steel-600">{review.adminReply}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-steel-600">
          No reviews on this model yet. If you have bought it, we would like to hear how it is holding up.
        </p>
      )}

      {done ? (
        <p className="mt-6 rounded-card border border-success/25 bg-success/5 p-4 text-sm text-ink-900">
          {COPY.reviewThanks}
        </p>
      ) : open ? (
        <form onSubmit={onSubmit} className="relative mt-6 rounded-card border border-line p-5">
          <Honeypot />
          <h3 className="text-base font-semibold text-ink-950">Write a review</h3>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-steel-600">Your rating</span>
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                aria-label={`${i + 1} star${i ? 's' : ''}`}
                aria-pressed={rating === i + 1}
              >
                <Star className={cn('h-6 w-6', i < rating ? 'fill-cognac-500 text-cognac-500' : 'text-line')} />
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Input name="name" label="Name" required error={errors.name} />
            <Input name="company" label="Company" />
            <Input name="city" label="City" />
          </div>
          <Input name="title" label="Headline" className="mt-4" wrapperClassName="mt-4" />
          <Textarea name="body" label="Your review" required rows={4} error={errors.body} wrapperClassName="mt-4" />

          {errors.form ? <p className="mt-3 text-sm text-danger">{errors.form}</p> : null}

          <div className="mt-5 flex gap-3">
            <Button type="submit" disabled={sending}>
              {sending ? 'Sending…' : 'Submit review'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
          <p className="mt-3 text-xs text-steel-600">Reviews appear after a quick check by our team.</p>
        </form>
      ) : (
        <Button variant="secondary" className="mt-6" onClick={() => setOpen(true)}>
          Write a review
        </Button>
      )}
    </section>
  );
}
