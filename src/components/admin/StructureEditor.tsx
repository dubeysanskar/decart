'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, EyeOff, FolderTree, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { ImageField } from './ImageField';
import { cn } from '@/lib/utils';

export type SeriesOption = { slug: string; name: string; count: number };

export type CategoryAdmin = {
  slug: string;
  master: string;
  name: string;
  intro: string;
  cover: string;
  series: { slug: string; name: string; count: number }[];
  order: number;
  status: string;
  count: number;
  href: string;
};

export type MasterAdmin = {
  slug: string;
  name: string;
  intro: string;
  cover: string;
  order: number;
  status: string;
  categories: CategoryAdmin[];
  count: number;
  href: string;
};

type Selection = { kind: 'master' | 'category'; slug: string } | null;

type MasterDraft = { name: string; intro: string; cover: string; order: number; status: string };
type CategoryDraft = MasterDraft & { master: string; series: string[] };

/**
 * The browse structure: master categories, the categories inside them, and which catalogue series
 * each category is built from.
 *
 * A category is a view over series, not a place products are filed — so "which products are in
 * Mesh Office Chair" is answered by ticking series here, and one series can sit in several
 * categories at once. The products themselves never move.
 */
export function StructureEditor({
  initialMasters,
  initialSeries,
  writable,
}: {
  initialMasters: MasterAdmin[];
  initialSeries: SeriesOption[];
  writable: boolean;
}) {
  const toast = useToast();
  const [masters, setMasters] = useState(initialMasters);
  const [series, setSeries] = useState(initialSeries);
  const [selection, setSelection] = useState<Selection>(
    initialMasters[0] ? { kind: 'master', slug: initialMasters[0].slug } : null,
  );
  const [busy, setBusy] = useState(false);
  const [seriesQuery, setSeriesQuery] = useState('');
  const [adding, setAdding] = useState<{ kind: 'master' | 'category'; master?: string } | null>(null);
  const [newName, setNewName] = useState('');

  // the first master category is selected on load, so its draft has to exist from the first render
  const first = initialMasters[0];
  const [masterDraft, setMasterDraft] = useState<MasterDraft | null>(
    first ? { name: first.name, intro: first.intro, cover: first.cover, order: first.order, status: first.status } : null,
  );
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);

  const selectedMaster = selection?.kind === 'master' ? masters.find((m) => m.slug === selection.slug) : undefined;
  const selectedCategory =
    selection?.kind === 'category'
      ? masters.flatMap((m) => m.categories).find((c) => c.slug === selection.slug)
      : undefined;

  /** Pick a record: copy it into an editable draft so typing never touches the saved copy. */
  const select = useCallback(
    (next: Selection, source: MasterAdmin[] = masters) => {
      setSelection(next);
      setSeriesQuery('');
      if (next?.kind === 'master') {
        const m = source.find((x) => x.slug === next.slug);
        setMasterDraft(m ? { name: m.name, intro: m.intro, cover: m.cover, order: m.order, status: m.status } : null);
        setCategoryDraft(null);
      } else if (next?.kind === 'category') {
        const c = source.flatMap((x) => x.categories).find((x) => x.slug === next.slug);
        setCategoryDraft(
          c
            ? {
                name: c.name,
                intro: c.intro,
                cover: c.cover,
                order: c.order,
                status: c.status,
                master: c.master,
                series: c.series.map((s) => s.slug),
              }
            : null,
        );
        setMasterDraft(null);
      }
    },
    [masters],
  );

  async function reload(thenSelect?: Selection) {
    const res = await fetch('/api/structure');
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) return;
    const next = json.data.masters as MasterAdmin[];
    setMasters(next);
    setSeries(json.data.series as SeriesOption[]);
    select(thenSelect ?? selection, next);
  }

  async function call(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
    setBusy(true);
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    setBusy(false);
    if (!res.ok) {
      const message = json?.errors ? (Object.values(json.errors)[0] as string) : json?.error;
      toast.push(message ?? 'That did not go through.', 'error');
      return null;
    }
    return json?.data ?? true;
  }

  async function saveSelected() {
    if (selection?.kind === 'master' && masterDraft) {
      const ok = await call(`/api/structure/masters/${selection.slug}`, 'PATCH', masterDraft);
      if (ok) {
        toast.push(`${masterDraft.name} saved.`, 'success');
        await reload();
      }
    } else if (selection?.kind === 'category' && categoryDraft) {
      const ok = await call(`/api/structure/categories/${selection.slug}`, 'PATCH', categoryDraft);
      if (ok) {
        toast.push(`${categoryDraft.name} saved.`, 'success');
        await reload();
      }
    }
  }

  async function createNew() {
    const name = newName.trim();
    if (!name || !adding) return;
    const kind = adding.kind === 'master' ? 'masters' : 'categories';
    const body =
      adding.kind === 'master'
        ? { name, order: masters.length + 1 }
        : {
            name,
            master: adding.master,
            order: (masters.find((m) => m.slug === adding.master)?.categories.length ?? 0) + 1,
          };
    const created = await call(`/api/structure/${kind}`, 'POST', body);
    if (created) {
      toast.push(`${name} added.`, 'success');
      setNewName('');
      setAdding(null);
      await reload({ kind: adding.kind, slug: created.slug });
    }
  }

  async function remove() {
    if (!selection) return;
    const label = selectedMaster?.name ?? selectedCategory?.name ?? 'this';
    const text =
      selection.kind === 'master'
        ? `Delete the master category ${label}?`
        : `Delete the category ${label}? The products stay — they belong to their series.`;
    if (!window.confirm(text)) return;
    const ok = await call(`/api/structure/${selection.kind === 'master' ? 'masters' : 'categories'}/${selection.slug}`, 'DELETE');
    if (ok) {
      toast.push(`${label} deleted.`, 'success');
      const fallback = masters.find((m) => m.slug !== selection.slug);
      await reload(fallback ? { kind: 'master', slug: fallback.slug } : null);
    }
  }

  const totalCategories = masters.reduce((sum, m) => sum + m.categories.length, 0);
  const emptyCategories = masters.reduce((sum, m) => sum + m.categories.filter((c) => c.series.length === 0).length, 0);

  const visibleSeries = useMemo(() => {
    const q = seriesQuery.trim().toLowerCase();
    return series.filter((s) => !q || s.name.toLowerCase().includes(q) || s.slug.includes(q));
  }, [series, seriesQuery]);

  const toggleSeries = (slug: string) =>
    setCategoryDraft((d) =>
      d ? { ...d, series: d.series.includes(slug) ? d.series.filter((s) => s !== slug) : [...d.series, slug] } : d,
    );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl text-ink-950">Categories</h1>
        <p className="mt-1 max-w-3xl text-sm text-steel-600">
          The browse structure: master categories, the categories inside them, and which product series each category
          is built from. {masters.length} master categories · {totalCategories} categories
          {emptyCategories ? ` · ${emptyCategories} with no series yet (they show a made-to-order page)` : ''}.
        </p>
      </div>

      {!writable ? (
        <p className="rounded-card border border-warning/30 bg-warning/5 p-4 text-sm text-steel-600">
          No database is configured, so this shows the built-in structure read-only.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ------------------------------------------------------------------ the tree */}
        <div className="min-w-0">
          {adding ? (
            <div className="mb-3 rounded-card border border-decart-300 bg-paper p-3">
              <Input
                label={adding.kind === 'master' ? 'New master category' : 'New category'}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={adding.kind === 'master' ? 'Hotel Furniture' : 'Mesh Office Chair'}
                hint="Its web address is made from the name."
                autoFocus
              />
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={createNew} disabled={busy || !newName.trim()}>
                  {busy ? <HexSpinner /> : null}
                  Add
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setAdding(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              className="mb-3 w-full"
              disabled={!writable}
              onClick={() => setAdding({ kind: 'master' })}
            >
              <Plus className="h-4 w-4" />
              New master category
            </Button>
          )}

          <ul className="max-h-[72vh] overflow-y-auto rounded-card border border-line bg-paper p-2">
            {masters.map((master) => {
              const masterActive = selection?.kind === 'master' && selection.slug === master.slug;
              return (
                <li key={master.slug} className="mb-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => select({ kind: 'master', slug: master.slug })}
                      className={cn(
                        'flex min-w-0 flex-1 items-center gap-2 rounded-btn px-3 py-2 text-left text-sm font-semibold',
                        masterActive ? 'bg-ink-900 text-porcelain' : 'text-ink-950 hover:bg-porcelain',
                      )}
                    >
                      <FolderTree aria-hidden className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{master.name}</span>
                      {master.status === 'hidden' ? <EyeOff aria-label="Hidden" className="h-3 w-3 shrink-0 opacity-70" /> : null}
                      <span className={cn('ml-auto font-mono text-[10px]', masterActive ? 'text-steel-400' : 'text-steel-400')}>
                        {master.categories.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Add a category to ${master.name}`}
                      title="Add a category"
                      disabled={!writable}
                      onClick={() => setAdding({ kind: 'category', master: master.slug })}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <ul className="ml-4 mt-0.5 border-l border-line pl-2">
                    {master.categories.length === 0 ? (
                      <li className="px-3 py-1.5 text-xs text-steel-400">No categories yet — hidden from the site</li>
                    ) : null}
                    {master.categories.map((category) => {
                      const active = selection?.kind === 'category' && selection.slug === category.slug;
                      return (
                        <li key={category.slug}>
                          <button
                            type="button"
                            onClick={() => select({ kind: 'category', slug: category.slug })}
                            className={cn(
                              'flex w-full items-center gap-2 rounded-btn px-3 py-1.5 text-left text-sm',
                              active ? 'bg-porcelain font-semibold text-ink-950' : 'text-steel-600 hover:bg-porcelain',
                            )}
                          >
                            <span className="truncate">{category.name}</span>
                            {category.status === 'hidden' ? <EyeOff aria-label="Hidden" className="h-3 w-3 shrink-0 text-steel-400" /> : null}
                            <span
                              aria-label={category.series.length ? `${category.count} models` : 'No series'}
                              className={cn(
                                'ml-auto h-1.5 w-1.5 shrink-0 rounded-full',
                                category.series.length ? 'bg-success' : 'bg-line',
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ---------------------------------------------------------------- the editor */}
        <div className="flex min-w-0 flex-col gap-5">
          {selection?.kind === 'master' && masterDraft && selectedMaster ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950">{selectedMaster.name}</p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {selectedMaster.href} · {selectedMaster.categories.length} categories · {selectedMaster.count} models
                  </p>
                </div>
                <Link
                  href={selectedMaster.href}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
                >
                  View page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <section className="rounded-card border border-line bg-paper p-5">
                <h2 className="text-lg font-semibold text-ink-950">Master category</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="Name" value={masterDraft.name} onChange={(e) => setMasterDraft({ ...masterDraft, name: e.target.value })} />
                  <Input
                    label="Order"
                    type="number"
                    value={String(masterDraft.order)}
                    onChange={(e) => setMasterDraft({ ...masterDraft, order: Number(e.target.value) })}
                    hint="Lower comes first."
                  />
                  <Select label="Status" value={masterDraft.status} onChange={(e) => setMasterDraft({ ...masterDraft, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </Select>
                </div>
                <Textarea
                  label="Intro (optional)"
                  rows={3}
                  wrapperClassName="mt-4"
                  value={masterDraft.intro}
                  onChange={(e) => setMasterDraft({ ...masterDraft, intro: e.target.value })}
                  placeholder="One or two sentences shown at the top of the master category's page."
                />
                <div className="mt-4">
                  <ImageField
                    label="Picture"
                    value={masterDraft.cover}
                    onChange={(src) => setMasterDraft({ ...masterDraft, cover: src })}
                    hint="Leave empty to use the best picture from the categories inside."
                  />
                </div>
              </section>
            </>
          ) : null}

          {selection?.kind === 'category' && categoryDraft && selectedCategory ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-paper p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950">{selectedCategory.name}</p>
                  <p className="font-mono text-[11px] text-steel-400">
                    {selectedCategory.href} · {selectedCategory.count} models
                  </p>
                </div>
                <Link
                  href={selectedCategory.href}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
                >
                  View page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <section className="rounded-card border border-line bg-paper p-5">
                <h2 className="text-lg font-semibold text-ink-950">Category</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <Input label="Name" value={categoryDraft.name} onChange={(e) => setCategoryDraft({ ...categoryDraft, name: e.target.value })} />
                  <Select
                    label="Master category"
                    value={categoryDraft.master}
                    onChange={(e) => setCategoryDraft({ ...categoryDraft, master: e.target.value })}
                  >
                    {masters.map((m) => (
                      <option key={m.slug} value={m.slug}>
                        {m.name}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Order"
                    type="number"
                    value={String(categoryDraft.order)}
                    onChange={(e) => setCategoryDraft({ ...categoryDraft, order: Number(e.target.value) })}
                    hint="Lower comes first, within its master category."
                  />
                  <Select label="Status" value={categoryDraft.status} onChange={(e) => setCategoryDraft({ ...categoryDraft, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="hidden">Hidden</option>
                  </Select>
                </div>
                <Textarea
                  label="Intro (optional)"
                  rows={3}
                  wrapperClassName="mt-4"
                  value={categoryDraft.intro}
                  onChange={(e) => setCategoryDraft({ ...categoryDraft, intro: e.target.value })}
                  placeholder="Shown at the top of the category page. Empty uses a standard line."
                />
                <div className="mt-4">
                  <ImageField
                    label="Picture"
                    value={categoryDraft.cover}
                    onChange={(src) => setCategoryDraft({ ...categoryDraft, cover: src })}
                    hint="Leave empty to use the best picture from the series below."
                  />
                </div>
              </section>

              <section className="rounded-card border border-line bg-paper p-5">
                <h2 className="text-lg font-semibold text-ink-950">Series in this category</h2>
                <p className="mt-1 text-sm text-steel-600">
                  The products shown here are every model of the ticked series. A series can be ticked in several
                  categories — Mesh Chairs sits in both Office Chair and Mesh Office Chair — and the products are never
                  moved or duplicated.
                </p>

                {categoryDraft.series.length === 0 ? (
                  <p className="mt-3 rounded-btn border border-line bg-porcelain px-3 py-2 text-xs text-steel-600">
                    No series ticked: this category shows a &ldquo;made to order&rdquo; page and is left out of the sitemap.
                  </p>
                ) : null}

                <Input
                  label="Find a series"
                  value={seriesQuery}
                  onChange={(e) => setSeriesQuery(e.target.value)}
                  placeholder="Mesh, director, café…"
                  wrapperClassName="mt-4"
                />

                <div className="mt-2 max-h-72 overflow-y-auto rounded-btn border border-line">
                  {visibleSeries.map((s) => {
                    const on = categoryDraft.series.includes(s.slug);
                    return (
                      <label
                        key={s.slug}
                        className={cn(
                          'flex cursor-pointer items-center justify-between gap-3 border-b border-line px-3 py-2 last:border-0 hover:bg-porcelain',
                          on && 'bg-decart-50',
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <input type="checkbox" checked={on} onChange={() => toggleSeries(s.slug)} className="h-4 w-4 accent-decart-600" />
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-ink-950">{s.name}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">{s.slug}</span>
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-steel-400">{s.count} models</span>
                      </label>
                    );
                  })}
                  {visibleSeries.length === 0 ? <p className="px-3 py-4 text-sm text-steel-600">No series match that.</p> : null}
                </div>
              </section>
            </>
          ) : null}

          {selection && (masterDraft || categoryDraft) ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={remove}
                disabled={busy || !writable}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-danger hover:underline disabled:opacity-40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selection.kind === 'master' ? 'master category' : 'category'}
              </button>
              <Button onClick={saveSelected} disabled={busy || !writable}>
                {busy ? <HexSpinner /> : null}
                Save changes
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
