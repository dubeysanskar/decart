'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type HeroBanner = {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  href: string;
};

/**
 * The rotating artwork behind the hero (client brief: "3–4 banner lagne hai home page pe hero
 * me as a bg"). Banners come from /admin/banners, so the client swaps them for seasons and
 * offers without touching code.
 *
 * A scrim sits over the photograph because the headline is dark ink: it stays near-opaque on the
 * left where the copy is and thins out to the right so the picture is still visible. Without it
 * a dark banner would make the headline unreadable.
 */
export function HeroBanners({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const usable = banners.filter((banner) => banner.image);

  const go = useCallback((next: number) => setIndex(((next % usable.length) + usable.length) % usable.length), [usable.length]);

  useEffect(() => {
    if (paused || usable.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % usable.length), 6000);
    return () => clearInterval(timer);
  }, [paused, usable.length]);

  if (!usable.length) return null;

  const active = usable[index];

  return (
    <>
      {/* the artwork itself — crossfaded, never unmounted, so there is no flash between slides */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {usable.map((banner, i) => (
          <Image
            key={banner._id}
            src={banner.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn(
              'object-cover transition-opacity duration-1000 ease-out',
              i === index ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}

        {/* readability scrim: heavy behind the copy, light over the picture */}
        <span
          className="absolute inset-0 md:hidden"
          style={{ background: 'linear-gradient(180deg, rgb(255 255 255 / 0.93) 0%, rgb(255 255 255 / 0.86) 60%, rgb(255 255 255 / 0.94) 100%)' }}
        />
        <span
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              'linear-gradient(100deg, rgb(255 255 255 / 0.97) 0%, rgb(255 255 255 / 0.92) 34%, rgb(255 255 255 / 0.62) 58%, rgb(255 255 255 / 0.30) 100%)',
          }}
        />
      </div>

      {/* caption + dots, only worth showing when the client has written one */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-line/60 bg-paper/70 backdrop-blur"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="container-x flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            {active.title ? (
              <p className="pointer-events-auto max-w-sm text-sm font-semibold text-ink-950 md:text-base">
                {active.href ? (
                  <a href={active.href} className="hover:text-decart-700">
                    {active.title}
                  </a>
                ) : (
                  active.title
                )}
              </p>
            ) : null}
            {active.subtitle ? (
              <p className="mt-0.5 max-w-sm text-xs text-steel-600">{active.subtitle}</p>
            ) : null}
          </div>

          {usable.length > 1 ? (
            <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
              {usable.map((banner, i) => (
                <button
                  key={banner._id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show banner ${i + 1}`}
                  aria-current={i === index}
                  className={cn(
                    'h-1.5 rounded-full transition-all',
                    i === index ? 'w-6 bg-decart-700' : 'w-1.5 bg-ink-950/25 hover:bg-ink-950/45',
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
