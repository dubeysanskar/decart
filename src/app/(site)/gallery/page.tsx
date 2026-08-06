import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { GalleryTabs } from '@/components/site/GalleryTabs';
import { QuoteBand } from '@/components/home/sections';
import { buildMetadata } from '@/lib/seo';
import { listPublic } from '@/lib/assets';
import { getFeatured } from '@/lib/catalogue';

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: 'Gallery — Products, Factory & Installations',
  description:
    'Product photography, the Faridabad factory floor, client installations, warehouse and exhibitions — DecArt Industries in pictures.',
  path: '/gallery',
});

export default async function GalleryPage() {
  const featured = await getFeatured(24);

  const tabs = [
    {
      id: 'products',
      label: 'Products',
      images: featured
        .flatMap((product) => product.images.slice(0, 2))
        .filter(Boolean)
        .map((image) => ({ src: image.src, alt: image.alt })),
    },
    {
      id: 'factory',
      label: 'Factory',
      images: listPublic('factory').map((src) => ({ src, alt: 'DecArt factory, Faridabad' })),
    },
    {
      id: 'installations',
      label: 'Installations',
      images: listPublic('gallery/installations').map((src) => ({ src, alt: 'DecArt installation' })),
    },
    {
      id: 'warehouse',
      label: 'Warehouse',
      images: listPublic('gallery/warehouse').map((src) => ({ src, alt: 'DecArt warehouse' })),
    },
    {
      id: 'exhibitions',
      label: 'Exhibitions',
      images: listPublic('gallery/exhibitions').map((src) => ({ src, alt: 'DecArt at an exhibition' })),
    },
  ].filter((tab) => tab.images.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="The work, in pictures."
        lede="Studio photography of the range, the floor it is built on, and the sites it ends up in."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Gallery' }]}
      />
      <GalleryTabs tabs={tabs} />
      <QuoteBand />
    </>
  );
}
