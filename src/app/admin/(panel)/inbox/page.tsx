import { hasDb } from '@/lib/db';
import { listLeads, countLeads, type LeadFilter } from '@/lib/repo';
import { InboxTable, type InboxRow } from '@/components/admin/InboxTable';

export const dynamic = 'force-dynamic';

type Search = {
  q?: string;
  type?: string;
  status?: string;
  disposition?: string;
  from?: string;
  to?: string;
  tab?: string;
};

export default async function InboxPage({ searchParams }: { searchParams: Search }) {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Inbox unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">Set TURSO_DATABASE_URL to capture and manage queries.</p>
      </div>
    );
  }

  const filter: LeadFilter = {};
  if (searchParams.type) filter.type = searchParams.type;
  if (searchParams.status) filter.status = searchParams.status;
  if (searchParams.disposition) filter.disposition = searchParams.disposition;
  if (searchParams.tab === 'needs-reply') {
    filter.status = undefined;
    filter.statusIn = ['new', 'contacted'];
  }
  if (searchParams.tab === 'won') filter.status = 'won';
  if (searchParams.q) filter.q = searchParams.q;
  if (searchParams.from) filter.from = searchParams.from;
  if (searchParams.to) filter.to = searchParams.to;

  const [rows, total] = await Promise.all([listLeads(filter, 300), countLeads({})]);

  const data: InboxRow[] = rows.map((lead) => ({
    id: lead._id,
    createdAt: lead.createdAt,
    name: lead.name,
    company: lead.company,
    type: lead.type,
    phone: lead.phone,
    email: lead.email,
    city: lead.city,
    productCode: lead.productCode,
    status: lead.status,
    disposition: lead.disposition,
    assignedTo: lead.assignedTo,
    isRead: lead.isRead,
  }));

  return <InboxTable rows={data} total={total} />;
}
