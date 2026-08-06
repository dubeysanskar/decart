import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';
import { ToastProvider } from '@/components/ui/Toast';
import { auth } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'DecArt Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // the login route renders bare; everything else is behind middleware anyway
  if (!session?.user) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <AdminShell user={{ name: session.user.name ?? 'Admin', email: session.user.email ?? '' }}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
