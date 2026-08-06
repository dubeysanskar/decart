'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Phone, Mail, MessageCircle, Send, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { LEAD_STATUSES, DISPOSITIONS, LEAD_TYPE_LABEL, type LeadType } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { formatDateTime, cn } from '@/lib/utils';

export type LeadView = {
  _id: string;
  type: string;
  name: string;
  company?: string;
  email?: string;
  phone: string;
  city?: string;
  message?: string;
  productSlug?: string;
  productCode?: string;
  quantity?: string;
  targetDate?: string;
  extra?: Record<string, string>;
  source?: { page?: string; utm?: Record<string, string> };
  status: string;
  disposition: string;
  assignedTo?: string;
  notes: { by: string; text: string; at: string }[];
  responses: { subject: string; body: string; sentTo: string; at: string; messageId?: string }[];
  mailStatus?: { admin?: string; ack?: string };
  createdAt: string;
};

export function LeadDetail({ lead }: { lead: LeadView }) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState(lead);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('Re: your DecArt query');
  const [body, setBody] = useState(
    `Namaste ${lead.name},\n\nThank you for your enquiry${lead.productCode ? ` about ${lead.productCode}` : ''}.\n\n`,
  );

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    const res = await fetch(`/api/leads/${lead._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setBusy(false);

    if (!res.ok) {
      toast.push('Could not save that.', 'error');
      return;
    }
    const json = await res.json();
    setState(JSON.parse(JSON.stringify(json.data)));
    setNote('');
    toast.push('Saved.');
    router.refresh();
  }

  async function sendReply() {
    if (!state.email) {
      toast.push('No email on this query — use WhatsApp or call.', 'error');
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/leads/${lead._id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body, to: state.email }),
    });
    setBusy(false);

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.push(json.error ?? 'Send failed.', 'error');
      return;
    }
    toast.push('Reply sent.');
    setComposing(false);
    router.refresh();
  }

  const waHref = waLink(
    WA.reply(state.name, LEAD_TYPE_LABEL[state.type as LeadType] ?? state.type, state.productCode ?? ''),
    `91${state.phone.replace(/\D/g, '').slice(-10)}`,
  );

  const timeline = [
    ...state.notes.map((n) => ({ kind: 'note' as const, at: n.at, by: n.by, text: n.text })),
    ...state.responses.map((r) => ({ kind: 'reply' as const, at: r.at, by: r.sentTo, text: `${r.subject}\n${r.body}` })),
    { kind: 'created' as const, at: state.createdAt, by: '', text: 'Query received from the website' },
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const facts: [string, string | undefined][] = [
    ['Type', LEAD_TYPE_LABEL[state.type as LeadType] ?? state.type],
    ['Company', state.company],
    ['City', state.city],
    ['Product', state.productCode],
    ['Quantity', state.quantity],
    ['Target date', state.targetDate],
    ...Object.entries(state.extra ?? {}).map(([k, v]) => [k.replace(/([A-Z])/g, ' $1'), v] as [string, string]),
    ['Source page', state.source?.page],
    ['Admin mail', state.mailStatus?.admin],
    ['Acknowledgement', state.mailStatus?.ack],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/inbox" className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to inbox
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">{state.name}</h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
            {formatDateTime(state.createdAt)} IST
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${state.phone}`}
            className="inline-flex h-11 items-center gap-2 rounded-btn border border-line bg-paper px-4 text-sm font-semibold"
          >
            <Phone className="h-4 w-4" /> {state.phone}
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-btn bg-[#25D366] px-4 text-sm font-semibold text-white"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          {state.email ? (
            <button
              type="button"
              onClick={() => setComposing((v) => !v)}
              className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink-900 px-4 text-sm font-semibold text-porcelain"
            >
              <Mail className="h-4 w-4" /> Respond by email
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">The query</h2>
            <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-900">
              {state.message || <span className="text-steel-400">No message supplied.</span>}
            </p>

            <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-line pt-4 sm:grid-cols-2">
              {facts
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 text-sm">
                    <dt className="capitalize text-steel-600">{label}</dt>
                    <dd className="text-right text-ink-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </section>

          {composing ? (
            <section className="rounded-card border border-decart-300 bg-decart-50/40 p-5">
              <h2 className="text-lg font-semibold text-ink-950">Reply to {state.email}</h2>
              <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} wrapperClassName="mt-4" />
              <Textarea label="Message" rows={10} value={body} onChange={(e) => setBody(e.target.value)} wrapperClassName="mt-4" />
              <p className="mt-2 text-xs text-steel-600">
                Sent through the site’s SMTP with the DecArt header and your Settings signature.
              </p>
              <div className="mt-4 flex gap-3">
                <Button onClick={sendReply} disabled={busy}>
                  {busy ? <HexSpinner /> : <Send className="h-4 w-4" />} Send reply
                </Button>
                <Button variant="secondary" onClick={() => setComposing(false)}>
                  Cancel
                </Button>
              </div>
            </section>
          ) : null}

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Timeline</h2>
            <ul className="mt-4 space-y-4">
              {timeline.map((entry, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    className={cn(
                      'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      entry.kind === 'reply' ? 'bg-decart-500' : entry.kind === 'created' ? 'bg-success' : 'bg-line',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm text-ink-900">{entry.text}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-steel-400">
                      {formatDateTime(entry.at)}
                      {entry.by ? ` · ${entry.by}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="text-lg font-semibold text-ink-950">Manage</h2>
            <Select
              label="Status"
              value={state.status}
              onChange={(e) => patch({ status: e.target.value })}
              wrapperClassName="mt-4"
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
            <Select
              label="Disposition"
              value={state.disposition}
              onChange={(e) => patch({ disposition: e.target.value })}
              wrapperClassName="mt-4"
            >
              {DISPOSITIONS.map((disposition) => (
                <option key={disposition || 'none'} value={disposition}>
                  {disposition || '—'}
                </option>
              ))}
            </Select>
            <Input
              label="Assigned to"
              defaultValue={state.assignedTo}
              onBlur={(e) => e.target.value !== state.assignedTo && patch({ assignedTo: e.target.value })}
              wrapperClassName="mt-4"
              placeholder="Sales desk"
            />
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => patch({ status: 'junk' })}
              disabled={busy || state.status === 'junk'}
            >
              Mark as junk
            </Button>
          </section>

          <section className="rounded-card border border-line bg-paper p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-950">
              <StickyNote className="h-4 w-4 text-steel-600" /> Internal note
            </h2>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} wrapperClassName="mt-3" />
            <Button className="mt-3 w-full" disabled={!note.trim() || busy} onClick={() => patch({ note })}>
              Add note
            </Button>
          </section>

          {state.productSlug ? (
            <Link
              href={`/products`}
              className="rounded-card border border-line bg-paper p-5 text-sm font-semibold text-decart-700 hover:border-decart-300"
            >
              View {state.productCode} on the site →
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
