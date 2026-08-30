'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/form';
import { ImageField } from './ImageField';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';

export type BannerRow = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  status: string;
  order: number;
};

const EMPTY: Omit<BannerRow, '_id'> = {
  title: '',
  subtitle: '',
  image: '',
  imageAlt: '',
  href: '',
  ctaLabel: '',
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

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  function openNew() {
    setDraft({ ...EMPTY, order: banners.length });
    setEditing('new');
  }

  function openEdit(banner: BannerRow) {
    const { _id, ...rest } = banner;
    setDraft(rest);
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
            Campaign artwork for the home page. {banners.length} in the rotation.
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
                  <p className="mt-1 font-mono text-[10px] text-steel-400">order {banner.order}</p>
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
