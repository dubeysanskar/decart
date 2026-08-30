'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Keeps the admin listings current without a manual reload (client: "all the option in admin only
 * works on refresh, its not auto").
 *
 * Next keeps a client-side router cache, so walking back to /admin/inbox re-renders the payload it
 * already had — a lead that arrived in the meantime simply is not in it. router.refresh() refetches
 * the server components and busts that cache.
 *
 * Two triggers, both cheap:
 *   - the tab regaining focus, which is when a stale screen is actually looked at
 *   - a poll while the tab is visible, so a screen left open still catches new enquiries
 *
 * Editors are deliberately excluded. A refresh there would re-run the server render underneath a
 * half-typed blog post or category description, and any field seeded from server props would snap
 * back to its saved value.
 */
const LIVE_ROUTES = ['/admin', '/admin/inbox', '/admin/products', '/admin/reviews', '/admin/blog', '/admin/projects'];

const POLL_MS = 20_000;

export function AutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshing = useRef(false);

  // a list route only — /admin/inbox yes, /admin/inbox/abc123 no
  const live = LIVE_ROUTES.includes(pathname);

  useEffect(() => {
    if (!live) return;

    const refresh = () => {
      if (document.visibilityState !== 'visible' || refreshing.current) return;
      refreshing.current = true;
      router.refresh();
      // refresh() is fire-and-forget, so throttle by time rather than by completion
      window.setTimeout(() => {
        refreshing.current = false;
      }, 2_000);
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    const timer = window.setInterval(refresh, POLL_MS);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [live, router, pathname]);

  return null;
}
