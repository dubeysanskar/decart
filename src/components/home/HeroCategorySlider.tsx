'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HeroCategory = {
  slug: string;
  name: string;
  count: number;
  cover: string;
  lede?: string;
};

/**
 * Hero category slider (client brief: "multiple slider for hero categories, on clicking it will
 * lead to category page"). Categories stand on the white podiums from the campaign banner and
 * the rail advances in pages, so a phone shows two and a desktop four.
 *
 * Built on native scroll-snap rather than a carousel library: it stays swipeable, keyboard
 * accessible and works with JS disabled — the arrows and autoplay are progressive enhancement.
 */
export function HeroCategorySlider({ categories }: { categories: HeroCategory[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const total = Math.max(1, Math.ceil(rail.scrollWidth / rail.clientWidth));
    setPages(total);
    setPage(Math.round(rail.scrollLeft / rail.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => setPage(Math.round(rail.scrollLeft / rail.clientWidth));
    rail.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      rail.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const goto = useCallback((index: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const target = ((index % Math.max(1, pages)) + Math.max(1, pages)) % Math.max(1, pages);
    rail.scrollTo({ left: target * rail.clientWidth, behavior: 'smooth' });
  }, [pages]);

  // autoplay, paused on hover/focus/touch and under reduced motion
  useEffect(() => {
    if (paused || pages < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => goto(page + 1), 5000);
    return () => clearInterval(timer);
  }, [paused, page, pages, goto]);

  if (!categories.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={railRef}
        role="region"
        aria-label="Product categories"
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory items-stretch overflow-x-auto px-4 pb-2 md:-mx-7 md:px-7 lg:mx-0 lg:px-0"
      >
        {categories.map((category, i) => (
          <Link
            key={category.slug}
            href={`/products/${category.slug}`}
            aria-label={`${category.name} — ${category.count} models`}
            className="group flex w-1/2 shrink-0 snap-start flex-col px-1 sm:w-1/3 lg:w-1/4"
          >
            {/*
              One continuous white card. The studio photography is shot on white, so a separate
              podium block underneath just produced a visible seam against the blue stage.
            */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-card bg-paper shadow-podium transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-pop">
              <div className="relative aspect-[3/4] w-full">
                {category.cover ? (
                  <Image
                    src={category.cover}
                    alt={`DecArt ${category.name}`}
                    fill
                    priority={i < 2}
                    loading={i < 2 ? undefined : 'lazy'}
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
                    className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-porcelain px-2 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-steel-400">
                    {category.name}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-center border-t border-line px-3 py-3.5">
                <span className="line-clamp-1 text-center text-[0.8125rem] font-semibold text-ink-950 group-hover:text-decart-700">
                  {category.name}
                </span>
                <span className="mt-0.5 font-mono text-[10px] tracking-[0.08em] text-steel-400">
                  {category.count} {category.count === 1 ? 'model' : 'models'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {pages > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-3 lg:justify-end">
          <button
            type="button"
            onClick={() => goto(page - 1)}
            aria-label="Previous categories"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-900 transition-colors hover:border-decart-500 hover:text-decart-700"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goto(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === page}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === page ? 'w-6 bg-decart-600' : 'w-1.5 bg-steel-400/50 hover:bg-steel-400',
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goto(page + 1)}
            aria-label="Next categories"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper/90 text-ink-900 transition-colors hover:border-decart-500 hover:text-decart-700"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
