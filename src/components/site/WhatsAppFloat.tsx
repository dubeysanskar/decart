'use client';

import { usePathname } from 'next/navigation';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/**
 * Floating WhatsApp button (§10.1) — every public page, bottom-right.
 * Sits above the sticky PDP action bar on mobile.
 */
export function WhatsAppFloat() {
  const pathname = usePathname();
  const aboveStickyBar = /^\/products\/[^/]+\/[^/]+/.test(pathname) || pathname.startsWith('/quote');

  return (
    <a
      href={waLink(WA.float())}
      target="_blank"
      rel="noopener noreferrer"
      data-wa="float"
      aria-label="Chat with DecArt on WhatsApp"
      className={cn(
        'fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift animate-wa-pulse',
        'transition-transform hover:scale-105 focus-visible:scale-105 md:right-6 md:bottom-6',
        aboveStickyBar ? 'bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6' : 'bottom-5',
      )}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22Z" />
      </svg>
    </a>
  );
}
