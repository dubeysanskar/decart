import { BlogEditor, type PostDraft } from '@/components/admin/BlogEditor';

export const dynamic = 'force-dynamic';

const EMPTY: PostDraft = {
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

export default function NewPostPage() {
  return <BlogEditor initial={EMPTY} isNew />;
}
