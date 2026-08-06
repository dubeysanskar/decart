'use client';

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// fixed 16px radius: buttons went pill, but pill form fields read as search bars
const control =
  'w-full rounded-2xl border bg-paper px-4 text-base text-ink-900 placeholder:text-steel-400 transition-colors focus:border-decart-600 disabled:bg-porcelain disabled:text-steel-600';

function Wrapper({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-900">
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-steel-600">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, wrapperClassName, id, required, ...rest },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <Wrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={wrapperClassName}>
      <input
        id={inputId}
        ref={ref}
        required={required}
        aria-invalid={!!error}
        className={cn(control, 'h-12', error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
    </Wrapper>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, wrapperClassName, id, required, rows = 4, ...rest },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <Wrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        id={inputId}
        ref={ref}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={cn(control, 'py-3 leading-relaxed', error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
    </Wrapper>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, wrapperClassName, id, required, children, ...rest },
  ref,
) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <Wrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint} className={wrapperClassName}>
      <select
        id={inputId}
        ref={ref}
        required={required}
        aria-invalid={!!error}
        className={cn(control, 'h-12 appearance-none bg-[length:16px] pr-10', error ? 'border-danger' : 'border-line', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%235C6670' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
        }}
        {...rest}
      >
        {children}
      </select>
    </Wrapper>
  );
});

/** Honeypot — bots fill it, humans never see it (§10.2). */
export function Honeypot({ register }: { register?: Record<string, unknown> }) {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" {...register} />
    </div>
  );
}
