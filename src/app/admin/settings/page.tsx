import { hasDb } from '@/lib/db';
import { getSettings } from '@/lib/repo';
import { SettingsForm, type SettingsDraft } from '@/components/admin/SettingsForm';
import { SITE } from '@/lib/site';

export const dynamic = 'force-dynamic';

const defaults: SettingsDraft = {
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  emailPrimary: SITE.emailPrimary,
  mailRoutingJson: JSON.stringify({ default: [SITE.emailPrimary] }, null, 2),
  addressFactory: SITE.addressFactory,
  addressShowroom: '',
  mapUrl: SITE.mapUrl,
  hours: SITE.hours,
  gstin: SITE.gstin,
  social: { instagram: '', linkedin: '', facebook: '', x: '' },
  counters: { years: 10, models: 350, families: 30, clients: 40 },
  announcement: '',
  replySignature: `${SITE.legalName}\n${SITE.addressFactory}\n${SITE.phone} · ${SITE.emailPrimary}\nTrust is our Sign.`,
};

export default async function AdminSettingsPage() {
  if (!hasDb()) {
    return (
      <div className="rounded-card border border-warning/30 bg-warning/5 p-6">
        <h1 className="font-display text-2xl text-ink-950">Settings unavailable</h1>
        <p className="mt-3 text-sm text-steel-600">
          Set TURSO_DATABASE_URL to store site settings. Until then the site uses the values baked into{' '}
          <code className="font-mono">src/lib/site.ts</code>.
        </p>
      </div>
    );
  }

  const doc = await getSettings();

  const initial: SettingsDraft = doc
    ? {
        ...defaults,
        ...JSON.parse(JSON.stringify(doc)),
        mailRoutingJson: JSON.stringify(doc.mailRouting ?? { default: [SITE.emailPrimary] }, null, 2),
        social: { ...defaults.social, ...((doc.social as SettingsDraft['social']) ?? {}) },
        counters: { ...defaults.counters, ...((doc.counters as SettingsDraft['counters']) ?? {}) },
      }
    : defaults;

  return <SettingsForm initial={initial} />;
}
