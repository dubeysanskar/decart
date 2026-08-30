'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { cn } from '@/lib/utils';

const EMPTY = {
  name: '',
  company: '',
  city: '',
  rating: 5,
  title: '',
  body: '',
  productSlug: '',
  featured: true,
};

/**
 * Lets the client type in a testimonial they were given by phone, email or WhatsApp.
 * It publishes immediately — unlike the public review form, which lands as `pending`,
 * because the person entering this one is the moderator.
 */
export function TestimonialForm() {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function save() {
    setBusy(true);
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      toast.push('Testimonial published.', 'success');
      setDraft(EMPTY);
      setOpen(false);
      router.refresh();
    } else {
      toast.push((json?.errors && (Object.values(json.errors)[0] as string)) || 'Could not save.', 'error');
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add testimonial
      </Button>
    );
  }

  return (
    <section className="w-full rounded-card border border-decart-300 bg-paper p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink-950">Add a testimonial</h2>
          <p className="mt-1 text-sm text-steel-600">
            For words a client gave you directly. This publishes straight away.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="flex h-9 w-9 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Input
          label="Name"
          required
          value={draft.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Rahul Mehta"
        />
        <Input
          label="Company"
          value={draft.company}
          onChange={(e) => set('company', e.target.value)}
          placeholder="Tech Mahindra"
        />
        <Input label="City" value={draft.city} onChange={(e) => set('city', e.target.value)} placeholder="Noida" />
        <Input
          label="Product slug (optional)"
          value={draft.productSlug}
          onChange={(e) => set('productSlug', e.target.value)}
          placeholder="bonai-hb"
          hint="Ties the testimonial to one model's page."
        />
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <div>
          <span className="text-sm font-medium text-ink-900">Rating</span>
          <div className="mt-2 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('rating', n)}
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={draft.rating === n}
                className="p-0.5"
              >
                <Star
                  className={cn(
                    'h-6 w-6 transition-colors',
                    n <= draft.rating ? 'fill-cognac-500 text-cognac-500' : 'text-line',
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Headline"
          value={draft.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="Delivered 200 chairs in ten days"
        />
        <Textarea
          label="What they said"
          required
          rows={4}
          value={draft.body}
          onChange={(e) => set('body', e.target.value)}
          hint="Use their words. Get their permission before naming the company."
        />

        <label className="flex items-center gap-3 rounded-btn border border-line px-4 py-3">
          <input
            type="checkbox"
            checked={draft.featured}
            onChange={(e) => set('featured', e.target.checked)}
            className="h-4 w-4 accent-decart-700"
          />
          <span className="text-sm text-ink-900">Show on the home page</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button onClick={save} disabled={busy}>
          {busy ? <HexSpinner /> : null}
          Publish testimonial
        </Button>
      </div>
    </section>
  );
}
