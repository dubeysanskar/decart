import Link from 'next/link';
import { Hero, MarketplaceStrip } from '@/components/home/Hero';
import { CategoryDirectory } from '@/components/home/CategoryDirectory';
import { LatestProjects, ClientWall } from '@/components/home/ContentSections';
import {
  TrustBar,
  BestsellerRail,
  WhyDecArt,
  ClientMarquee,
  Testimonials,
  ProjectStrip,
  QuoteBand,
} from '@/components/home/sections';
import { ColourStory, HomeFaq, SegmentList } from '@/components/home/extra-sections';
import { HomeSeo } from '@/components/home/HomeSeo';
import { ContactBand } from '@/components/site/ContactBand';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { getFeatured, getFamilyTiles, getFeaturedReviews, getProduct, GROUPS } from '@/lib/catalogue';
import { getBanners, getHomeProjects, getClientLogos } from '@/lib/content';
import { getPublishedPosts } from '@/lib/blog';
import { formatDate } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';

export const revalidate = 3600;

export default async function HomePage() {
  const [families, bestsellers, reviews, posts, colourHero, banners, projects, clientLogos] = await Promise.all([
    // every visible family, so the directory can show all three groups
    getFamilyTiles(),
    getFeatured(10),
    getFeaturedReviews(3),
    getPublishedPosts(3),
    // the Bubble carries the widest standard colour range in the shoot
    getProduct('bubble-mb'),
    // everything below is client-managed in /admin and simply absent until they add it
    getBanners(),
    getHomeProjects(3),
    getClientLogos(),
  ]);

  // the slider leads with the families we hold real photography for
  const photographed = families.filter((family) => family.cover);

  /**
   * Each banner links at a category page, so the slug in its href tells us what the slide is
   * about. That resolves to a product group, which is what the hero rail re-filters to as the
   * banner rotates (client: "ye slider ki category ke hisab se change ho sakte hai kya").
   * Worked out here rather than in the hero so the catalogue never reaches the client bundle.
   */
  const bannerFocus: Record<string, { group: string; label: string; lead: string }> = {};
  for (const banner of banners) {
    const slug = /^\/products\/([a-z0-9-]+)/.exec(banner.href ?? '')?.[1];
    const family = slug ? families.find((f) => f.slug === slug) : undefined;
    if (!family) continue;
    bannerFocus[banner._id] = {
      group: family.group,
      label: GROUPS.find((g) => g.slug === family.group)?.name ?? '',
      lead: family.slug,
    };
  }

  return (
    <>
      {/* banners now sit behind the hero rather than in a strip under it */}
      <Hero categories={photographed} banners={banners} bannerFocus={bannerFocus} />
      <TrustBar />
      <CategoryDirectory families={families} />
      <BestsellerRail products={bestsellers} />
      <WhyDecArt />
      <ColourStory product={colourHero ?? undefined} />
      <SegmentList />
      {/* one projects section, not two: the client-managed one when they have added
          projects, the installation gallery as the fallback */}
      {projects.length ? <LatestProjects projects={projects} /> : <ProjectStrip />}
      {clientLogos.length ? <ClientWall clients={clientLogos} /> : <ClientMarquee />}
      <Testimonials reviews={reviews} />
      <HomeFaq />

      {posts.length ? (
        <section className="section bg-paper">
          <div className="container-x">
            <SectionHeading
              eyebrow="From the workshop"
              index="09"
              title="Notes on seating, specs and floors"
              action={
                <ButtonLink href="/blog" variant="secondary">
                  Read the blog
                </ButtonLink>
              }
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3" data-stagger>
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  data-anim="up"
                  className="group overflow-hidden rounded-card bg-paper shadow-[0_0_0_1px_rgb(231_231_228)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_0_1px_rgb(10_12_14/0.14),0_24px_40px_-24px_rgb(10_12_14/0.3)]"
                >
                  {/* blog covers are product cut-outs, not editorial photography — "cover"
                      cropped the chairs off the edges of the frame, so they sit contained on a
                      soft well with the same ground shadow as the category cards */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-paper">
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(78% 70% at 50% 45%, transparent 55%, rgb(243 248 252 / 0.9) 100%)',
                      }}
                    />
                    <ProductImage
                      src={post.cover?.src}
                      alt={post.cover?.alt || post.title}
                      label="Cover image"
                      sizes="(max-width: 768px) 100vw, 380px"
                      imgClassName="p-6 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-5 left-1/2 h-2 w-2/5 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-md"
                    />
                  </div>
                  <div className="p-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                      {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'} · {post.readingMinutes} min read
                    </p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug text-ink-950 transition-colors group-hover:text-decart-700">
                      {post.title}
                    </h3>
                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-steel-600">{post.excerpt}</p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ContactBand />

      <HomeSeo />

      {/* the client asked for the marketplace strip at the foot of the page */}
      <MarketplaceStrip />

      <QuoteBand />
    </>
  );
}
