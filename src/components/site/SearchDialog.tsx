'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X, CornerDownLeft, ArrowUpRight } from 'lucide-react';
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

/** Where people actually go. Shown instead of an empty panel before anything is typed. */
const SUGGESTIONS = [
  { label: 'Mesh chairs', href: '/products/mesh' },
  { label: 'Executive chairs', href: '/products/executive' },
  { label: 'Task seating', href: '/products/task-mesh' },
  { label: 'Conference tables', href: '/products/conference' },
  { label: 'Workstations', href: '/products/workstation' },
  { label: 'Reception desks', href: '/products/reception' },
];

/**
 * Search, from the header.
 *
 * Thirty families and 540 model codes cannot be browsed, and a buyer usually arrives holding
 * the code off a spec sheet. The dropdown answers as they type; Enter opens the full results
 * page for the times a word matches forty models.
 *
 * Arrow keys walk the results and Enter opens the highlighted one, because a search box that
 * makes you reach for the mouse to accept its own answer is half a search box.
 */
export function SearchDialog({ onDark = false, className }: { onDark?: boolean; className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<Hits>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(0);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setHits(EMPTY);
    setActive(-1);
  }, []);

  /** Every result in the order it is drawn — what the arrow keys walk. */
  const rows = useMemo(
    () => [
      ...hits.products.map((p) => ({ href: `/products/${p.family}/${p.slug}`, key: `p:${p.slug}` })),
      ...hits.families.map((f) => ({ href: `/products/${f.slug}`, key: `f:${f.slug}` })),
      ...hits.posts.map((b) => ({ href: `/blog/${b.slug}`, key: `b:${b.slug}` })),
      ...hits.projects.map((j) => ({ href: `/projects/${j.slug}`, key: `j:${j.slug}` })),
    ],
    [hits],
  );

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
    setActive(-1);
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

  const seeAll = useCallback(() => {
    const q = query.trim();
    if (q.length < 2) return;
    close();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }, [query, close, router]);

  function onFormKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (!rows.length) return;
      event.preventDefault();
      setActive((current) => {
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const next = current + step;
        if (next < 0) return rows.length - 1;
        if (next >= rows.length) return 0;
        return next;
      });
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    // Enter takes the highlighted result if there is one, and the results page otherwise
    if (active >= 0 && rows[active]) {
      const href = rows[active].href;
      close();
      router.push(href);
      return;
    }
    seeAll();
  }

  const typed = query.trim();
  const rowClass = (index: number) =>
    cn(
      'group flex items-center gap-3 px-3 py-2.5 transition-colors',
      index === active ? 'bg-porcelain' : 'hover:bg-porcelain',
    );

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
        <div className="fixed inset-0 z-[70] flex items-start justify-center p-3 pt-16 sm:p-4 sm:pt-24">
          <button
            type="button"
            aria-label="Close search"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink-950/50 backdrop-blur-[3px]"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative w-full max-w-xl overflow-hidden rounded-card bg-paper shadow-[0_32px_80px_-24px_rgb(15_19_23/0.45)] ring-1 ring-ink-950/10"
          >
            <form onSubmit={submit} onKeyDown={onFormKeyDown} className="flex items-center gap-2.5 px-3.5 py-2.5">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-steel-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search models, codes, categories…"
                aria-label="Search the catalogue"
                autoComplete="off"
                spellCheck={false}
                /* the site-wide focus ring draws a box round the whole field here, which reads
                   as an error state in a search bar — the caret is the affordance */
                className="h-10 w-full bg-transparent text-[0.9375rem] text-ink-900 placeholder:text-steel-400 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {typed ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  aria-label="Clear the search"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-steel-600 hover:bg-porcelain"
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={close}
                className="hidden shrink-0 rounded-btn border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-steel-600 hover:bg-porcelain sm:block"
              >
                Esc
              </button>
            </form>

            <div className="max-h-[min(60vh,26rem)] overflow-y-auto overscroll-contain border-t border-line p-1.5">
              {typed.length < 2 ? (
                <div className="p-2">
                  <p className="px-1 font-mono text-[10px] uppercase tracking-[0.16em] text-steel-400">
                    Popular categories
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={close}
                        className="rounded-full border border-line px-3 py-1.5 text-[0.8125rem] text-ink-900 transition-colors hover:border-ink-800 hover:bg-porcelain"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <p className="mt-4 px-1 text-xs leading-relaxed text-steel-600">
                    Model codes work best — the code printed on the spec sheet, like{' '}
                    <span className="font-mono text-ink-900">DS-701</span>. Words work too:{' '}
                    <span className="text-ink-900">high back mesh</span>.
                  </p>
                </div>
              ) : busy && !hits.total ? (
                <p className="px-3 py-6 text-sm text-steel-600">Searching…</p>
              ) : !hits.total ? (
                <div className="px-3 py-5">
                  <p className="text-sm font-semibold text-ink-950">Nothing matched “{typed}”.</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel-600">
                    We print 350+ models and not all are online yet — the sales desk has the full catalogue in front of
                    them.
                  </p>
                  <Link
                    href="/quote"
                    onClick={close}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-decart-700 hover:underline"
                  >
                    Ask us instead
                    <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <>
                  {hits.products.length ? (
                    <Group title="Models">
                      {hits.products.map((product, i) => (
                        <Link
                          key={product.slug}
                          href={`/products/${product.family}/${product.slug}`}
                          onClick={close}
                          onMouseEnter={() => setActive(i)}
                          className={cn(rowClass(i), 'rounded-btn')}
                        >
                          {/* a 40px tile is too small for the branded plate's wording, so an
                              un-photographed model shows the head of its code instead */}
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[10px] border border-line bg-paper">
                            {product.image ? (
                              <ProductImage src={product.image} alt={product.name} sizes="40px" imgClassName="p-1" />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center bg-porcelain font-mono text-[9px] uppercase tracking-tight text-steel-400">
                                {product.code.replace(/[^A-Za-z0-9]/g, '').slice(0, 3)}
                              </span>
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-ink-950">{product.name}</span>
                            <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-steel-400">
                              {product.code}
                            </span>
                          </span>
                          <ArrowUpRight
                            aria-hidden
                            className="h-3.5 w-3.5 shrink-0 text-steel-400 opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </Link>
                      ))}
                    </Group>
                  ) : null}

                  {hits.families.length ? (
                    <Group title="Categories">
                      {hits.families.map((family, i) => {
                        const index = hits.products.length + i;
                        return (
                          <Link
                            key={family.slug}
                            href={`/products/${family.slug}`}
                            onClick={close}
                            onMouseEnter={() => setActive(index)}
                            className={cn(rowClass(index), 'justify-between rounded-btn')}
                          >
                            <span className="truncate text-sm font-semibold text-ink-950">{family.name}</span>
                            <span className="shrink-0 font-mono text-[10px] text-steel-400">
                              {family.count} models
                            </span>
                          </Link>
                        );
                      })}
                    </Group>
                  ) : null}

                  {hits.posts.length ? (
                    <Group title="Articles">
                      {hits.posts.map((post, i) => {
                        const index = hits.products.length + hits.families.length + i;
                        return (
                          <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            onClick={close}
                            onMouseEnter={() => setActive(index)}
                            className={cn(rowClass(index), 'rounded-btn text-sm text-ink-900')}
                          >
                            <span className="min-w-0 flex-1 truncate">{post.title}</span>
                          </Link>
                        );
                      })}
                    </Group>
                  ) : null}

                  {hits.projects.length ? (
                    <Group title="Projects">
                      {hits.projects.map((project, i) => {
                        const index = hits.products.length + hits.families.length + hits.posts.length + i;
                        return (
                          <Link
                            key={project.slug}
                            href={`/projects/${project.slug}`}
                            onClick={close}
                            onMouseEnter={() => setActive(index)}
                            className={cn(rowClass(index), 'justify-between rounded-btn')}
                          >
                            <span className="truncate text-sm text-ink-900">{project.title}</span>
                            <span className="shrink-0 text-[11px] text-steel-600">{project.client}</span>
                          </Link>
                        );
                      })}
                    </Group>
                  ) : null}
                </>
              )}
            </div>

            {/* the footer only has something to say once there is a query behind it */}
            {typed.length >= 2 && hits.total ? (
              <button
                type="button"
                onClick={seeAll}
                className="flex w-full items-center justify-between gap-3 border-t border-line bg-porcelain px-4 py-3 text-left text-xs text-steel-600 transition-colors hover:text-ink-950"
              >
                <span className="min-w-0 truncate">
                  See every result for <span className="font-semibold text-ink-950">{typed}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 font-mono">
                  <CornerDownLeft aria-hidden className="h-3.5 w-3.5" />
                  Enter
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="px-1.5 py-1.5">
      <h2 className="px-1.5 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-steel-400">{title}</h2>
      {children}
    </section>
  );
}
