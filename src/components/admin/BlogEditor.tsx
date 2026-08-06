'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { ArrowLeft, Bold, Italic, List, ListOrdered, Quote, Link2, ImagePlus, Heading2, Heading3, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { slugify, truncate, readingMinutes, cn } from '@/lib/utils';

export type PostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  cover: { src: string; alt: string };
  contentHtml: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
  relatedProductSlugs: string[];
  seo: { metaTitle: string; metaDescription: string; ogImage: string; keywords: string[] };
};

export function BlogEditor({ initial, isNew }: { initial: PostDraft; isNew: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PostDraft>(key: K, value: PostDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      LinkExtension.configure({ openOnClick: false, autolink: true }),
      ImageExtension,
    ],
    content: initial.contentHtml || '<p></p>',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'prose-decart min-h-[320px] focus:outline-none' },
    },
    onUpdate: ({ editor: instance }) => set('contentHtml', instance.getHTML()),
  });

  useEffect(() => () => editor?.destroy(), [editor]);

  async function uploadImage(file: File, target: 'cover' | 'inline') {
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'blog');
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.push(json.error ?? 'Upload failed.', 'error');
      return;
    }
    if (target === 'cover') set('cover', { ...draft.cover, src: json.data.src });
    else editor?.chain().focus().setImage({ src: json.data.src }).run();
  }

  async function save(status?: PostDraft['status']) {
    setBusy(true);
    setErrors({});
    const payload = { ...draft, status: status ?? draft.status, contentHtml: editor?.getHTML() ?? draft.contentHtml };

    const res = await fetch(isNew ? '/api/blog' : `/api/blog/${initial.slug}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErrors(json.errors ?? { form: json.error ?? 'Could not save.' });
      toast.push('Could not save the post.', 'error');
      return;
    }
    toast.push(payload.status === 'published' ? 'Published.' : 'Draft saved.');
    if (isNew) router.push(`/admin/blog/${payload.slug}`);
    else router.refresh();
  }

  const tool = (active: boolean) =>
    cn(
      'flex h-9 w-9 items-center justify-center rounded-btn border text-steel-600',
      active ? 'border-ink-900 bg-ink-900 text-porcelain' : 'border-line hover:border-ink-800 hover:text-ink-900',
    );

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/blog" className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> All posts
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">{isNew ? 'New post' : draft.title}</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
            {draft.status} · {readingMinutes(draft.contentHtml)} min read
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => save('draft')} disabled={busy}>
            Save draft
          </Button>
          <Button onClick={() => save('published')} disabled={busy}>
            {busy ? <HexSpinner /> : null} Publish
          </Button>
        </div>
      </div>

      {errors.form ? (
        <p className="rounded-btn border border-danger/30 bg-danger/5 p-3 text-sm text-ink-900">{errors.form}</p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <Input
            label="Title"
            required
            value={draft.title}
            error={errors.title}
            onChange={(e) => {
              set('title', e.target.value);
              if (isNew) set('slug', slugify(e.target.value));
            }}
          />
          <Input
            label="Slug"
            required
            value={draft.slug}
            error={errors.slug}
            hint={`/blog/${draft.slug}`}
            onChange={(e) => set('slug', slugify(e.target.value))}
          />
          <Textarea
            label="Excerpt"
            rows={2}
            value={draft.excerpt}
            onChange={(e) => set('excerpt', e.target.value)}
            hint={`${draft.excerpt.length}/180`}
          />

          <div className="rounded-card border border-line bg-paper">
            <div className="flex flex-wrap gap-1.5 border-b border-line p-2">
              <button type="button" className={tool(editor?.isActive('bold') ?? false)} onClick={() => editor?.chain().focus().toggleBold().run()} aria-label="Bold">
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('italic') ?? false)} onClick={() => editor?.chain().focus().toggleItalic().run()} aria-label="Italic">
                <Italic className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('heading', { level: 2 }) ?? false)} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
                <Heading2 className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('heading', { level: 3 }) ?? false)} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
                <Heading3 className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('bulletList') ?? false)} onClick={() => editor?.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
                <List className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('orderedList') ?? false)} onClick={() => editor?.chain().focus().toggleOrderedList().run()} aria-label="Numbered list">
                <ListOrdered className="h-4 w-4" />
              </button>
              <button type="button" className={tool(editor?.isActive('blockquote') ?? false)} onClick={() => editor?.chain().focus().toggleBlockquote().run()} aria-label="Quote">
                <Quote className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={tool(editor?.isActive('link') ?? false)}
                aria-label="Link"
                onClick={() => {
                  const href = window.prompt('Link URL');
                  if (href) editor?.chain().focus().setLink({ href }).run();
                }}
              >
                <Link2 className="h-4 w-4" />
              </button>
              <label className={cn(tool(false), 'cursor-pointer')} aria-label="Insert image">
                <ImagePlus className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'inline')}
                />
              </label>
            </div>
            <div className="p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Cover image</h2>
            {draft.cover.src ? (
              <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-img bg-porcelain">
                <Image src={draft.cover.src} alt={draft.cover.alt} fill sizes="360px" className="object-cover" />
              </div>
            ) : null}
            <label className="mt-3 inline-flex h-11 cursor-pointer items-center gap-2 rounded-btn border border-line px-4 text-sm font-semibold">
              <Upload className="h-4 w-4" />
              Upload cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], 'cover')}
              />
            </label>
            <Input
              label="Cover alt text"
              value={draft.cover.alt}
              onChange={(e) => set('cover', { ...draft.cover, alt: e.target.value })}
              wrapperClassName="mt-3"
            />
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Publishing</h2>
            <Select
              label="Status"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as PostDraft['status'])}
              wrapperClassName="mt-3"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
            <Input
              label="Tags"
              value={draft.tags.join(', ')}
              onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
              wrapperClassName="mt-3"
              hint="Comma separated"
            />
            <Input
              label="Related product slugs"
              value={draft.relatedProductSlugs.join(', ')}
              onChange={(e) =>
                set('relatedProductSlugs', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
              }
              wrapperClassName="mt-3"
              hint="e.g. mustang-hb, eiffel-mb"
            />
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">SEO</h2>
            <Input
              label="Meta title"
              value={draft.seo.metaTitle}
              onChange={(e) => set('seo', { ...draft.seo, metaTitle: e.target.value })}
              hint={`${draft.seo.metaTitle.length}/60`}
              wrapperClassName="mt-3"
            />
            <Textarea
              label="Meta description"
              rows={3}
              value={draft.seo.metaDescription}
              onChange={(e) => set('seo', { ...draft.seo, metaDescription: e.target.value })}
              hint={`${draft.seo.metaDescription.length}/160`}
              wrapperClassName="mt-3"
            />
            <Input
              label="Keywords"
              value={draft.seo.keywords.join(', ')}
              onChange={(e) =>
                set('seo', { ...draft.seo, keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })
              }
              wrapperClassName="mt-3"
            />
            <div className="mt-4 rounded-card border border-line bg-porcelain p-3">
              <p className="text-[#1a0dab]">{truncate(draft.seo.metaTitle || draft.title, 60)}</p>
              <p className="text-xs text-success">decartseatings.in › blog › {draft.slug}</p>
              <p className="mt-1 text-xs text-steel-600">
                {truncate(draft.seo.metaDescription || draft.excerpt, 160)}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
