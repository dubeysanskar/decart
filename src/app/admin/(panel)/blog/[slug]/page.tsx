import { notFound } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { postBySlug } from '@/lib/repo';
import { BlogEditor, type PostDraft } from '@/components/admin/BlogEditor';

export const dynamic = 'force-dynamic';

const EMPTY_POST: PostDraft = {
  title: '',
  slug: '',
  excerpt: '',
  cover: { src: '', alt: '' },
  contentHtml: '',
  tags: [],
  status: 'draft',
  relatedProductSlugs: [],
  seo: { metaTitle: '', metaDescription: '', ogImage: '', keywords: [] },
};

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'new') return <BlogEditor initial={EMPTY_POST} isNew />;
  if (!hasDb()) notFound();

  const doc = await postBySlug(params.slug);
  if (!doc) notFound();

  const initial: PostDraft = {
    ...EMPTY_POST,
    ...JSON.parse(JSON.stringify(doc)),
    cover: { src: doc.cover?.src ?? '', alt: doc.cover?.alt ?? '' },
    seo: {
      metaTitle: doc.seo?.metaTitle ?? '',
      metaDescription: doc.seo?.metaDescription ?? '',
      ogImage: doc.seo?.ogImage ?? '',
      keywords: doc.seo?.keywords ?? [],
    },
    tags: doc.tags ?? [],
    relatedProductSlugs: doc.relatedProductSlugs ?? [],
  };

  return <BlogEditor initial={initial} isNew={false} />;
}
