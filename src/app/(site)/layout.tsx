import { Header, type NavGroup } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat';
import { SmoothScroll } from '@/components/site/SmoothScroll';
import { ToastProvider } from '@/components/ui/Toast';
import { EnquiryProvider } from '@/components/enquiry/EnquiryProvider';
import { getNavFamilies } from '@/lib/catalogue';
import { getTaxonomy } from '@/lib/taxonomy';
import { organisationLd, localBusinessLd, websiteLd, siteNavigationLd } from '@/lib/seo';

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [families, masters] = await Promise.all([getNavFamilies(), getTaxonomy()]);

  /*
    The product menu follows the client's structure: one column per master category, with its
    categories under it. Series (the thirty-one product lines) are still reachable — from a
    category's page, from /products, and from search — they just are not the top of the menu.
  */
  const groups: NavGroup[] = masters.map((master) => ({
    slug: master.slug,
    name: master.name,
    href: master.href,
    families: master.categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      group: master.slug,
      count: category.count,
      lede: category.intro,
      cover: category.cover || undefined,
      href: category.href,
    })),
  }));

  return (
    <ToastProvider>
      {/* the enquiry list is read on the client, so every add button and the header badge
          share one provider mounted above the whole site */}
      <EnquiryProvider>
      <SmoothScroll />
      <Header groups={groups} />
      {/* pages own their top spacing: the home hero runs under the transparent header,
          every other page opens with <PageHeader/> which carries the offset. */}
      <main id="content" className="min-h-screen">
        {children}
      </main>
      <Footer families={families} masters={groups} />
      <WhatsAppFloat />
      </EnquiryProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organisationLd(), websiteLd(), siteNavigationLd(masters), localBusinessLd()]),
        }}
      />
    </ToastProvider>
  );
}
