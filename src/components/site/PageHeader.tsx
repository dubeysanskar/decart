import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/typography';
import { Breadcrumbs } from '@/components/ui/bits';
import { cn } from '@/lib/utils';

/**
 * Standard page opener. Carries the fixed-header offset so pages never have to think about it.
 * `tone="dark"` gives the ink.950 band used by About and Manufacturing.
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  breadcrumbs,
  tone = 'light',
  size = 'default',
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  breadcrumbs?: { name: string; href?: string }[];
  tone?: 'light' | 'dark';
  /**
   * `compact` drops the opener to text-h2 and trims the padding. text-h1 clamps up to 68px,
   * which is right for a landing page but swallows the first screen on a working page like
   * /contact where the form matters more than the title.
   */
  size?: 'default' | 'compact';
  children?: ReactNode;
  className?: string;
}) {
  const dark = tone === 'dark';
  const compact = size === 'compact';

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        compact ? 'pb-8 pt-24 md:pb-10 md:pt-28' : 'pb-10 pt-28 md:pb-14 md:pt-36',
        dark ? 'dark-section bg-ink-950 text-porcelain' : 'border-b border-line bg-porcelain',
        className,
      )}
    >
      {dark ? <div className="hex-grid absolute inset-0" aria-hidden /> : null}
      <div className="container-x relative">
        {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
        {eyebrow ? (
          <Eyebrow onDark={dark} className={cn(breadcrumbs?.length && 'mt-6')}>
            {eyebrow}
          </Eyebrow>
        ) : null}
        <h1
          className={cn(
            'mt-3 max-w-3xl font-display',
            compact ? 'text-h2' : 'text-h1',
            dark ? 'text-porcelain' : 'text-ink-950',
          )}
        >
          {title}
        </h1>
        {lede ? (
          <p
            className={cn(
              'mt-4 max-w-2xl leading-relaxed',
              compact ? 'text-[0.9375rem]' : 'mt-5 text-lg',
              dark ? 'text-steel-400' : 'text-steel-600',
            )}
          >
            {lede}
          </p>
        ) : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
