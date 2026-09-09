'use client';

import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useEnquiry } from './EnquiryProvider';
import { cn } from '@/lib/utils';

/**
 * The header's way in to the enquiry list.
 *
 * It only appears once there is something on the list. An always-visible empty basket in a
 * header that already carries a phone number, the brochure and the quote button is one more
 * thing to read for no gain — and a buyer who has added a chair has already seen the toast
 * telling them the list exists.
 */
export function EnquiryBadge({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const { summary, ready } = useEnquiry();
  if (!ready || !summary.lines) return null;

  return (
    <Link
      href="/enquiry"
      aria-label={`Enquiry list — ${summary.lines} ${summary.lines === 1 ? 'model' : 'models'}, ${summary.units} units`}
      className={cn(
        'relative flex h-11 w-11 items-center justify-center rounded-btn transition-colors',
        onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
        className,
      )}
    >
      <ClipboardList aria-hidden className="h-[18px] w-[18px]" />
      <span
        aria-hidden
        className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-decart-600 px-1 font-mono text-[10px] font-semibold text-white"
      >
        {summary.lines}
      </span>
    </Link>
  );
}

/** The same entry point spelled out, for the mobile drawer where icons alone read as decoration. */
export function EnquiryDrawerLink({ onClick }: { onClick?: () => void }) {
  const { summary, ready } = useEnquiry();
  if (!ready || !summary.lines) return null;

  return (
    <Link
      href="/enquiry"
      onClick={onClick}
      className="flex items-center justify-between border-b border-line py-4 text-base font-semibold text-ink-950"
    >
      <span className="flex items-center gap-2">
        <ClipboardList aria-hidden className="h-4 w-4 text-decart-700" />
        Enquiry list
      </span>
      <span className="font-mono text-xs text-steel-600">
        {summary.lines} · {summary.units} units
      </span>
    </Link>
  );
}
