import { cn } from '@/lib/utils';

/**
 * The Nameplate — signature element §4.6-1.
 * Machined-metal chip carrying the model code, with a hexagon rivet at the left edge.
 * Cognac rivet marks Executive/leather contexts.
 */
export function SpecPlate({
  code,
  label,
  onDark = false,
  cognac = false,
  size = 'md',
  className,
}: {
  code: string;
  label?: string;
  onDark?: boolean;
  cognac?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const pad = size === 'sm' ? 'h-6 pl-6 pr-2.5 text-[10px]' : size === 'lg' ? 'h-9 pl-8 pr-4 text-xs' : 'h-7 pl-7 pr-3 text-[11px]';
  const rivet = size === 'lg' ? 'left-2.5 h-3 w-[11px]' : 'left-2 h-2.5 w-[9px]';

  return (
    <span
      className={cn(
        'relative inline-flex items-center rounded-[4px] border font-mono uppercase tracking-[0.08em]',
        pad,
        onDark
          ? 'border-white/20 bg-white/[0.06] text-porcelain'
          : 'border-line bg-gradient-to-b from-white to-porcelain text-ink-900',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('absolute top-1/2 -translate-y-1/2', rivet, cognac ? 'bg-cognac-500' : 'bg-decart-500')}
        style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}
      />
      {code}
      {label ? <span className={cn('ml-1.5', onDark ? 'text-steel-400' : 'text-steel-600')}>· {label}</span> : null}
    </span>
  );
}
