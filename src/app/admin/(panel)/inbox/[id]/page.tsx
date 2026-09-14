import { notFound } from 'next/navigation';
import { hasDb } from '@/lib/db';
import { leadById, markLeadRead } from '@/lib/repo';
import { LeadDetail, type LeadView } from '@/components/admin/LeadDetail';

export const dynamic = 'force-dynamic';

export default async function LeadPage({ params }: { params: { id: string } }) {
  if (!hasDb()) notFound();

  const lead = await leadById(params.id).catch(() => null);
  if (!lead) notFound();

  // opening the detail marks it read
  if (!lead.isRead) await markLeadRead(lead._id);

  const view: LeadView = JSON.parse(JSON.stringify({ ...lead, isRead: true }));
  return <LeadDetail lead={view} />;
}
