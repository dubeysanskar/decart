import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'cognac' | 'success' | 'warning' | 'danger' | 'dark';
  className?: string;
}) {
  const tones = {
    neutral: 'border-line bg-porcelain text-steel-600',
    brand: 'border-decart-100 bg-decart-50 text-decart-700',
    cognac: 'border-cognac-500/30 bg-cognac-500/10 text-cognac-600',
    success: 'border-success/25 bg-success/10 text-success',
    warning: 'border-warning/25 bg-warning/10 text-warning',
    danger: 'border-danger/25 bg-danger/10 text-danger',
    dark: 'border-white/15 bg-white/5 text-porcelain',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatBlock({
  value,
  label,
  onDark = false,
  className,
}: {
  value: string;
  label: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'font-mono text-3xl font-medium tracking-[0.02em] md:text-4xl',
          onDark ? 'text-porcelain' : 'text-ink-950',
        )}
      >
        {value}
      </div>
      <div className={cn('mt-2 text-sm', onDark ? 'text-steel-400' : 'text-steel-600')}>{label}</div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-steel-600">
      {items.map((item, i) => (
        <span key={`${item.name}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-steel-400" /> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-ink-900 hover:underline">
              {item.name}
            </Link>
          ) : (
            <span className="text-ink-900">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-card border border-dashed border-line bg-porcelain p-10 text-center', className)}>
      <span
        aria-hidden
        className="mx-auto mb-4 block h-8 w-7 border-2 border-decart-300"
        style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
      />
      <h3 className="text-lg font-semibold text-ink-950">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm text-steel-600">{body}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}

/** Rotating hexagon outline — the loading spinner (§4.6-2). */
export function HexSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-4 w-[14px] animate-hex-spin border-2 border-current', className)}
      style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-0 border-t border-line', className)} />;
}
