'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

/**
 * Mobile sticky action bar (§11.4) — Call · WhatsApp · Get Quote.
 * Appears once the hero has scrolled past and hides again over the footer.
 */
export function StickyActionBar({ waHref, quoteHref }: { waHref: string; quoteHref: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const nearFooter = y + window.innerHeight > document.body.scrollHeight - 380;
      setVisible(y > 420 && !nearFooter);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        'safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur transition-transform duration-300 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="flex items-center gap-2">
        <a
          href={SITE.phoneHref}
          data-call
          aria-label={`Call ${SITE.phone}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-btn border border-line text-ink-900"
        >
          <Phone className="h-5 w-5" />
        </a>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          data-wa="pdp-bar"
          // min-w-0: without it a flex child refuses to shrink below its text width, so at 390px
          // the three actions together overflowed the bar and forced the whole page wider.
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-btn bg-[#25D366] font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
        <Link
          href={quoteHref}
          className="flex h-12 min-w-0 flex-[1.2] items-center justify-center whitespace-nowrap rounded-btn bg-ink-900 font-semibold text-porcelain"
        >
          Get Quote
        </Link>
      </div>
    </div>
  );
}
