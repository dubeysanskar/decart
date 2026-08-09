'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';

export type FaqDraft = { q: string; a: string };
export type CategoryDraft = {
  slug: string;
  name: string;
  count: number;
  heading: string;
  intro: string;
  bodyHtml: string;
  faq: FaqDraft[];
  seoTitle: string;
  seoDescription: string;
};

/**
 * Per-category editorial content: the copy that sits under the listing and the category FAQ.
 * Client brief — "har category ka FAQ section bhi rakhna hai, uska content backend se aaye".
 */
export function CategoryEditor({ categories }: { categories: CategoryDraft[] }) {
  const router = useRouter();
  const toast = useToast();
  const [active, setActive] = useState(categories[0]?.slug ?? '');
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>(
    Object.fromEntries(categories.map((c) => [c.slug, c])),
  );
  const [busy, setBusy] = useState(false);

  const draft = drafts[active];

  const set = <K extends keyof CategoryDraft>(key: K, value: CategoryDraft[K]) =>
    setDrafts((all) => ({ ...all, [active]: { ...all[active], [key]: value } }));

  const setFaq = (index: number, key: keyof FaqDraft, value: string) =>
    set(
      'faq',
      draft.faq.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/categories/${active}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heading: draft.heading,
        intro: draft.intro,
        bodyHtml: draft.bodyHtml,
        faq: draft.faq.filter((item) => item.q.trim() && item.a.trim()),
        seoTitle: draft.seoTitle,
        seoDescription: draft.seoDescription,
      }),
    });
    setBusy(false);
    toast.push(
      res.ok ? `Saved — /products/${active} updated.` : 'Could not save this category.',
      res.ok ? 'success' : 'error',
    );
    if (res.ok) router.refresh();
  }

  if (!draft) {
    return <p className="text-sm text-steel-600">No categories available.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Categories</h1>
        <p className="mt-1 text-sm text-steel-600">
          The description and FAQ shown under each product category. Both appear on the public page and feed
          Google&rsquo;s FAQ rich results.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* category picker */}
        <div className="min-w-0">
          <label htmlFor="category-picker" className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-steel-600">
            Category
          </label>
          {/* a select on mobile, a list on desktop — 30 families is too many for tabs */}
          <select
            id="category-picker"
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="h-12 w-full rounded-btn border border-line bg-paper px-3 text-sm lg:hidden"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          <ul className="hidden max-h-[70vh] flex-col gap-0.5 overflow-y-auto rounded-card border border-line bg-paper p-2 lg:flex">
            {categories.map((c) => {
              const filled = Boolean(drafts[c.slug]?.intro || drafts[c.slug]?.bodyHtml || drafts[c.slug]?.faq.length);
              return (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => setActive(c.slug)}
                    className={`flex w-full items-center justify-between gap-2 rounded-btn px-3 py-2 text-left text-sm ${
                      active === c.slug ? 'bg-porcelain font-semibold text-ink-950' : 'text-steel-600 hover:bg-porcelain'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span
                      aria-label={filled ? 'Has content' : 'Empty'}
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${filled ? 'bg-success' : 'bg-line'}`}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* editor */}
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper p-4">
            <div className="min-w-0">
              <p className="font-semibold text-ink-950">{draft.name}</p>
              <p className="font-mono text-[11px] text-steel-400">/products/{draft.slug} · {draft.count} models</p>
            </div>
            <Link
              href={`/products/${draft.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
            >
              View page <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Description</h2>
            <p className="mt-1 text-sm text-steel-600">Shown under the product grid on the category page.</p>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label="Heading"
                value={draft.heading}
                onChange={(e) => set('heading', e.target.value)}
                placeholder={`About ${draft.name.toLowerCase()}`}
              />
              <Textarea
                label="Intro paragraph"
                rows={3}
                value={draft.intro}
                onChange={(e) => set('intro', e.target.value)}
                placeholder="One or two sentences that summarise the range."
              />
              <Textarea
                label="Body (HTML allowed: p, h2, h3, ul, li, strong, a)"
                rows={9}
                value={draft.bodyHtml}
                onChange={(e) => set('bodyHtml', e.target.value)}
                placeholder="<p>Longer description — materials, use cases, customisation…</p>"
                hint="Sanitised on render, so scripts and unsafe markup are stripped automatically."
              />
            </div>
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-950">FAQ</h2>
                <p className="mt-1 text-sm text-steel-600">
                  Emitted as FAQ structured data, so these can appear directly in Google results.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => set('faq', [...draft.faq, { q: '', a: '' }])}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>

            {draft.faq.length ? (
              <ol className="mt-4 flex flex-col gap-4">
                {draft.faq.map((item, i) => (
                  <li key={i} className="rounded-card border border-line bg-porcelain p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="mt-2 font-mono text-[11px] text-steel-400">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div className="flex flex-1 flex-col gap-3">
                        <Input
                          label="Question"
                          value={item.q}
                          onChange={(e) => setFaq(i, 'q', e.target.value)}
                          placeholder="Do you deliver outside NCR?"
                        />
                        <Textarea
                          label="Answer"
                          rows={3}
                          value={item.a}
                          onChange={(e) => setFaq(i, 'a', e.target.value)}
                          placeholder="Yes — pan-India via surface transport."
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove question ${i + 1}`}
                        onClick={() => set('faq', draft.faq.filter((_, index) => index !== i))}
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-steel-600 hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 rounded-card border border-dashed border-line p-6 text-center text-sm text-steel-600">
                No questions yet. Add the ones buyers actually ask about {draft.name.toLowerCase()}.
              </p>
            )}
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">SEO</h2>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label="Meta title"
                value={draft.seoTitle}
                onChange={(e) => set('seoTitle', e.target.value)}
                hint={`${draft.seoTitle.length}/60 — leave blank to use the default`}
              />
              <Textarea
                label="Meta description"
                rows={2}
                value={draft.seoDescription}
                onChange={(e) => set('seoDescription', e.target.value)}
                hint={`${draft.seoDescription.length}/160 — leave blank to use the default`}
              />
            </div>
          </section>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-porcelain/95 py-4 backdrop-blur">
            <Button onClick={save} disabled={busy}>
              {busy ? <HexSpinner /> : null}
              Save {draft.name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
