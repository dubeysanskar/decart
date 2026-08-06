'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Download, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { LEAD_STATUSES, DISPOSITIONS, LEAD_TYPES, LEAD_TYPE_LABEL, type LeadType } from '@/lib/site';
import { formatDateTime, cn } from '@/lib/utils';

export type InboxRow = {
  id: string;
  createdAt: string;
  name: string;
  company: string;
  type: string;
  phone: string;
  email: string;
  city: string;
  productCode: string;
  status: string;
  disposition: string;
  assignedTo: string;
  isRead: boolean;
};

const TYPE_TONE: Record<string, string> = {
  contact: 'bg-steel-400/15 text-steel-600',
  quote: 'bg-decart-50 text-decart-700',
  bulk: 'bg-cognac-500/15 text-cognac-600',
  dealer: 'bg-success/12 text-success',
  oem: 'bg-ink-900/10 text-ink-900',
  custom: 'bg-warning/15 text-warning',
};

const STATUS_TONE: Record<string, string> = {
  new: 'text-decart-700',
  contacted: 'text-ink-900',
  quoted: 'text-cognac-600',
  negotiation: 'text-warning',
  won: 'text-success',
  lost: 'text-steel-600',
  junk: 'text-steel-400',
};

export function InboxTable({ rows, total }: { rows: InboxRow[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(rows);
  const [query, setQuery] = useState(params.get('q') ?? '');

  const tab = params.get('tab') ?? 'all';
  const queryString = params.toString();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(queryString);
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.push(`/admin/inbox?${next.toString()}`));
  };

  /** Optimistic inline update — the row changes immediately, the API confirms. */
  async function patch(id: string, body: Record<string, unknown>) {
    setLocal((current) => current.map((row) => (row.id === id ? { ...row, ...(body as object) } : row)));
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      toast.push('Could not save that change.', 'error');
      router.refresh();
      return;
    }
    toast.push('Saved.');
  }

  const exportHref = (format: 'xlsx' | 'csv') => {
    const next = new URLSearchParams(queryString);
    next.delete('tab');
    next.set('format', format);
    return `/api/leads/export?${next.toString()}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Inbox</h1>
          <p className="mt-1 text-sm text-steel-600">
            {local.length} shown · {total} total queries
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={exportHref('xlsx')}
            className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink-900 px-4 text-sm font-semibold text-porcelain hover:bg-ink-800"
          >
            <Download aria-hidden className="h-4 w-4" />
            Download .xlsx
          </a>
          <a
            href={exportHref('csv')}
            className="inline-flex h-11 items-center rounded-btn border border-line bg-paper px-4 text-sm font-semibold text-ink-900 hover:border-ink-800"
          >
            .csv
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'needs-reply', label: 'Needs reply' },
          { id: 'won', label: 'Won' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setParam('tab', item.id === 'all' ? '' : item.id)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium',
              tab === item.id ? 'border-ink-900 bg-ink-900 text-porcelain' : 'border-line bg-paper text-steel-600',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam('q', query);
        }}
        className="flex flex-wrap gap-3 rounded-card border border-line bg-paper p-4"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, company, phone, email, code"
            aria-label="Search queries"
            className="h-11 w-full rounded-btn border border-line pl-9 pr-3 text-sm focus:border-decart-600"
          />
        </div>

        <select
          value={params.get('type') ?? ''}
          onChange={(e) => setParam('type', e.target.value)}
          aria-label="Filter by type"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">All types</option>
          {LEAD_TYPES.map((type) => (
            <option key={type} value={type}>
              {LEAD_TYPE_LABEL[type]}
            </option>
          ))}
        </select>

        <select
          value={params.get('status') ?? ''}
          onChange={(e) => setParam('status', e.target.value)}
          aria-label="Filter by status"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={params.get('disposition') ?? ''}
          onChange={(e) => setParam('disposition', e.target.value)}
          aria-label="Filter by disposition"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        >
          <option value="">Any disposition</option>
          {DISPOSITIONS.filter(Boolean).map((disposition) => (
            <option key={disposition} value={disposition}>
              {disposition}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={params.get('from') ?? ''}
          onChange={(e) => setParam('from', e.target.value)}
          aria-label="From date"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        />
        <input
          type="date"
          value={params.get('to') ?? ''}
          onChange={(e) => setParam('to', e.target.value)}
          aria-label="To date"
          className="h-11 rounded-btn border border-line px-3 text-sm"
        />

        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          Apply
        </Button>
      </form>

      <div className="overflow-x-auto rounded-card border border-line bg-paper">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              {['', 'Date', 'Name', 'Type', 'Product', 'Phone', 'Status', 'Disposition', ''].map((head, i) => (
                <th key={i} className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-steel-600">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {local.map((row) => (
              <tr key={row.id} className={cn('hover:bg-porcelain', !row.isRead && 'bg-decart-50/40')}>
                <td className="px-3 py-2.5">
                  <span
                    className={cn('block h-2 w-2 rounded-full', row.isRead ? 'bg-line' : 'bg-decart-500')}
                    title={row.isRead ? 'Read' : 'Unread'}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-steel-600">
                  {formatDateTime(row.createdAt)}
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/admin/inbox/${row.id}`} className="font-medium text-ink-950 hover:text-decart-700">
                    {row.name}
                  </Link>
                  {row.company ? <p className="text-xs text-steel-600">{row.company}</p> : null}
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', TYPE_TONE[row.type])}>
                    {LEAD_TYPE_LABEL[row.type as LeadType] ?? row.type}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-steel-600">{row.productCode || '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <a href={`tel:${row.phone}`} className="font-mono text-[11px] text-decart-700 hover:underline">
                    {row.phone}
                  </a>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={row.status}
                    onChange={(e) => patch(row.id, { status: e.target.value })}
                    aria-label={`Status for ${row.name}`}
                    className={cn('rounded-btn border border-line bg-paper px-2 py-1 text-xs', STATUS_TONE[row.status])}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <select
                    value={row.disposition}
                    onChange={(e) => patch(row.id, { disposition: e.target.value })}
                    aria-label={`Disposition for ${row.name}`}
                    className="rounded-btn border border-line bg-paper px-2 py-1 text-xs text-steel-600"
                  >
                    {DISPOSITIONS.map((disposition) => (
                      <option key={disposition || 'none'} value={disposition}>
                        {disposition || '—'}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/admin/inbox/${row.id}`} aria-label={`Open ${row.name}`} className="text-steel-400 hover:text-ink-900">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {!local.length ? (
              <tr>
                <td colSpan={9} className="px-3 py-12 text-center text-sm text-steel-600">
                  No queries match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
