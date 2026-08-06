'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowLeft, Trash2, Plus, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { SPEC_PROFILES, type SpecProfile } from '@/data/specs';
import { slugify, truncate, cn } from '@/lib/utils';

export type ProductDraft = {
  code: string;
  name: string;
  slug: string;
  family: string;
  group: 'seating' | 'tables-desks' | 'furniture';
  tags: string[];
  summary: string;
  description: string;
  specs: { label: string; value: string }[];
  buildOptions: boolean;
  sizeMm: string;
  finishNote: string;
  images: { src: string; alt: string }[];
  cataloguePage?: number;
  price: { amount: number; show: boolean };
  moq: number;
  featured: boolean;
  bestSeller: boolean;
  status: 'draft' | 'published' | 'archived';
  needsPhoto: boolean;
  needsReview: boolean;
  order: number;
  seo: { title: string; description: string };
};

const TABS = ['Basics', 'Media', 'Specs', 'SEO', 'Publish'] as const;
type Tab = (typeof TABS)[number];

const TAG_OPTIONS = [
  'executive', 'office', 'mesh', 'ergonomic', 'visitor', 'conference', 'gaming', 'training',
  'cafe', 'director', 'workstation', 'task', 'leather', 'lounge', 'desk', 'storage', 'institutional', 'imported', 'reception',
];

