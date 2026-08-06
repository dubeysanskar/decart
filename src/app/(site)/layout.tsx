import { Header, type NavGroup } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { WhatsAppFloat } from '@/components/site/WhatsAppFloat';
import { SmoothScroll } from '@/components/site/SmoothScroll';
import { ToastProvider } from '@/components/ui/Toast';
import { getNavFamilies, GROUPS } from '@/lib/catalogue';
import { organisationLd, localBusinessLd } from '@/lib/seo';

export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const families = await getNavFamilies();

  const groups: NavGroup[] = GROUPS.map((group) => ({
    slug: group.slug,
    name: group.name,
    families: families.filter((f) => f.group === group.slug),
  })).filter((group) => group.families.length > 0);

  return (
    <ToastProvider>
      <SmoothScroll />
      <Header groups={groups} />
      {/* pages own their top spacing: the home hero runs under the transparent header,
          every other page opens with <PageHeader/> which carries the offset. */}
      <main id="content" className="min-h-screen">
        {children}
      </main>
      <Footer families={families} />
      <WhatsAppFloat />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organisationLd(), localBusinessLd()]) }}
      />
    </ToastProvider>
  );
}
