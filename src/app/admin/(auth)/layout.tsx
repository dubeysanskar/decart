import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'DecArt Admin',
  robots: { index: false, follow: false },
};

// the sign-in form reads ?callbackUrl= on the client, which a statically prerendered page cannot
export const dynamic = 'force-dynamic';

/** The sign-in screen: no shell, no session required — the one admin route that is public. */
export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
