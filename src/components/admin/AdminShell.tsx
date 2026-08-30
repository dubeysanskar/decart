'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutDashboard, Inbox, Package, Layers, Star, FileText, Settings, LogOut, ExternalLink, Menu, X,
  Images, Building2, HardHat,
} from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/projects', label: 'Projects', icon: HardHat },
  { href: '/admin/banners', label: 'Banners', icon: Images },
  { href: '/admin/clients', label: 'Clients', icon: Building2 },
  { href: '/admin/reviews', label: 'Testimonials', icon: Star },
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ user, children }: { user: { name: string; email: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const env = process.env.NODE_ENV === 'production' ? 'live' : 'dev';

  const nav = (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-ink-900 text-porcelain' : 'text-steel-600 hover:bg-porcelain hover:text-ink-900',
            )}
          >
            <Icon aria-hidden className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-porcelain">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper px-4 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" className="p-2">
          <Menu className="h-5 w-5" />
        </button>
        <Logo width={120} href={null} />
        <Link href="/" className="p-2 text-steel-600" aria-label="View site">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      <div className="flex">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-paper p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between">
            <Logo width={130} href="/admin" />
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="p-2 lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
            Admin · <span className={env === 'live' ? 'text-success' : 'text-warning'}>{env}</span>
          </p>

          <div className="mt-6 flex-1">{nav}</div>

          <div className="border-t border-line pt-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-steel-600 hover:bg-porcelain hover:text-ink-900"
            >
              <ExternalLink aria-hidden className="h-4 w-4" />
              View site
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-sm text-steel-600 hover:bg-porcelain hover:text-danger"
            >
              <LogOut aria-hidden className="h-4 w-4" />
              Log out
            </button>
            <p className="mt-3 truncate px-3 text-xs text-steel-400">{user.email}</p>
          </div>
        </aside>

        {open ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-ink-950/40 lg:hidden"
          />
        ) : null}

        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
