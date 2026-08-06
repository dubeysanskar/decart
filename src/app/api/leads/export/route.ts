import * as XLSX from 'xlsx';
import { listLeads, type LeadFilter } from '@/lib/repo';
import { requireAdmin } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const COLUMNS = [
  'Date',
  'Type',
  'Name',
  'Company',
  'Email',
  'Phone',
  'City',
  'Product',
  'Code',
  'Qty',
  'Message',
  'Status',
  'Disposition',
  'Assigned',
  'Source page',
  'Last response at',
  'Notes count',
];

/**
 * GET /api/leads/export?from&to&type&status&disposition&format=xlsx|csv
 * The Inbox "Download" button — honours the current filter set (§10.4).
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'csv' ? 'csv' : 'xlsx';

  const filter: LeadFilter = {};
  for (const key of ['type', 'status', 'disposition', 'assignedTo', 'from', 'to'] as const) {
    const value = url.searchParams.get(key);
    if (value) filter[key] = value;
  }

  const leads = await listLeads(filter, 100000);

  const rows = leads.map((lead) => ({
    Date: formatDateTime(lead.createdAt as unknown as Date),
    Type: String(lead.type).toUpperCase(),
    Name: lead.name,
    Company: lead.company ?? '',
    Email: lead.email ?? '',
    Phone: lead.phone,
    City: lead.city ?? '',
    Product: lead.productSlug ?? '',
    Code: lead.productCode ?? '',
    Qty: lead.quantity ?? '',
    Message: lead.message ?? '',
    Status: lead.status,
    Disposition: lead.disposition ?? '',
    Assigned: lead.assignedTo ?? '',
    'Source page': lead.source?.page ?? '',
    'Last response at': lead.responses?.length
      ? formatDateTime(lead.responses[lead.responses.length - 1].at as unknown as Date)
      : '',
    'Notes count': lead.notes?.length ?? 0,
  }));

  const sheet = XLSX.utils.json_to_sheet(rows, { header: COLUMNS });
  sheet['!cols'] = COLUMNS.map((column) => ({ wch: column === 'Message' ? 60 : Math.max(12, column.length + 4) }));

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `decart-queries-${stamp}.${format}`;

  if (format === 'csv') {
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return new Response(`﻿${csv}`, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Queries');
  const buffer = XLSX.write(book, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
