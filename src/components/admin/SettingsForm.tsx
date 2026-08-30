'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { SMTP_UNCHANGED } from '@/lib/validators';

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
  /** hasPassword tells the form one is stored without the password ever reaching the browser */
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    fromName: string;
    fromEmail: string;
    hasPassword?: boolean;
  };
};

export function SettingsForm({ initial }: { initial: SettingsDraft }) {
  const router = useRouter();
  const toast = useToast();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState('');
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
      body: JSON.stringify({
        ...rest,
        mailRouting,
        // an empty box means "leave the stored password alone", never "clear it"
        smtp: { ...draft.smtp, pass: draft.smtp.pass || SMTP_UNCHANGED },
      }),
    });
    setBusy(false);

    toast.push(res.ok ? 'Settings saved and pages revalidated.' : 'Could not save settings.', res.ok ? 'success' : 'error');
    if (res.ok) router.refresh();
  }

  const setSmtp = <K extends keyof SettingsDraft['smtp']>(key: K, value: SettingsDraft['smtp'][K]) =>
    setDraft((d) => ({ ...d, smtp: { ...d.smtp, [key]: value } }));

  async function sendTest() {
    setTesting(true);
    const res = await fetch('/api/settings/test-mail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: testTo }),
    });
    const json = await res.json().catch(() => null);
    setTesting(false);
    toast.push(
      res.ok ? `Test sent to ${json?.data?.to}. Check the inbox.` : json?.error ?? 'The test send failed.',
      res.ok ? 'success' : 'error',
    );
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

      {/* Outgoing email. Kept in Settings because the environment cannot be edited on a
          deployed host without a redeploy — anything left blank falls back to the env value. */}
      <section className="rounded-card border border-line bg-paper p-5">
        <h2 className="text-lg font-semibold text-ink-950">Outgoing email (SMTP)</h2>
        <p className="mt-1 text-sm text-steel-600">
          Where enquiry alerts, customer acknowledgements and quotations are sent from. Leave a field
          empty to keep using the server&rsquo;s own setting.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Input
            label="SMTP host"
            value={draft.smtp.host}
            onChange={(e) => setSmtp('host', e.target.value.trim())}
            placeholder="smtp.gmail.com"
          />
          <Input
            label="Port"
            type="number"
            value={String(draft.smtp.port)}
            onChange={(e) => setSmtp('port', Number(e.target.value))}
            hint="587 for STARTTLS, 465 for implicit TLS"
          />
          <Input
            label="Username"
            value={draft.smtp.user}
            onChange={(e) => setSmtp('user', e.target.value.trim())}
            autoComplete="off"
          />
          <Input
            label="Password"
            type="password"
            value={draft.smtp.pass}
            onChange={(e) => setSmtp('pass', e.target.value)}
            autoComplete="new-password"
            placeholder={draft.smtp.hasPassword ? 'Stored — type to replace it' : 'App password'}
            hint={
              draft.smtp.hasPassword
                ? 'A password is saved. Leave this empty to keep it.'
                : 'Gmail needs an app password, not the account password.'
            }
          />
          <Input
            label="From name"
            value={draft.smtp.fromName}
            onChange={(e) => setSmtp('fromName', e.target.value)}
            placeholder="DecArt Industries"
          />
          <Input
            label="From address"
            type="email"
            value={draft.smtp.fromEmail}
            onChange={(e) => setSmtp('fromEmail', e.target.value.trim())}
            hint="Defaults to the username"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <Input
            label="Send a test to"
            type="email"
            wrapperClassName="min-w-0 flex-1"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value.trim())}
            placeholder={draft.smtp.user || 'you@example.com'}
          />
          <Button type="button" variant="secondary" onClick={sendTest} disabled={testing || busy}>
            {testing ? <HexSpinner /> : null}
            Send test email
          </Button>
        </div>
        <p className="mt-2 text-xs text-steel-600">
          Save first — the test uses the stored settings, and reports the mail server&rsquo;s own error
          if it fails.
        </p>
      </section>
    </div>
  );
}
