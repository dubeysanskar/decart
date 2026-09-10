'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/form';
import { ImageField } from './ImageField';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { cn } from '@/lib/utils';

export type BannerRow = {
  _id: string;
  page: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  models: string[];
  status: string;
  order: number;
};

/**
 * Which page's hero a row drives. Home is the campaign slider; the rest override that page's
 * opener — eyebrow, headline and lede — so changing a headline no longer needs a deploy.
 */
const PAGES = [
  { value: 'home', label: 'Home - hero slider' },
  { value: 'products', label: 'Products' },
  { value: 'projects', label: 'Projects' },
  { value: 'blog', label: 'Blog' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' },
  { value: 'quote', label: 'Get a quote' },
] as const;

type PickerProduct = { slug: string; name: string; code: string; family: string; hasPhoto: boolean };

const EMPTY: Omit<BannerRow, '_id'> = {
  page: 'home',
  eyebrow: '',
  title: '',
  subtitle: '',
  image: '',
  imageAlt: '',
  href: '',
  ctaLabel: '',
  models: [],
  status: 'published',
  order: 0,
};

/** Home-page banner artwork: the client swaps these for offers and seasons. */
export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Omit<BannerRow, '_id'>>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [catalogue, setCatalogue] = useState<PickerProduct[]>([]);
  const [modelQuery, setModelQuery] = useState('');

  // the catalogue is only needed once an editor is open, and only once per visit
  useEffect(() => {
    if (!editing || catalogue.length) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch('/api/products?perPage=600');
        const json = await res.json().catch(() => null);
        const rows = (json?.data?.rows ?? json?.data ?? []) as Record<string, unknown>[];
        if (!live) return;
        setCatalogue(
          rows.map((row) => ({
            slug: String(row.slug ?? ''),
            name: String(row.name ?? ''),
            code: String(row.code ?? ''),
            family: String(row.family ?? ''),
            hasPhoto: Array.isArray(row.images) && row.images.length > 0,
          })),
        );
      } catch {
        /* the field still accepts slugs typed by hand */
      }
    })();
    return () => {
      live = false;
    };
  }, [editing, catalogue.length]);

  /** Photographed models first: those are the only ones the hero stage can show. */
  const modelOptions = useMemo(() => {
    const q = modelQuery.trim().toLowerCase();
    return catalogue
      .filter((product) => product.hasPhoto)
      .filter((product) => !q || `${product.name} ${product.code} ${product.family}`.toLowerCase().includes(q))
      .slice(0, 24);
  }, [catalogue, modelQuery]);

  const toggleModel = (slug: string) =>
    setDraft((d) => ({
      ...d,
      models: d.models.includes(slug) ? d.models.filter((s) => s !== slug) : [...d.models, slug].slice(0, 6),
    }));

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function openNew() {
    setDraft({ ...EMPTY, order: banners.length });
    setEditing('new');
  }

  function openEdit(banner: BannerRow) {
    const { _id, ...rest } = banner;
    setDraft({ ...rest, models: rest.models ?? [] });
    setEditing(banner._id);
  }

  async function save() {
    if (!draft.image.trim()) {
      toast.push('Add an image before saving.', 'error');
      return;
    }
    setBusy(true);
    const isNew = editing === 'new';
    const res = await fetch(isNew ? '/api/banners' : `/api/banners/${editing}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (res.ok) {
      toast.push(isNew ? 'Banner added.' : 'Banner updated.', 'success');
      setEditing(null);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.push(json?.errors ? Object.values(json.errors)[0] as string : 'Could not save the banner.', 'error');
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
    setBusy(false);
    toast.push(res.ok ? 'Banner deleted.' : 'Could not delete that banner.', res.ok ? 'success' : 'error');
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Banners</h1>
          <p className="mt-1 text-sm text-steel-600">
            Hero content for every page — headline, artwork and the models on the stage.{' '}
            {banners.length} in total.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      {editing ? (
        <section className="rounded-card border border-decart-300 bg-paper p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-950">
              {editing === 'new' ? 'New banner' : 'Edit banner'}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close editor"
              className="flex h-9 w-9 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <ImageField
              label="Banner image"
              value={draft.image}
              onChange={(src) => set('image', src)}
              hint="Wide artwork works best — around 1600×600."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Select label="Page" value={draft.page} onChange={(e) => set('page', e.target.value)}>
                {PAGES.map((page) => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))}
              </Select>
              <Input
                label="Eyebrow"
                value={draft.eyebrow}
                onChange={(e) => set('eyebrow', e.target.value)}
                placeholder="Catalogue"
                hint="The small line above the headline."
              />
              <Input
                label="Title"
                value={draft.title}
                onChange={(e) => set('title', e.target.value)}
                hint="Becomes the hero headline. Put a | where you want the second line to start — it picks up the accent colour."
              />
              <Input
                label="Image alt text"
                value={draft.imageAlt}
                onChange={(e) => set('imageAlt', e.target.value)}
                hint="Describe the picture for screen readers."
              />
              <Input label="Subtitle" value={draft.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
              <Input
                label="Link"
                value={draft.href}
                onChange={(e) => set('href', e.target.value)}
                placeholder="/products/mesh"
              />
              <Input
                label="Button label"
                value={draft.ctaLabel}
                onChange={(e) => set('ctaLabel', e.target.value)}
                placeholder="Shop the range"
              />
              <Input
                label="Order"
                type="number"
                value={String(draft.order)}
                onChange={(e) => set('order', Number(e.target.value))}
              />
              <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft (hidden)</option>
              </Select>
            </div>

            {/*
              Which models stand on the hero stage with this slide. Only photographed models are
              offered — the stage has nothing to show for the rest, and a slide reading "cafe
              chairs" over a row of mesh task chairs is exactly what this fixes.
            */}
            {draft.page === 'home' ? (
              <div className="rounded-card border border-line p-4">
                <p className="text-sm font-medium text-ink-900">Models on the stage</p>
                <p className="mt-1 text-xs leading-relaxed text-steel-600">
                  Up to six, staged in the order you pick them. Leave it empty and the slide stages models from the
                  family its link points at — or its own photograph, if nothing in that family is shot yet.
                </p>

                {draft.models.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {draft.models.map((slug) => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => toggleModel(slug)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-decart-300 bg-decart-50 px-2.5 py-1 font-mono text-[11px] text-decart-700 hover:border-danger hover:text-danger"
                      >
                        {catalogue.find((product) => product.slug === slug)?.code ?? slug}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <Input
                  label="Find a model"
                  value={modelQuery}
                  onChange={(e) => setModelQuery(e.target.value)}
                  placeholder="Mustang, DS-701, mesh"
                  wrapperClassName="mt-3"
                />

                <div className="mt-2 max-h-56 overflow-y-auto rounded-btn border border-line">
                  {modelOptions.length ? (
                    modelOptions.map((product) => {
                      const picked = draft.models.includes(product.slug);
                      return (
                        <button
                          key={product.slug}
                          type="button"
                          onClick={() => toggleModel(product.slug)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 border-b border-line px-3 py-2 text-left last:border-0 hover:bg-porcelain',
                            picked && 'bg-decart-50',
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-ink-950">{product.name}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">
                              {product.code} · {product.family}
                            </span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold text-decart-700">
                            {picked ? 'Remove' : 'Add'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-3 py-4 text-sm text-steel-600">
                      {catalogue.length ? 'No photographed model matches that.' : 'Loading the catalogue…'}
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? <HexSpinner /> : null}
              Save banner
            </Button>
          </div>
        </section>
      ) : null}

      {banners.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {banners.map((banner) => (
            <li key={banner._id} className="overflow-hidden rounded-card border border-line bg-paper">
              <div className="relative aspect-[16/7] bg-porcelain">
                {banner.image ? (
                  <Image src={banner.image} alt={banner.imageAlt} fill sizes="480px" className="object-cover" />
                ) : null}
                {banner.status !== 'published' ? (
                  <span className="absolute left-3 top-3 rounded-full bg-ink-950/80 px-2.5 py-1 text-[11px] font-medium text-porcelain">
                    Draft
                  </span>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-950">{banner.title || 'Untitled banner'}</p>
                  <p className="truncate text-sm text-steel-600">{banner.subtitle || banner.href || '—'}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">
                    {banner.page || 'home'} · order {banner.order}
                    {banner.models?.length ? ` · ${banner.models.length} models` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(banner)}
                    aria-label={`Edit ${banner.title || 'banner'}`}
                    className="flex h-9 w-9 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain hover:text-ink-950"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(banner._id)}
                    aria-label={`Delete ${banner.title || 'banner'}`}
                    className="flex h-9 w-9 items-center justify-center rounded-btn text-steel-600 hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-paper p-10 text-center text-sm text-steel-600">
          No banners yet. The home page simply skips the section until you add one.
        </p>
      )}
    </div>
  );
}
