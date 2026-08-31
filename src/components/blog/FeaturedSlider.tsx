'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn, formatDate } from '@/lib/utils';

export type FeaturedPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover?: { src: string; alt: string };
  tags?: string[];
  publishedAt?: string;
  readingMinutes: number;
};

const SLIDE_MS = 7000;

/**
 * Featured-post carousel at the top of the blog (client: "blog wale page bhi slider add kar do").
 *
 * The covers are product cut-outs on white, so each slide stages the photo on a white well
 * rather than cropping it edge to edge — the same treatment the cards below use.
 */
export function FeaturedSlider({ posts }: { posts: FeaturedPost[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => setIndex(((next % posts.length) + posts.length) % posts.length),
    [posts.length],
  );

  useEffect(() => {
    if (paused || posts.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % posts.length), SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [paused, posts.length]);

  if (!posts.length) return null;

  const active = posts[index];

  return (
    <div
      className="overflow-hidden rounded-card border border-line bg-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid md:grid-cols-[1.25fr_1fr]">
        {/* the artwork stack — every cover stays mounted so slides crossfade instead of flashing */}
        <div className="relative order-1 aspect-[16/9] min-w-0 overflow-hidden bg-paper md:order-2 md:aspect-auto md:h-[300px] md:self-center">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(78% 72% at 50% 45%, transparent 55%, rgb(243 248 252 / 0.9) 100%)',
            }}
          />
          {posts.map((post, i) => (
            <div
              key={post.slug}
              aria-hidden={i !== index}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                i === index ? 'opacity-100' : 'opacity-0',
              )}
            >
              <ProductImage
                src={post.cover?.src}
                alt={post.cover?.alt || post.title}
                label="Cover image"
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 40vw"
                imgClassName="p-8 md:p-10"
              />
            </div>
          ))}
          <span
            aria-hidden
            className="absolute bottom-6 left-1/2 h-3 w-1/3 -translate-x-1/2 rounded-[100%] bg-ink-950/10 blur-lg"
          />
        </div>

        <div className="order-2 flex min-w-0 flex-col justify-center p-6 md:order-1 md:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-decart-700">
            Latest from the workshop
          </p>

          {/* keyed on the slide so the copy animates in with the picture */}
          <div key={active.slug} className="animate-fade-up">
            <h2 className="mt-4 font-display text-2xl leading-snug text-ink-950 md:text-3xl">
              <Link href={`/blog/${active.slug}`} className="hover:text-decart-700">
                {active.title}
              </Link>
            </h2>

            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
              {active.tags?.[0] ? `${active.tags[0]} · ` : ''}
              {active.publishedAt ? formatDate(active.publishedAt) : ''} · {active.readingMinutes} min read
            </p>

            {active.excerpt ? (
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-steel-600">{active.excerpt}</p>
            ) : null}

            <Link
              href={`/blog/${active.slug}`}
              className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-decart-700"
            >
              Read the article
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {posts.length > 1 ? (
            <div className="mt-8 flex items-center gap-4 border-t border-line pt-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous article"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-900 transition-colors hover:border-decart-300 hover:text-decart-700"
                >
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next article"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-900 transition-colors hover:border-decart-300 hover:text-decart-700"
                >
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              </div>

              <span className="font-mono text-xs tracking-[0.14em] text-steel-400">
                {String(index + 1).padStart(2, '0')}
                <span className="mx-1 text-line">/</span>
                {String(posts.length).padStart(2, '0')}
              </span>

              <div className="flex items-center gap-1.5">
                {posts.map((post, i) => (
                  <button
                    key={post.slug}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Show article ${i + 1}`}
                    aria-current={i === index}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === index ? 'w-7 bg-decart-600' : 'w-1.5 bg-ink-950/20 hover:bg-ink-950/40',
                    )}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
