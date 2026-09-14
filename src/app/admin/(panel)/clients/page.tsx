import { hasDb } from '@/lib/db';
import { listClients } from '@/lib/repo-content';
import { listPublic } from '@/lib/assets';
import { ClientManager, type ClientRow } from '@/components/admin/ClientManager';

export const dynamic = 'force-dynamic';

export default async function AdminClientsPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Clients unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to manage the client logo wall.</p>
      </div>
    );
  }
  const clients = (await listClients()) as ClientRow[];
  return <ClientManager clients={clients} fileLogos={listPublic('clients')} />;
}
