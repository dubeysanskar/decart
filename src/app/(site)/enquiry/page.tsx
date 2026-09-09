import type { Metadata } from 'next';
import { PageHeader } from '@/components/site/PageHeader';
import { EnquirySheet } from '@/components/enquiry/EnquirySheet';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'Your Enquiry List — DecArt Furniture',
    description:
      'The models you are considering, with quantities, ready to send as one enquiry. We price the whole floor and come back with a written quotation.',
    path: '/enquiry',
  }),
  // one visitor's working list: nothing here belongs in a search index
  robots: { index: false, follow: true },
};

export default function EnquiryPage() {
  return (
    <>
      <PageHeader
        size="compact"
        eyebrow="Enquiry list"
        title="Send the whole floor at once"
        lede="Collect the models you are considering, set the quantities, and send them as a single enquiry — one quotation covering the lot rather than a chair at a time."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Enquiry list' }]}
      />

      <section className="bg-paper py-10 md:py-14">
        <div className="container-x">
          <EnquirySheet />
        </div>
      </section>
    </>
  );
}
