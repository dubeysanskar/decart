'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, Phone, X, ChevronDown } from 'lucide-react';
import { Logo } from './Logo';
import { ButtonLink } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

export type NavFamily = { slug: string; name: string; group: string; count: number; lede: string; cover?: string };
export type NavGroup = { slug: string; name: string; families: NavFamily[] };

const LINKS = [
  { href: '/about', label: 'About' },
  { href: '/manufacturing', label: 'Manufacturing' },
  { href: '/clients', label: 'Clients' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Header({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  // bright "smart seating" design: the header is always the light bar, on every page
  const overlay = false;
  const [scrolled, setScrolled] = useState(!overlay);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(groups[0]?.slug ?? null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!overlay) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMegaOpen(false);
      setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onDark = overlay && !scrolled;

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const closeMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 120);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,height] duration-300',
        onDark ? 'border-b border-transparent bg-transparent' : 'border-b border-line bg-paper/95 backdrop-blur',
      )}
      onMouseLeave={closeMega}
    >
      <div className={cn('container-x flex items-center justify-between gap-4', scrolled ? 'h-16' : 'h-20')}>
        <Logo onDark={onDark} width={scrolled ? 150 : 170} />

        {/* desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <button
            type="button"
            onMouseEnter={openMega}
            onFocus={openMega}
            onClick={() => setMegaOpen((v) => !v)}
            aria-expanded={megaOpen}
            className={cn(
              'flex items-center gap-1 rounded-btn px-3 py-2 text-sm font-medium transition-colors',
              onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
              pathname.startsWith('/products') && (onDark ? 'bg-white/10' : 'bg-porcelain'),
            )}
          >
            Products
            <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform', megaOpen && 'rotate-180')} />
          </button>

          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-btn px-3 py-2 text-sm font-medium transition-colors',
                onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
                pathname.startsWith(link.href) && (onDark ? 'bg-white/10' : 'bg-porcelain'),
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={SITE.phoneHref}
            data-call
            className={cn(
              'hidden items-center gap-2 rounded-btn px-3 py-2 font-mono text-xs tracking-[0.06em] transition-colors md:inline-flex',
              onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
            )}
          >
            <Phone aria-hidden className="h-4 w-4" />
            {SITE.phone}
          </a>

          <ButtonLink href="/quote" size="sm" onDark={onDark} className="hidden sm:inline-flex">
            Get a Quote
          </ButtonLink>

          <a
            href={SITE.phoneHref}
            aria-label={`Call ${SITE.phone}`}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-btn md:hidden',
              onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
            )}
          >
            <Phone className="h-5 w-5" />
          </a>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-btn lg:hidden',
              onDark ? 'text-porcelain hover:bg-white/10' : 'text-ink-900 hover:bg-porcelain',
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* desktop mega-menu */}
      {megaOpen ? (
        <div
          onMouseEnter={openMega}
          onMouseLeave={closeMega}
          className="hidden border-t border-line bg-paper shadow-lift lg:block"
        >
          <div className="container-x grid grid-cols-3 gap-8 py-8">
            {groups.map((group) => (
              <div key={group.slug}>
                <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-600">{group.name}</p>
                <ul className="mt-4 space-y-0.5">
                  {group.families.map((family) => (
                    <li key={family.slug}>
                      <Link
                        href={`/products/${family.slug}`}
                        className="group flex items-baseline justify-between gap-3 rounded-btn px-2 py-1.5 hover:bg-porcelain"
                      >
                        <span className="text-sm text-ink-900 group-hover:text-decart-700">{family.name}</span>
                        <span className="font-mono text-[10px] tracking-[0.08em] text-steel-400">{family.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-line bg-porcelain">
            <div className="container-x flex items-center justify-between py-4">
              <p className="text-sm text-steel-600">
                Can’t find a model? We build to order — share a reference and we’ll quote it.
              </p>
              <div className="flex gap-3">
                <ButtonLink href="/products" variant="secondary" size="sm">
                  View all products
                </ButtonLink>
                <ButtonLink href="/quote?type=custom" size="sm">
                  Custom build
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden">
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5">
            <Logo width={150} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-btn text-ink-900 hover:bg-porcelain"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            {groups.map((group) => {
              const open = openGroup === group.slug;
              return (
                <div key={group.slug} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpenGroup(open ? null : group.slug)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between py-4 text-left text-base font-semibold text-ink-950"
                  >
                    {group.name}
                    <ChevronDown aria-hidden className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
                  </button>
                  {open ? (
                    <ul className="pb-3">
                      {group.families.map((family) => (
                        <li key={family.slug}>
                          <Link
                            href={`/products/${family.slug}`}
                            className="flex items-center justify-between py-3 text-[0.9375rem] text-steel-600"
                          >
                            {family.name}
                            <span className="font-mono text-[10px] text-steel-400">{family.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}

            <Link href="/products" className="block border-b border-line py-4 text-base font-semibold text-ink-950">
              All products
            </Link>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block border-b border-line py-4 text-base font-semibold text-ink-950"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/downloads" className="block border-b border-line py-4 text-base font-semibold text-ink-950">
              Downloads
            </Link>
          </div>

          <div className="safe-bottom shrink-0 border-t border-line bg-porcelain px-5 py-4">
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href={waLink(WA.float())} variant="whatsapp" data-wa="drawer">
                WhatsApp
              </ButtonLink>
              <ButtonLink href={SITE.phoneHref} variant="secondary">
                Call us
              </ButtonLink>
            </div>
            <ButtonLink href="/quote" className="mt-3 w-full">
              Get a Quote
            </ButtonLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
