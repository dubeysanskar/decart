import { notFound } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { productBySlug } from '@/lib/repo';
import { ProductEditor, type ProductDraft } from '@/components/admin/ProductEditor';
import { FAMILIES } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

const families = () => FAMILIES.map((f) => ({ slug: f.slug, name: f.name, group: f.group, spec: f.spec }));

const EMPTY: ProductDraft = {
  code: '',
  name: '',
  slug: '',
  family: '',
  group: 'seating',
  tags: [],
  summary: '',
  description: '',
  specs: [],
  buildOptions: true,
  sizeMm: '',
  finishNote: '',
  images: [],
  price: { amount: 0, show: false },
  moq: 1,
  featured: false,
  bestSeller: false,
  status: 'draft',
  needsPhoto: true,
  needsReview: false,
  order: 0,
  seo: { title: '', description: '' },
};

export default async function ProductEditorPage({ params }: { params: { slug: string } }) {
  if (params.slug === 'new') {
    return <ProductEditor initial={EMPTY} families={families()} isNew />;
  }

  if (!hasDb()) notFound();
  const doc = await productBySlug(params.slug);
  if (!doc) notFound();

  const initial: ProductDraft = {
    ...EMPTY,
    ...JSON.parse(JSON.stringify(doc)),
    price: { amount: doc.price?.amount ?? 0, show: Boolean(doc.price?.show) },
    seo: { title: doc.seo?.title ?? '', description: doc.seo?.description ?? '' },
    tags: doc.tags ?? [],
    specs: doc.specs ?? [],
    images: doc.images ?? [],
  };

  return <ProductEditor initial={initial} families={families()} isNew={false} />;
}
