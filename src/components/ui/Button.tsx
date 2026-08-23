import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-btn font-semibold transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-[0.9375rem]',
  lg: 'h-[52px] px-7 text-base',
};

/** `onDark` flips the primary/secondary treatment for ink.950 sections (§4.5). */
function styles(variant: ButtonVariant, onDark: boolean) {
  switch (variant) {
    case 'primary':
      return onDark
        ? 'bg-paper text-decart-700 hover:bg-decart-50'
        // 700, not the raw brand blue: white on #58B5E0 is 2.31:1 and on 600 still only 3.82:1
        : 'bg-decart-700 text-white shadow-pop hover:bg-decart-800';
    case 'secondary':
      return onDark
        ? 'border border-white/25 text-porcelain hover:border-white/60 hover:bg-white/5'
        : 'border border-line bg-paper text-ink-900 hover:border-ink-800';
    case 'whatsapp':
      return 'bg-[#25D366] text-white hover:bg-[#1FB855]';
    case 'ghost':
      return onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain';
  }
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onDark?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', onDark = false, className, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={cn(base, sizes[size], styles(variant, onDark), className)} {...rest}>
      {children}
    </button>
  );
});

type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
  'data-wa'?: string;
  prefetch?: boolean;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  onDark = false,
  external,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const classes = cn(base, sizes[size], styles(variant, onDark), className);
  const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);

  if (isExternal) {
    return (
      <a
        href={href}
        className={classes}
        {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}
