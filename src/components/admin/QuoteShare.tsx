'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Mail, MessageCircle, Printer, Check, Ban } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { QUOTE_STATUS_LABEL, type QuoteStatus } from '@/lib/quote-calc';

/**
 * The three distribution channels from the spec — WhatsApp, email, shareable link — plus print.
 *
 * Each one tells the server, so "sent" is recorded once and the activity trail shows which
 * channel it went out on. WhatsApp and copy-link open on the client; only email actually sends
 * from the server.
 */
export function QuoteShare({
  id,
  number,
  link,
  status,
  clientEmail,
  clientPhone,
  total,
}: {
  id: string;
  number: string;
  link: string;
  status: QuoteStatus;
  clientEmail: string;
  clientPhone: string;
  total: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState('');

  async function announce(channel: 'email' | 'whatsapp' | 'link', to?: string) {
    setBusy(channel);
    const res = await fetch(`/api/quotations/${id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, to }),
    });
    const json = await res.json().catch(() => null);
    setBusy('');
    if (!res.ok) {
      toast.push(json?.error ?? 'That did not go through.', 'error');
      return false;
    }
    router.refresh();
    return true;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      toast.push('Link copied.', 'success');
    } catch {
      // clipboard is blocked in some embedded browsers — the link is on screen to copy by hand
      toast.push('Could not copy automatically — select the link and copy it.', 'error');
    }
    await announce('link');
  }

  async function shareWhatsApp() {
    const text = `Quotation ${number} from DecArt Industries — ${total}\n${link}`;
    const phone = clientPhone.replace(/[^\d]/g, '');
    const to = phone.length >= 10 ? `91${phone.slice(-10)}` : '';
    window.open(`https://wa.me/${to}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    await announce('whatsapp');
  }

  async function sendEmail() {
    if (!clientEmail) {
      toast.push('This client has no email address on file.', 'error');
      return;
    }
    if (await announce('email', clientEmail)) toast.push(`Emailed to ${clientEmail}.`, 'success');
  }

  async function setStatus(next: QuoteStatus, confirmFirst = false) {
    if (confirmFirst && !window.confirm(`Mark ${number} as ${QUOTE_STATUS_LABEL[next].toLowerCase()}?`)) return;
    setBusy(next);
    const res = await fetch(`/api/quotations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setBusy('');
    if (!res.ok) {
      const json = await res.json().catch(() => null);
      toast.push(json?.error ?? 'Could not update the status.', 'error');
      return;
    }
    toast.push(`Marked ${QUOTE_STATUS_LABEL[next].toLowerCase()}.`, 'success');
    router.refresh();
  }

  const closed = ['accepted', 'rejected', 'cancelled', 'expired'].includes(status);

  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-paper p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink-950">Share it</h2>
        <p className="mt-1 text-sm text-steel-600">
          Every channel records who sent it and when, and the link reports back when the client opens it.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Button type="button" onClick={shareWhatsApp} disabled={Boolean(busy)} variant="whatsapp">
          {busy === 'whatsapp' ? <HexSpinner /> : <MessageCircle className="h-4 w-4" />}
          WhatsApp
        </Button>
        <Button type="button" onClick={sendEmail} disabled={Boolean(busy)}>
          {busy === 'email' ? <HexSpinner /> : <Mail className="h-4 w-4" />}
          Email the client
        </Button>
        <Button type="button" variant="secondary" onClick={copyLink} disabled={Boolean(busy)}>
          {busy === 'link' ? <HexSpinner /> : <Link2 className="h-4 w-4" />}
          Copy link
        </Button>
        <Button type="button" variant="secondary" onClick={() => window.open(`${link}?print=1`, '_blank', 'noopener')}>
          <Printer className="h-4 w-4" />
          Print / save PDF
        </Button>
      </div>

      <p className="break-all rounded-btn border border-line bg-porcelain px-3 py-2 font-mono text-[11px] text-steel-600">
        {link}
      </p>

      {!closed ? (
        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
          <Button type="button" size="sm" variant="secondary" onClick={() => setStatus('accepted', true)} disabled={Boolean(busy)}>
            <Check className="h-4 w-4" />
            Mark accepted
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => setStatus('rejected', true)} disabled={Boolean(busy)}>
            Mark rejected
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setStatus('cancelled', true)} disabled={Boolean(busy)}>
            <Ban className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      ) : null}
    </div>
  );
}
