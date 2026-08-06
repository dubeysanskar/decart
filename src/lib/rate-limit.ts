/**
 * Small in-memory sliding window. Good enough for a single-region deploy and the traffic
 * this site sees; swap for Upstash if the site ever runs multi-region.
 */
type Hit = { count: number; resetAt: number };

const globalForLimiter = globalThis as unknown as { _rateLimit?: Map<string, Hit> };
const store = globalForLimiter._rateLimit ?? new Map<string, Hit>();
globalForLimiter._rateLimit = store;

export function rateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const hit = store.get(key);

  if (!hit || hit.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

export function clientIp(req: Request) {
  const h = req.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    h.get('cf-connecting-ip') ||
    'unknown'
  );
}

/** Housekeeping so the map can't grow without bound in a long-lived process. */
export function sweep() {
  const now = Date.now();
  for (const [key, hit] of store) if (hit.resetAt < now) store.delete(key);
}
