import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/site/PageHeader';
import { ProductImage } from '@/components/ui/ProductImage';
import { EmptyState } from '@/components/ui/bits';
import { ButtonLink } from '@/components/ui/Button';
import { QuoteBand } from '@/components/home/sections';
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  data-reveal
                  className="group overflow-hidden rounded-card border border-line bg-paper transition-shadow hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] bg-ink-900">
                    <ProductImage
                      src={post.cover?.src}
                      alt={post.cover?.alt || post.title}
                      label="Cover image"
                      fit="cover"
                      sizes="(max-width: 768px) 100vw, 380px"
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
