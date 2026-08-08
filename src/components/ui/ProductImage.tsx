'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * PlaceholderImage (§4.5) — ink.900 field, hex outline pattern, series name in Plex Mono.
 * Rendered whenever a manifest image is missing so we never show a broken image.
 */
export function PlaceholderImage({
  label,
  className,
  tone = 'light',
}: {
  label?: string;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-hidden',
        dark ? 'hex-grid bg-ink-900' : 'bg-porcelain',
        className,
      )}
    >
      {/* a light plate reads as "awaiting photography" in a grid; an ink block reads as broken */}
      {!dark ? (
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='64' viewBox='0 0 56 64'%3E%3Cpath d='M28 0 56 16v32L28 64 0 48V16Z' fill='none' stroke='%230F1317' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: '56px 64px',
          }}
        />
      ) : null}
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        <span
          aria-hidden
          className={cn('h-7 w-[25px] border-2', dark ? 'border-decart-500/70' : 'border-decart-300')}
          style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
        />
        <span
          className={cn(
            'font-mono text-[10px] uppercase tracking-[0.14em]',
            dark ? 'text-steel-400' : 'text-steel-600',
          )}
        >
          {label || 'Photo on request'}
        </span>
      </div>
    </div>
  );
}

/**
 * Product imagery with an automatic branded fallback. Wraps next/image so every product
 * tile keeps a fixed aspect box (CLS) whether or not the photo exists yet.
 */
export function ProductImage({
  src,
  alt,
  label,
  priority = false,
  sizes = '(max-width: 768px) 50vw, 25vw',
  className,
  imgClassName,
  fit = 'contain',
}: {
  src?: string;
  alt: string;
  label?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  fit?: 'contain' | 'cover';
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const show = src && !failed;

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {show ? (
        <>
          {/* a calm tint holds the box until the photo decodes — no flash of empty white */}
          {!loaded ? <span aria-hidden className="absolute inset-0 animate-pulse bg-porcelain" /> : null}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={cn(
              fit === 'contain' ? 'object-contain' : 'object-cover',
              'transition-[transform,opacity] duration-500 ease-out',
              loaded ? 'opacity-100' : 'opacity-0',
              imgClassName,
            )}
          />
        </>
      ) : (
        <PlaceholderImage label={label} />
      )}
    </div>
  );
}
