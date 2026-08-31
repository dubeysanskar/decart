import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/site/PageHeader';
import { ProductImage } from '@/components/ui/ProductImage';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { QuoteBand } from '@/components/home/sections';
import { FeaturedSlider } from '@/components/blog/FeaturedSlider';
import { getPublishedPosts } from '@/lib/blog';
import { buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';

export const revalidate = 900;

export const metadata: Metadata = buildMetadata({
  title: 'Blog — Notes on Office Seating, Specs and Fit-Outs',
  description:
    'Practical writing from a chair factory: how to read a spec sheet, what actually fails first, and how to furnish a floor without over-ordering.',
  path: '/blog',
});

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts();
  // the three newest carry the slider, the remainder fill the grid under it
  const featured = posts.slice(0, 3);
  const rest = posts.slice(3);

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the factory."
        lede="Specification, ergonomics and procurement — written by the people who build the product, not a content agency."
        breadcrumbs={[{ name: 'Home', href: '/' }, { name: 'Blog' }]}
      />

      <section className="section bg-paper">
        <div className="container-x">
          {posts.length ? (
            <>
              {/* the three newest run as a slider; the rest stay a grid below it */}
              <FeaturedSlider posts={featured} />

              {rest.length ? (
                <h2 className="mt-16 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
                  More from the workshop
                </h2>
              ) : null}

              <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-3 ${rest.length ? 'mt-6' : 'mt-16'}`}>
              {(rest.length ? rest : posts).map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  data-reveal
                  className="group overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-lift"
                >
                  {/* same reason as the home grid: these are cut-outs, and an ink well behind a
                      white-background cut-out reads as a broken image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-paper">
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
                      imgClassName="p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-5 left-1/2 h-2 w-2/5 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-md"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                      {post.tags?.[0] ? `${post.tags[0]} · ` : ''}
                      {post.publishedAt ? formatDate(post.publishedAt) : ''} · {post.readingMinutes} min
                    </p>
                    <h2 className="mt-2 text-lg font-semibold leading-snug text-ink-950 group-hover:text-decart-700">
                      {post.title}
                    </h2>
                    {post.excerpt ? <p className="mt-2 text-sm text-steel-600">{post.excerpt}</p> : null}
                  </div>
                </Link>
              ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="The first post is being written"
              body="We are putting together practical guides on specifying seating for floors, campuses and cabins. In the meantime, our sales desk answers the same questions directly."
              action={
                <>
                  <ButtonLink href="/quote">Ask us instead</ButtonLink>
                  <ButtonLink href="/products" variant="secondary">
                    Browse the catalogue
                  </ButtonLink>
                </>
              }
            />
          )}
        </div>
      </section>

      <QuoteBand />
    </>
  );
}
