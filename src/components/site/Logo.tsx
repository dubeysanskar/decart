import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site';

/**
 * Brand lockup. Assets are derived from the client master by `npm run brand`.
 *
 * Sized by HEIGHT with width:auto. The previous version forced an inline width while capping
 * the height with max-h-*, which squashed the wordmark by ~11% — the two constraints fought
 * and the aspect ratio lost. These are the real intrinsic sizes of the exported files.
 */
const INTRINSIC = {
  full: { w: 1000, h: 356 },
  mark: { w: 512, h: 506 },
};

export function Logo({
  onDark = false,
  mark = false,
  className,
  width = 180,
  href = '/',
}: {
  onDark?: boolean;
  mark?: boolean;
  className?: string;
  /** nominal width; height follows the asset's own ratio so the lockup is never distorted */
  width?: number;
  href?: string | null;
}) {
  const src = mark
    ? onDark
      ? '/brand/logo-mark-dark.png'
      : '/brand/logo-mark.png'
    : onDark
      ? '/brand/logo-dark.png'
      : '/brand/logo.png';

  const dims = mark ? INTRINSIC.mark : INTRINSIC.full;
  const height = Math.round((width * dims.h) / dims.w);

  const image = (
    <Image
      src={src}
      alt={`${SITE.legalName} — ${SITE.tagline}`}
      width={width}
      height={height}
      priority
      // width/height carry the ratio; `h-auto` keeps it intact at every breakpoint
      className={cn('block h-auto', className)}
      style={{ width }}
    />
  );

  if (!href) return image;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={`${SITE.shortName} — home`}>
      {image}
    </Link>
  );
}
