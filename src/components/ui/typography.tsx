import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Eyebrow({
  children,
  onDark = false,
  className,
}: {
  children: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-eyebrow font-semibold uppercase tracking-[0.14em]',
        onDark ? 'text-decart-300' : 'text-decart-600',
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  onDark = false,
  align = 'left',
  className,
  action,
  index,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  onDark?: boolean;
  align?: 'left' | 'center';
  className?: string;
  action?: ReactNode;
  /** section index marker — "01", "02"… the machined counterpart to the eyebrow */
  index?: string;
}) {
  return (
    <div className={cn('w-full', className)}>
      {/* hairline + index: the editorial rule that separates one section idea from the next */}
      <div
        className={cn(
          'mb-6 flex items-center gap-4 border-t pt-4',
          onDark ? 'border-white/15' : 'border-line',
          align === 'center' && 'justify-center',
        )}
      >
        {index ? (
          <span
            className={cn(
              'font-mono text-[11px] tracking-[0.14em]',
              onDark ? 'text-decart-300' : 'text-decart-600',
            )}
          >
            {index}
          </span>
        ) : null}
        {eyebrow ? <Eyebrow onDark={onDark}>{eyebrow}</Eyebrow> : null}
      </div>

      <div
        className={cn(
          'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
          align === 'center' && 'md:flex-col md:items-center',
        )}
      >
        <div className={cn('max-w-3xl', align === 'center' && 'text-center')}>
          <h2 className={cn('font-display text-h2 text-balance', onDark ? 'text-porcelain' : 'text-ink-950')}>
            {title}
          </h2>
          {lede ? (
            <p
              className={cn(
                'mt-4 max-w-2xl text-[1.0625rem] leading-relaxed',
                onDark ? 'text-steel-400' : 'text-steel-600',
              )}
            >
              {lede}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/** The hexagon list bullet used across prose blocks. */
export function HexBullet({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('mt-[0.45em] inline-block h-[10px] w-[9px] shrink-0 bg-decart-500', className)}
      style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
    />
  );
}