export function ProductEditor({
  initial,
  families,
  isNew,
}: {
  initial: ProductDraft;
  families: { slug: string; name: string; group: string; spec: SpecProfile }[];
  isNew: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('Basics');
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    setBusy(true);
    setErrors({});

    const payload = { ...draft, needsPhoto: draft.images.length === 0 };
    const res = await fetch(isNew ? '/api/products' : `/api/products/${initial.slug}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrors(json.errors ?? { form: json.error ?? 'Could not save.' });
      toast.push('Could not save — check the highlighted fields.', 'error');
      return;
    }
    toast.push('Saved and published to the site.');
    if (isNew) router.push(`/admin/products/${draft.slug}`);
    else router.refresh();
  }

  async function upload(file: File) {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'products');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.push(json.error ?? 'Upload failed.', 'error');
      return;
    }
    set('images', [...draft.images, { src: json.data.src, alt: `${draft.name} (${draft.code})` }]);
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const next = [...draft.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set('images', next);
  };

  const family = families.find((f) => f.slug === draft.family);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> All products
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">{isNew ? 'New product' : draft.name}</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
            {draft.code || 'no code'} · {draft.family || 'no family'}
          </p>
        </div>
        <div className="flex gap-2">
          {!isNew ? (
            <Link
              href={`/products/${draft.family}/${draft.slug}`}
              target="_blank"
              className="inline-flex h-11 items-center rounded-btn border border-line bg-paper px-4 text-sm font-semibold"
            >
              View live
            </Link>
          ) : null}
          <Button onClick={save} disabled={busy}>
            {busy ? <HexSpinner /> : null} Save
          </Button>
        </div>
      </div>

      {errors.form ? (
        <p className="rounded-btn border border-danger/30 bg-danger/5 p-3 text-sm text-ink-900">{errors.form}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-b border-line">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium',
              tab === item ? 'border-ink-900 text-ink-950' : 'border-transparent text-steel-600 hover:text-ink-900',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-line bg-paper p-5">
        {tab === 'Basics' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              required
              value={draft.name}
              error={errors.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (isNew && !draft.slug) set('slug', slugify(e.target.value));
              }}
            />
            <Input
              label="Code"
              required
              value={draft.code}
              error={errors.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
            />
            <Input
              label="Slug"
              required
              value={draft.slug}
              error={errors.slug}
              hint={`/products/${draft.family}/${draft.slug}`}
              onChange={(e) => set('slug', slugify(e.target.value))}
            />
            <Select
              label="Family"
              value={draft.family}
              onChange={(e) => {
                const next = families.find((f) => f.slug === e.target.value);
                set('family', e.target.value);
                if (next) set('group', next.group as ProductDraft['group']);
              }}
            >
              <option value="">Select a family</option>
              {families.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </Select>

            <Input label="Summary" value={draft.summary} onChange={(e) => set('summary', e.target.value)} hint="One line for cards" />
            <Input
              label="Catalogue page"
              type="number"
              value={draft.cataloguePage ?? ''}
              onChange={(e) => set('cataloguePage', e.target.value ? Number(e.target.value) : undefined)}
            />

            <Textarea
              label="Description"
              rows={7}
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              wrapperClassName="md:col-span-2"
              hint="Blank line between paragraphs"
            />

            <div className="md:col-span-2">
              <p className="mb-2 text-sm font-medium text-ink-900">Tags</p>
              <div className="flex flex-wrap gap-2">
                {TAG_OPTIONS.map((tag) => {
                  const on = draft.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        set('tags', on ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag])
                      }
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs capitalize',
                        on ? 'border-ink-900 bg-ink-900 text-porcelain' : 'border-line text-steel-600',
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <Input label="MOQ" type="number" value={draft.moq} onChange={(e) => set('moq', Number(e.target.value))} />
            <div className="grid grid-cols-[1fr_auto] items-end gap-3">
              <Input
                label="Price (₹)"
                type="number"
                value={draft.price.amount}
                onChange={(e) => set('price', { ...draft.price, amount: Number(e.target.value) })}
              />
              <label className="flex h-12 items-center gap-2 rounded-btn border border-line px-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.price.show}
                  onChange={(e) => set('price', { ...draft.price, show: e.target.checked })}
                />
                Show
              </label>
            </div>
          </div>
        ) : null}

        {tab === 'Media' ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-btn border border-line px-4 text-sm font-semibold">
                <Upload className="h-4 w-4" />
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
                />
              </label>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => set('images', [...draft.images, { src: '', alt: '' }])}
              >
                <Plus className="h-4 w-4" /> Add a /public path
              </Button>
              <p className="text-xs text-steel-600">First image is the hero.</p>
            </div>

            {draft.images.length ? (
              <ul className="flex flex-col gap-3">
                {draft.images.map((image, index) => (
                  <li key={index} className="flex flex-wrap items-start gap-3 rounded-card border border-line p-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-porcelain">
                      {image.src ? (
                        <Image src={image.src} alt="" fill sizes="64px" className="object-contain p-1" />
                      ) : null}
                    </div>
                    <div className="min-w-[220px] flex-1 space-y-2">
                      <Input
                        aria-label="Image path"
                        value={image.src}
                        placeholder="/products/family/slug/black-1.webp"
                        onChange={(e) => {
                          const next = [...draft.images];
                          next[index] = { ...next[index], src: e.target.value };
                          set('images', next);
                        }}
                      />
                      <Input
                        aria-label="Alt text"
                        value={image.alt}
                        placeholder="Alt text"
                        onChange={(e) => {
                          const next = [...draft.images];
                          next[index] = { ...next[index], alt: e.target.value };
                          set('images', next);
                        }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => moveImage(index, -1)} aria-label="Move up">
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => moveImage(index, 1)} aria-label="Move down">
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remove image"
                        onClick={() => set('images', draft.images.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-card border border-dashed border-line p-6 text-center text-sm text-steel-600">
                No images yet — the site will show the branded placeholder.
              </p>
            )}
          </div>
        ) : null}

        {tab === 'Specs' ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => family && set('specs', SPEC_PROFILES[family.spec])}
                disabled={!family}
              >
                Load {family ? family.name : 'family'} profile
              </Button>
              <Button variant="ghost" size="sm" onClick={() => set('specs', [...draft.specs, { label: '', value: '' }])}>
                <Plus className="h-4 w-4" /> Add row
              </Button>
            </div>

            <ul className="flex flex-col gap-2">
              {draft.specs.map((spec, index) => (
                <li key={index} className="grid grid-cols-[minmax(120px,1fr)_2fr_auto] gap-2">
                  <Input
                    aria-label="Spec label"
                    value={spec.label}
                    onChange={(e) => {
                      const next = [...draft.specs];
                      next[index] = { ...next[index], label: e.target.value };
                      set('specs', next);
                    }}
                  />
                  <Input
                    aria-label="Spec value"
                    value={spec.value}
                    onChange={(e) => {
                      const next = [...draft.specs];
                      next[index] = { ...next[index], value: e.target.value };
                      set('specs', next);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove row"
                    onClick={() => set('specs', draft.specs.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </li>
              ))}
            </ul>

            <div className="grid gap-4 border-t border-line pt-4 md:grid-cols-2">
              <label className="flex h-12 items-center gap-2 rounded-btn border border-line px-3 text-sm">
                <input
                  type="checkbox"
                  checked={draft.buildOptions}
                  onChange={(e) => set('buildOptions', e.target.checked)}
                />
                Show build options accordion
              </label>
              <Input label="Size (W×D×H mm)" value={draft.sizeMm} onChange={(e) => set('sizeMm', e.target.value)} />
              <Textarea
                label="Finish note"
                rows={2}
                value={draft.finishNote}
                onChange={(e) => set('finishNote', e.target.value)}
                wrapperClassName="md:col-span-2"
              />
            </div>
          </div>
        ) : null}

        {tab === 'SEO' ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Meta title"
              value={draft.seo.title}
              onChange={(e) => set('seo', { ...draft.seo, title: e.target.value })}
              hint={`${draft.seo.title.length}/60 characters`}
            />
            <Textarea
              label="Meta description"
              rows={3}
              value={draft.seo.description}
              onChange={(e) => set('seo', { ...draft.seo, description: e.target.value })}
              hint={`${draft.seo.description.length}/160 characters`}
            />
            <div className="rounded-card border border-line bg-porcelain p-4">
              <p className="text-xs uppercase tracking-[0.1em] text-steel-600">Search preview</p>
              <p className="mt-2 text-[#1a0dab]">{truncate(draft.seo.title || draft.name, 60)}</p>
              <p className="text-xs text-success">decartseatings.in › products › {draft.family} › {draft.slug}</p>
              <p className="mt-1 text-sm text-steel-600">
                {truncate(draft.seo.description || draft.summary, 160)}
              </p>
            </div>
          </div>
        ) : null}

        {tab === 'Publish' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Status"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as ProductDraft['status'])}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
            <Input label="Order" type="number" value={draft.order} onChange={(e) => set('order', Number(e.target.value))} />
            <label className="flex h-12 items-center gap-2 rounded-btn border border-line px-3 text-sm">
              <input type="checkbox" checked={draft.featured} onChange={(e) => set('featured', e.target.checked)} />
              Featured
            </label>
            <label className="flex h-12 items-center gap-2 rounded-btn border border-line px-3 text-sm">
              <input type="checkbox" checked={draft.bestSeller} onChange={(e) => set('bestSeller', e.target.checked)} />
              Best seller
            </label>
            <label className="flex h-12 items-center gap-2 rounded-btn border border-line px-3 text-sm md:col-span-2">
              <input type="checkbox" checked={draft.needsReview} onChange={(e) => set('needsReview', e.target.checked)} />
              Flag for content review (catalogue erratum, unverified spec)
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
