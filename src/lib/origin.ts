import 'server-only';
import { headers } from 'next/headers';
import { SITE } from './site';

/**
 * The origin this request actually arrived on.
 *
 * SITE.url is the canonical domain and is right for metadata and the sitemap — but it is a
 * build-time constant. While the site lived on a vercel.app preview and SITE.url pointed at
 * the old WordPress domain, a quotation link built from it landed on a 404 on somebody else's
 * site. Anything a person is meant to click is built from the host that served them, so it
 * keeps working on the live domain, on a preview, and on localhost alike.
 */
export function requestOrigin(): string {
  try {
    const h = headers();
    // Vercel and most proxies set the forwarded pair; host is the direct fallback
    const host = h.get('x-forwarded-host') ?? h.get('host');
    if (!host) return SITE.url;
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  } catch {
    // called outside a request (a script, a build step) — the canonical domain is the best guess
    return SITE.url;
  }
}

/** Absolute URL on the host that served this request. */
export const absoluteUrl = (path: string) => `${requestOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
