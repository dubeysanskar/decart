import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { AutoRefresh } from '@/components/admin/AutoRefresh';
import { ToastProvider } from '@/components/ui/Toast';
import { currentUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'DecArt Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The panel's own gate, independent of middleware.
 *
 * The middleware in front of /admin is the first line, but it must not be the only one:
 * CVE-2025-29927 showed a header that skipped Next middleware outright on versions before
 * 14.2.25, and this layout used to render whatever page was asked for, bare, when no session
 * was present. Now a page under the panel cannot render without a signed-in, active admin —
 * the check is the same DB-backed currentUser() the API routes use, so a deactivated account
 * is shut out of the pages the moment it is shut out of the API.
 *
 * The login page lives in its own route group, (auth), so it is not behind this gate.
 */
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect('/admin/login');

  return (
    <ToastProvider>
      <AutoRefresh />
      <AdminShell user={{ name: user.name || 'Admin', email: user.email }}>{children}</AdminShell>
    </ToastProvider>
  );
}
