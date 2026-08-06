'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';

export type SettingsDraft = {
  phone: string;
  whatsapp: string;
  emailPrimary: string;
  mailRoutingJson: string;
  addressFactory: string;
  addressShowroom: string;
  mapUrl: string;
  hours: string;
  gstin: string;
  social: { instagram: string; linkedin: string; facebook: string; x: string };
  counters: { years: number; models: number; families: number; clients: number };
  announcement: string;
  replySignature: string;
};

export function SettingsForm({ initial }: { initial: SettingsDraft }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const set = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  async function save() {
    let mailRouting: Record<string, string[]>;
    try {
      mailRouting = JSON.parse(draft.mailRoutingJson);
      setJsonError('');
    } catch {
      setJsonError('That is not valid JSON.');
      return;
    }

    setBusy(true);
    const { mailRoutingJson, ...rest } = draft;
    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rest, mailRouting }),
    });
    setBusy(false);

    toast.push(res.ok ? 'Settings saved and pages revalidated.' : 'Could not save settings.', res.ok ? 'success' : 'error');
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Settings</h1>
          <p className="mt-1 text-sm text-steel-600">Contact details, routing and counters used across the site.</p>
        </div>
        <Button onClick={save} disabled={busy}>
          {busy ? <HexSpinner /> : null} Save settings
        </Button>
      </div>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Contact</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input label="Phone" value={draft.phone} onChange={(e) => set('phone', e.target.value)} />
          <Input
            label="WhatsApp number"
            value={draft.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            hint="Digits only, with country code — e.g. 919311942001"
          />
          <Input label="Primary email" value={draft.emailPrimary} onChange={(e) => set('emailPrimary', e.target.value)} />
          <Input label="Working hours" value={draft.hours} onChange={(e) => set('hours', e.target.value)} />
          <Input label="GSTIN" value={draft.gstin} onChange={(e) => set('gstin', e.target.value)} />
          <Input label="Google Maps URL" value={draft.mapUrl} onChange={(e) => set('mapUrl', e.target.value)} />
          <Textarea
            label="Factory address"
            rows={3}
            value={draft.addressFactory}
            onChange={(e) => set('addressFactory', e.target.value)}
          />
          <Textarea
            label="Showroom address"
            rows={3}
            value={draft.addressShowroom}
            onChange={(e) => set('addressShowroom', e.target.value)}
            hint="Leave blank to hide the showroom block"
          />
        </div>
      </section>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Mail routing</h2>
        <p className="mt-2 text-sm text-steel-600">
          Which mailbox receives which query type. Switching domains is a change here, not in code.
        </p>
        <Textarea
          label="Routing JSON"
          rows={8}
          value={draft.mailRoutingJson}
          onChange={(e) => set('mailRoutingJson', e.target.value)}
          error={jsonError}
          className="font-mono text-sm"
          wrapperClassName="mt-4"
        />
        <Textarea
          label="Signature for inbox replies"
          rows={4}
          value={draft.replySignature}
          onChange={(e) => set('replySignature', e.target.value)}
          wrapperClassName="mt-4"
        />
      </section>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Counters &amp; announcement</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {(['years', 'models', 'families', 'clients'] as const).map((key) => (
            <Input
              key={key}
              label={key}
              type="number"
              value={draft.counters[key]}
              onChange={(e) => set('counters', { ...draft.counters, [key]: Number(e.target.value) })}
              className="capitalize"
            />
          ))}
        </div>
        <Input
          label="Announcement bar"
          value={draft.announcement}
          onChange={(e) => set('announcement', e.target.value)}
          hint="Leave blank to hide"
          wrapperClassName="mt-4"
        />
      </section>

      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Social</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {(['instagram', 'linkedin', 'facebook', 'x'] as const).map((key) => (
            <Input
              key={key}
              label={key === 'x' ? 'X (Twitter)' : key}
              value={draft.social[key]}
              onChange={(e) => set('social', { ...draft.social, [key]: e.target.value })}
              className="capitalize"
              placeholder="https://"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
