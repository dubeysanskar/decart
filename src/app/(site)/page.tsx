import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import {
  TrustBar,
  FamilyGrid,
  BestsellerRail,
  WhyDecArt,
  ClientMarquee,
  Testimonials,
  ProjectStrip,
  QuoteBand,
} from '@/components/home/sections';
import {
  ColourStory,
  HowItWorks,
  HomeFaq,
  CatalogueStrip,
  SegmentList,
} from '@/components/home/extra-sections';
import { SectionHeading } from '@/components/ui/typography';
import { ButtonLink } from '@/components/ui/Button';
import { getFeatured, getFeaturedFamilies, getFeaturedReviews, getProduct } from '@/lib/catalogue';
import { getPublishedPosts } from '@/lib/blog';
import { formatDate } from '@/lib/utils';
import { ProductImage } from '@/components/ui/ProductImage';

export const revalidate = 3600;

export default async function HomePage() {
  const [families, bestsellers, reviews, posts, colourHero] = await Promise.all([
    // 9 tiles: one featured 2×2 stage + eight standard tiles fill the 4-column grid exactly
    getFeaturedFamilies(9),
    getFeatured(10),
    getFeaturedReviews(3),
    getPublishedPosts(3),
    // the Bubble carries the widest standard colour range in the shoot
    getProduct('bubble-mb'),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />
      <FamilyGrid families={families} />
      <BestsellerRail products={bestsellers} />
      <WhyDecArt />
      <ColourStory product={colourHero ?? undefined} />
      <HowItWorks />
      <SegmentList />
      <ClientMarquee />
      <Testimonials reviews={reviews} />
      <ProjectStrip />
      <CatalogueStrip />
      <HomeFaq />

      {posts.length ? (
        <section className="section bg-paper">
          <div className="container-x">
            <SectionHeading
              eyebrow="From the workshop"
              index="10"
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
                  <div className="relative aspect-[16/10] bg-porcelain">
                    <ProductImage
                      src={post.cover?.src}
                      alt={post.cover?.alt || post.title}
                      label="Cover image"
                      fit="cover"
                      sizes="(max-width: 768px) 100vw, 380px"
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

      <QuoteBand />
    </>
  );
}
