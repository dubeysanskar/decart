'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, ExternalLink, Layers, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { ImageField } from './ImageField';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';

export type FaqDraft = { q: string; a: string };
export type CategoryDraft = {
  slug: string;
  name: string;
  count: number;
  /** Which nav group it sits in: seating, tables-desks, furniture. */
  groupSlug: string;
  /** The category's own artwork. Beats a product shot and the shipped /families art. */
  cover: string;
  order: number;
  status: string;
  /** False for a category the client added, which can therefore be deleted outright. */
  fromCatalogue: boolean;
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
/** The pseudo-category that writes to every family at once. */
const ALL = '__all__';

/** The three shelves the nav is built from. */
const GROUP_OPTIONS = [
  { value: 'seating', label: 'Office Seating' },
  { value: 'tables-desks', label: 'Tables & Desks' },
  { value: 'furniture', label: 'Furniture & Institutional' },
];

type BulkPayload = Partial<Pick<CategoryDraft, 'heading' | 'intro' | 'bodyHtml' | 'faq' | 'seoTitle' | 'seoDescription'>>;

export function CategoryEditor({ categories }: { categories: CategoryDraft[] }) {
  const router = useRouter();
  const toast = useToast();
  const [active, setActive] = useState(categories[0]?.slug ?? '');
  const [drafts, setDrafts] = useState<Record<string, CategoryDraft>>(
    Object.fromEntries(categories.map((c) => [c.slug, c])),
  );
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const totalModels = categories.reduce((sum, c) => sum + c.count, 0);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [bulk, setBulk] = useState<CategoryDraft>({
    slug: ALL,
    name: 'All categories',
    count: totalModels,
    groupSlug: '',
    cover: '',
    order: 0,
    status: 'published',
    fromCatalogue: true,
    heading: '',
    intro: '',
    bodyHtml: '',
    faq: [],
    seoTitle: '',
    seoDescription: '',
  });

  const isAll = active === ALL;
  const draft = isAll ? bulk : drafts[active];

  const set = <K extends keyof CategoryDraft>(key: K, value: CategoryDraft[K]) =>
    isAll
      ? setBulk((b) => ({ ...b, [key]: value }))
      : setDrafts((all) => ({ ...all, [active]: { ...all[active], [key]: value } }));

  const setFaq = (index: number, key: keyof FaqDraft, value: string) =>
    set(
      'faq',
      draft.faq.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );

  /**
   * Writes only the fields that were actually filled in, so a blank box means "leave every
   * category's own value alone" rather than wiping thirty descriptions at once.
   */
  async function saveAll() {
    const faq = bulk.faq.filter((item) => item.q.trim() && item.a.trim());
    const payload: BulkPayload = {};
    if (bulk.heading.trim()) payload.heading = bulk.heading;
    if (bulk.intro.trim()) payload.intro = bulk.intro;
    if (bulk.bodyHtml.trim()) payload.bodyHtml = bulk.bodyHtml;
    if (bulk.seoTitle.trim()) payload.seoTitle = bulk.seoTitle;
    if (bulk.seoDescription.trim()) payload.seoDescription = bulk.seoDescription;
    if (faq.length) payload.faq = faq;

    const fields = Object.keys(payload);
    if (!fields.length) {
      toast.push('Nothing to apply — fill at least one field first.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Apply ${fields.join(', ')} to all ${categories.length} categories?

` +
        'This replaces those fields on every category. Anything you left blank stays as it is.',
    );
    if (!confirmed) return;

    setBusy(true);
    const queue = [...categories];
    const failed: string[] = [];
    let done = 0;

    // four at a time — thirty parallel writes would hammer the DB and the revalidation queue
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        for (let next = queue.shift(); next; next = queue.shift()) {
          const category = next;
          const res = await fetch(`/api/categories/${category.slug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }).catch(() => null);

          if (res?.ok) {
            done += 1;
            setDrafts((all) => ({ ...all, [category.slug]: { ...all[category.slug], ...payload } }));
          } else {
            failed.push(category.name);
          }
          setProgress(`${done + failed.length} of ${categories.length}`);
        }
      }),
    );

    setBusy(false);
    setProgress('');
    toast.push(
      failed.length
        ? `Applied to ${done} of ${categories.length}. Failed: ${failed.slice(0, 3).join(', ')}${failed.length > 3 ? '…' : ''}`
        : `Applied ${fields.join(', ')} to all ${done} categories.`,
      failed.length ? 'error' : 'success',
    );
    if (done) router.refresh();
  }

  async function save() {
    if (isAll) return saveAll();
    setBusy(true);
    const res = await fetch(`/api/categories/${active}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        groupSlug: draft.groupSlug,
        cover: draft.cover,
        order: draft.order,
        status: draft.status,
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

  /** Adds a category the catalogue does not ship with — the client's list has three. */
  async function createCategory() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, order: categories.length + 1, status: 'published' }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      toast.push(json?.errors ? (Object.values(json.errors)[0] as string) : 'Could not add that category.', 'error');
      return;
    }
    toast.push(`${name} added.`, 'success');
    setNewName('');
    setAdding(false);
    router.refresh();
  }

  async function removeCategory() {
    if (isAll || draft.fromCatalogue) return;
    if (!window.confirm(`Delete ${draft.name}? Its page and its description go with it.`)) return;
    setBusy(true);
    const res = await fetch(`/api/categories/${active}`, { method: 'DELETE' });
    setBusy(false);
    if (!res.ok) {
      toast.push('Could not delete that category.', 'error');
      return;
    }
    toast.push(`${draft.name} deleted.`, 'success');
    setActive(categories[0]?.slug ?? ALL);
    router.refresh();
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
            <option value={ALL}>All categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>

          <div className="mb-2 hidden lg:block">
            {adding ? (
              <div className="rounded-card border border-decart-300 bg-paper p-3">
                <Input
                  label="New category"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Metal Storages"
                  hint="Its web address is made from the name."
                />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={createCategory} disabled={busy || !newName.trim()}>
                    {busy ? <HexSpinner /> : null}
                    Add
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4" />
                New category
              </Button>
            )}
          </div>

          <ul className="hidden max-h-[70vh] flex-col gap-0.5 overflow-y-auto rounded-card border border-line bg-paper p-2 lg:flex">
            {/* write once, apply to every family — pinned above the list so it is never lost in
                a scroll of thirty */}
            <li className="mb-1 border-b border-line pb-1">
              <button
                type="button"
                onClick={() => setActive(ALL)}
                className={`flex w-full items-center gap-2 rounded-btn px-3 py-2 text-left text-sm ${
                  isAll ? 'bg-ink-900 font-semibold text-porcelain' : 'text-steel-600 hover:bg-porcelain'
                }`}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">All categories</span>
                <span className={`ml-auto font-mono text-[10px] ${isAll ? 'text-steel-400' : 'text-steel-400'}`}>
                  {categories.length}
                </span>
              </button>
            </li>
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
                    <span className="truncate">
                      {c.name}
                      {drafts[c.slug]?.status === 'hidden' ? (
                        <span className="ml-1.5 font-mono text-[9px] uppercase text-steel-400">hidden</span>
                      ) : null}
                    </span>
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
              <p className="font-mono text-[11px] text-steel-400">
                {isAll
                  ? `${categories.length} categories · ${totalModels} models`
                  : `/products/${draft.slug} · ${draft.count} models`}
              </p>
            </div>
            {isAll ? null : (
              <Link
                href={`/products/${draft.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
              >
                View page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {isAll ? (
            <div className="flex gap-3 rounded-card border border-warning/30 bg-warning/5 p-4">
              <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div className="text-sm text-steel-600">
                <p className="font-semibold text-ink-950">Writing to all {categories.length} categories</p>
                <p className="mt-1">
                  Whatever you fill in below replaces that field on every category. <strong>Leave a box
                  blank and it is left alone</strong> — so you can push one FAQ everywhere without
                  touching the individual descriptions.
                </p>
              </div>
            </div>
          ) : null}

          {/*
            The category itself, not just its copy: what it is called, where it sits, the picture
            it shows on the home rail and the /products directory, and whether it appears at all.
            Hidden on the bulk screen, where these are per-category by definition.
          */}
          {isAll ? null : (
            <section className="rounded-card border border-line bg-paper p-5">
              <h2 className="text-lg font-semibold text-ink-950">The category</h2>
              <p className="mt-1 text-sm text-steel-600">
                Its name, its place in the menu and the picture that represents it.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input label="Name" value={draft.name} onChange={(e) => set('name', e.target.value)} />
                <Select
                  label="Menu group"
                  value={draft.groupSlug || 'seating'}
                  onChange={(e) => set('groupSlug', e.target.value)}
                >
                  {GROUP_OPTIONS.map((group) => (
                    <option key={group.value} value={group.value}>
                      {group.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Order"
                  type="number"
                  value={String(draft.order)}
                  onChange={(e) => set('order', Number(e.target.value))}
                  hint="Lower comes first. 0 sends it to the end."
                />
                <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                </Select>
              </div>

              <div className="mt-4">
                <ImageField
                  label="Category image"
                  value={draft.cover}
                  onChange={(src) => set('cover', src)}
                  hint="Shown on the home rail and the catalogue directory. Beats the studio shot the site picks by itself."
                />
              </div>

              {draft.fromCatalogue ? (
                <p className="mt-4 text-xs text-steel-600">
                  This category comes with the catalogue, so it cannot be deleted — set it to Hidden to take it off
                  the site without stranding the models filed under it.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={removeCategory}
                  disabled={busy}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete this category
                </button>
              )}
            </section>
          )}

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Description</h2>
            <p className="mt-1 text-sm text-steel-600">Shown under the product grid on the category page.</p>
            <div className="mt-4 flex flex-col gap-4">
              <Input
                label="Heading"
                value={draft.heading}
                onChange={(e) => set('heading', e.target.value)}
                placeholder={isAll ? 'Applied to every category' : `About ${draft.name.toLowerCase()}`}
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
                No questions yet. Add the ones buyers actually ask about {isAll ? 'every range' : draft.name.toLowerCase()}.
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
            {busy && progress ? (
              <span className="self-center font-mono text-xs text-steel-600">{progress}</span>
            ) : null}
            <Button onClick={save} disabled={busy}>
              {busy ? <HexSpinner /> : null}
              {isAll ? `Apply to all ${categories.length} categories` : `Save ${draft.name}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
