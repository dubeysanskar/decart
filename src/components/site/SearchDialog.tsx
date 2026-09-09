'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { cn } from '@/lib/utils';

type Hits = {
  query: string;
  total: number;
  products: { slug: string; family: string; code: string; name: string; image: string | null }[];
  families: { slug: string; name: string; count: number }[];
  posts: { slug: string; title: string }[];
  projects: { slug: string; title: string; client: string }[];
};

const EMPTY: Hits = { query: '', total: 0, products: [], families: [], posts: [], projects: [] };

/**
 * Search, from the header.
 *
 * Thirty families and 540 model codes cannot be browsed, and a buyer usually arrives holding
 * the code off a spec sheet. The dropdown answers as they type; Enter opens the full results
 * page for the times a word matches forty models.
 */
export function SearchDialog({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hits>(EMPTY);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHits(EMPTY);
  }, []);

  // ⌘K / Ctrl-K to open, Escape to leave — the shortcuts anyone who searches already knows
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === 'Escape' && open) close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    // the panel mounts, then takes the caret
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits(EMPTY);
      setBusy(false);
      return;
    }
    setBusy(true);
    // debounced: one request per pause in typing, not one per keystroke
    const timer = window.setTimeout(async () => {
      const ticket = ++latest.current;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const json = await res.json().catch(() => null);
        // a slow earlier request must not overwrite a newer answer
        if (ticket !== latest.current) return;
        setHits(json?.ok ? (json.data as Hits) : EMPTY);
      } catch {
        if (ticket === latest.current) setHits(EMPTY);
      } finally {
        if (ticket === latest.current) setBusy(false);
      }
    }, 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the catalogue"
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-btn transition-colors',
          onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
          className,
        )}
      >
        <Search aria-hidden className="h-[18px] w-[18px]" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-20 sm:pt-28">
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink-950/45 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-2xl overflow-hidden rounded-card border border-line bg-paper shadow-lift"
          >
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-4">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-steel-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Model code, chair type, family — e.g. DS-701 or high back mesh"
                aria-label="Search the catalogue"
                className="h-14 w-full bg-transparent text-[0.9375rem] text-ink-900 placeholder:text-steel-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                aria-label="Close search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain"
              >
                <X aria-hidden className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
              {query.trim().length < 2 ? (
                <p className="px-4 py-6 text-sm text-steel-600">
                  Type at least two characters. Model codes work best — the code printed on the spec sheet.
                </p>
              ) : busy && !hits.total ? (
                <p className="px-4 py-6 text-sm text-steel-600">Searching…</p>
              ) : !hits.total ? (
                <div className="px-4 py-6">
                  <p className="text-sm font-semibold text-ink-950">Nothing matched “{query.trim()}”.</p>
                  <p className="mt-1 text-sm text-steel-600">
                    We print 350+ models and not all are online yet — ask the sales desk and they will find it.
                  </p>
                  <Link href="/quote" onClick={close} className="mt-3 inline-block text-sm font-semibold text-decart-700 hover:underline">
                    Ask us instead →
                  </Link>
                </div>
              ) : (
                <>
                  {hits.products.length ? (
                    <Group title="Models">
                      {hits.products.map((product) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.family}/${product.slug}`}
                          onClick={close}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-porcelain"
                        >
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-btn border border-line bg-paper">
                            <ProductImage src={product.image ?? undefined} alt={product.name} label={product.code} sizes="44px" imgClassName="p-1" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-ink-950">{product.name}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                              {product.code}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </Group>
                  ) : null}

                  {hits.families.length ? (
                    <Group title="Categories">
                      {hits.families.map((family) => (
                        <Link
                          key={family.slug}
                          href={`/products/${family.slug}`}
                          onClick={close}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-porcelain"
                        >
                          <span className="truncate text-sm font-semibold text-ink-950">{family.name}</span>
                          <span className="shrink-0 font-mono text-[10px] text-steel-400">{family.count} models</span>
                        </Link>
                      ))}
                    </Group>
                  ) : null}

                  {hits.posts.length ? (
                    <Group title="Articles">
                      {hits.posts.map((post) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} onClick={close} className="block px-4 py-2.5 text-sm text-ink-900 hover:bg-porcelain">
                          {post.title}
                        </Link>
                      ))}
                    </Group>
                  ) : null}

                  {hits.projects.length ? (
                    <Group title="Projects">
                      {hits.projects.map((project) => (
                        <Link
                          key={project.slug}
                          href={`/projects/${project.slug}`}
                          onClick={close}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-porcelain"
                        >
                          <span className="truncate text-sm text-ink-900">{project.title}</span>
                          <span className="shrink-0 text-[11px] text-steel-600">{project.client}</span>
                        </Link>
                      ))}
                    </Group>
                  ) : null}
                </>
              )}
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={query.trim().length < 2}
              className="flex w-full items-center justify-between border-t border-line bg-porcelain px-4 py-3 text-left text-xs text-steel-600 transition-colors hover:text-ink-950 disabled:opacity-60"
            >
              See every result for “{query.trim() || '…'}”
              <span className="inline-flex items-center gap-1.5 font-mono">
                <CornerDownLeft aria-hidden className="h-3.5 w-3.5" />
                Enter
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-2 last:border-0">
      <h2 className="px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-steel-400">{title}</h2>
      {children}
    </section>
  );
}
