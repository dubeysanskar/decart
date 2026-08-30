'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/form';
import { ImageField } from './ImageField';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { slugify } from '@/lib/utils';

export type ProjectImageDraft = { src: string; alt: string };

export type ProjectDraft = {
  title: string;
  slug: string;
  client: string;
  location: string;
  summary: string;
  bodyHtml: string;
  images: ProjectImageDraft[];
  scope: string[];
  completedAt: string;
  featured: boolean;
  status: string;
  order: number;
  seoTitle: string;
  seoDescription: string;
};

export const EMPTY_PROJECT: ProjectDraft = {
  title: '',
  slug: '',
  client: '',
  location: '',
  summary: '',
  bodyHtml: '',
  images: [],
  scope: [],
  completedAt: '',
  featured: false,
  status: 'published',
  order: 0,
  seoTitle: '',
  seoDescription: '',
};

/** One completed installation: a few photos and the story behind them. */
export function ProjectEditor({ initial, isNew }: { initial: ProjectDraft; isNew: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function save() {
    if (!draft.title.trim()) {
      toast.push('Give the project a title.', 'error');
      return;
    }
    const slug = draft.slug.trim() || slugify(draft.title);
    setBusy(true);
    const res = await fetch(isNew ? '/api/projects' : `/api/projects/${initial.slug}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...draft, slug, images: draft.images.filter((i) => i.src.trim()) }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);

    if (res.ok) {
      toast.push(isNew ? 'Project published.' : 'Project updated.', 'success');
      router.push('/admin/projects');
      router.refresh();
    } else {
      toast.push((json?.errors && (Object.values(json.errors)[0] as string)) || 'Could not save.', 'error');
    }
  }

  async function remove() {
    setBusy(true);
    const res = await fetch(`/api/projects/${initial.slug}`, { method: 'DELETE' });
    setBusy(false);
    if (res.ok) {
      toast.push('Project deleted.', 'success');
      router.push('/admin/projects');
      router.refresh();
    } else {
      toast.push('Could not delete that project.', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel-600 hover:text-ink-950"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>
        {!isNew ? (
          <Link
            href={`/projects/${initial.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
          >
            View page <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <h1 className="font-display text-3xl text-ink-950">{isNew ? 'New project' : draft.title}</h1>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">The job</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            label="Title"
            required
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="220-seat floor for a Gurugram IT campus"
          />
          <Input
            label="URL slug"
            value={draft.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder={slugify(draft.title) || 'auto-generated from the title'}
            hint="Leave blank and we build it from the title."
          />
          <Input
            label="Client"
            value={draft.client}
            onChange={(e) => set('client', e.target.value)}
            placeholder="Named only with their permission"
          />
          <Input
            label="Location"
            value={draft.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Gurugram, Haryana"
          />
          <Input
            label="Completed"
            value={draft.completedAt}
            onChange={(e) => set('completedAt', e.target.value)}
            placeholder="March 2026"
          />
          <Input
            label="Scope (comma separated)"
            value={draft.scope.join(', ')}
            onChange={(e) =>
              set(
                'scope',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Workstations, Task seating, Cabins"
          />
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <Textarea
            label="Summary"
            rows={2}
            value={draft.summary}
            onChange={(e) => set('summary', e.target.value)}
            hint="One or two lines — this is what shows on the cards."
          />
          <Textarea
            label="Story (HTML allowed: p, h3, ul, li, strong, a)"
            rows={8}
            value={draft.bodyHtml}
            onChange={(e) => set('bodyHtml', e.target.value)}
            placeholder="<p>What the brief was, what we made, how it shipped…</p>"
            hint="Sanitised on render, so unsafe markup is stripped automatically."
          />
        </div>
      </section>

      <section className="rounded-card border border-line bg-paper p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-950">Photos</h2>
            <p className="mt-1 text-sm text-steel-600">The first photo is the cover on listing pages.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => set('images', [...draft.images, { src: '', alt: '' }])}
          >
            <Plus className="h-4 w-4" /> Add photo
          </Button>
        </div>

        {draft.images.length ? (
          <ol className="mt-4 flex flex-col gap-4">
            {draft.images.map((image, i) => (
              <li key={i} className="rounded-card border border-line bg-porcelain p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="mt-2 font-mono text-[11px] text-steel-400">
                    {i === 0 ? 'cover' : String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-1 flex-col gap-3">
                    <ImageField
                      label={`Photo ${i + 1}`}
                      value={image.src}
                      onChange={(src) =>
                        set(
                          'images',
                          draft.images.map((im, index) => (index === i ? { ...im, src } : im)),
                        )
                      }
                      folder="products"
                    />
                    <Input
                      label="Caption / alt text"
                      value={image.alt}
                      onChange={(e) =>
                        set(
                          'images',
                          draft.images.map((im, index) =>
                            index === i ? { ...im, alt: e.target.value } : im,
                          ),
                        )
                      }
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove photo ${i + 1}`}
                    onClick={() => set('images', draft.images.filter((_, index) => index !== i))}
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-steel-600 hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-card border border-dashed border-line p-8 text-center text-sm text-steel-600">
            No photos yet. A project without a picture still publishes, but it will not stand out.
          </p>
        )}
      </section>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Publishing &amp; SEO</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft (hidden)</option>
          </Select>
          <Input
            label="Order"
            type="number"
            value={String(draft.order)}
            onChange={(e) => set('order', Number(e.target.value))}
            hint="Lower numbers come first."
          />
          <label className="flex items-center gap-3 rounded-btn border border-line px-4 py-3">
            <input
              type="checkbox"
              checked={draft.featured}
              onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 accent-decart-700"
            />
            <span className="text-sm text-ink-900">Feature on the home page</span>
          </label>
          <Input
            label="Meta title"
            value={draft.seoTitle}
            onChange={(e) => set('seoTitle', e.target.value)}
            hint="Leave blank to use the project title."
          />
          <Textarea
            label="Meta description"
            rows={2}
            value={draft.seoDescription}
            onChange={(e) => set('seoDescription', e.target.value)}
            wrapperClassName="md:col-span-2"
            hint="Leave blank to use the summary."
          />
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-line bg-porcelain/95 py-4 backdrop-blur">
        {!isNew ? (
          <Button variant="secondary" onClick={remove} disabled={busy}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        ) : null}
        <ButtonLink href="/admin/projects" variant="secondary">
          Cancel
        </ButtonLink>
        <Button onClick={save} disabled={busy}>
          {busy ? <HexSpinner /> : null}
          {isNew ? 'Publish project' : 'Save changes'}
        </Button>
      </div>
    </div>
  );
}
