import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/site';

/** Brand lockup. Assets are derived from the client master by `npm run brand`. */
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

  const image = (
    <Image
      src={src}
      alt={`${SITE.legalName} — ${SITE.tagline}`}
      width={width}
      height={mark ? width : Math.round(width * 0.36)}
      priority
      className={cn('h-auto w-auto', mark ? 'max-h-11' : 'max-h-11 md:max-h-12', className)}
      style={{ width: mark ? undefined : width }}
    />
  );

  if (!href) return image;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label={`${SITE.shortName} — home`}>
      {image}
    </Link>
  );
}
