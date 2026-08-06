import { ProductEditor, type ProductDraft } from '@/components/admin/ProductEditor';
import { FAMILIES } from '@/data/catalogue.seed';

export const dynamic = 'force-dynamic';

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

export default function NewProductPage() {
  return (
    <ProductEditor
      initial={EMPTY}
      families={FAMILIES.map((f) => ({ slug: f.slug, name: f.name, group: f.group, spec: f.spec }))}
      isNew
    />
  );
}
