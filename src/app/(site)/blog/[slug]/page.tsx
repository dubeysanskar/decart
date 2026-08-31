import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/bits';
import { ProductCard } from '@/components/product/ProductCard';
import { QuoteBand } from '@/components/home/sections';
import { Eyebrow } from '@/components/ui/typography';
import { getPost, getPublishedPosts, renderPostHtml } from '@/lib/blog';
import { getProduct } from '@/lib/catalogue';
import { buildMetadata, articleLd, breadcrumbLd } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { waLink } from '@/lib/whatsapp';
import { SITE } from '@/lib/site';

export const revalidate = 900;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return {};
  return buildMetadata({
    title: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.seo?.ogImage || post.cover?.src || '/brand/og-default.jpg',
    type: 'article',
    keywords: post.seo?.keywords,
    publishedAt: post.publishedAt,
  } as never);
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = (
    await Promise.all((post.relatedProductSlugs ?? []).slice(0, 4).map((slug) => getProduct(slug)))
  ).filter(Boolean);

  const url = `${SITE.url}/blog/${post.slug}`;
  const html = renderPostHtml(post.contentHtml ?? '');

  return (
    <>
      <article>
        <header className="border-b border-line bg-porcelain pb-10 pt-24 md:pt-32">
          <div className="container-x">
            <Breadcrumbs
              items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }, { name: post.title }]}
            />
            {post.tags?.[0] ? <Eyebrow className="mt-6">{post.tags[0]}</Eyebrow> : null}
            <h1 className="mt-3 max-w-4xl font-display text-h1 text-ink-950">{post.title}</h1>
            <p className="mt-5 font-mono text-xs uppercase tracking-[0.1em] text-steel-600">
              {post.author} · {post.publishedAt ? formatDate(post.publishedAt) : ''} · {post.readingMinutes} min read
            </p>
          </div>
        </header>

        {post.cover?.src ? (
          <div className="container-x -mt-2 pt-10">
            {/* the covers are product cut-outs on white, so an ink well and a hard crop both
                read as a broken image — contain them on a light ground instead */}
            <div className="relative mx-auto aspect-[16/9] max-w-3xl overflow-hidden rounded-img border border-line bg-paper">
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(72% 70% at 50% 45%, transparent 55%, rgb(243 248 252 / 0.9) 100%)',
                }}
              />
              <Image
                src={post.cover.src}
                alt={post.cover.alt || post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain p-8 md:p-10"
              />
              <span
                aria-hidden
                className="absolute bottom-8 left-1/2 h-3 w-1/3 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-lg"
              />
            </div>
          </div>
        ) : null}

        <div className="section bg-paper">
          <div className="container-x">
            <div
              className="prose-decart mx-auto max-w-[68ch]"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="mx-auto mt-12 flex max-w-[68ch] flex-wrap items-center gap-3 border-t border-line pt-6">
              <span className="text-sm text-steel-600">Share:</span>
              <a
                href={waLink(`${post.title} — ${url}`)}
                target="_blank"
                rel="noopener noreferrer"
                data-wa="blog-share"
                className="rounded-btn bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-btn border border-line px-4 py-2 text-sm font-semibold text-ink-900"
              >
                LinkedIn
              </a>
              <Link href="/blog" className="ml-auto text-sm font-semibold text-decart-700 hover:underline">
                ← All posts
              </Link>
            </div>
          </div>
        </div>

        {related.length ? (
          <section className="border-t border-line bg-porcelain py-14">
            <div className="container-x">
              <h2 className="font-display text-h3 text-ink-950">Products in this article</h2>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                {related.map((product) => (
                  <ProductCard key={product!.slug} product={product!} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </article>

      <QuoteBand />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleLd({
              title: post.title,
              slug: post.slug,
              description: post.seo?.metaDescription || post.excerpt,
              image: post.cover?.src,
              publishedAt: post.publishedAt,
              updatedAt: post.updatedAt,
              author: post.author,
            }),
            breadcrumbLd([
              { name: 'Home', path: '/' },
              { name: 'Blog', path: '/blog' },
              { name: post.title, path: `/blog/${post.slug}` },
            ]),
          ]),
        }}
      />
    </>
  );
}
