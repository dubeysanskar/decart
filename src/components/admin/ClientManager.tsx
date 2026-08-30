'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/form';
import { ImageField } from './ImageField';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';

export type ClientRow = {
  _id: string;
  name: string;
  logo: string;
  website: string;
  sector: string;
  status: string;
  order: number;
};

const EMPTY: Omit<ClientRow, '_id'> = {
  name: '',
  logo: '',
  website: '',
  sector: '',
  status: 'published',
  order: 0,
};

/** The client logo wall shown on the home page and /clients. */
export function ClientManager({ clients, fileLogos }: { clients: ClientRow[]; fileLogos: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Omit<ClientRow, '_id'>>(EMPTY);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function save() {
    if (!draft.name.trim()) {
      toast.push('A client needs a name.', 'error');
      return;
    }
    setBusy(true);
    const isNew = editing === 'new';
    const res = await fetch(isNew ? '/api/clients' : `/api/clients/${editing}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    setBusy(false);
    if (res.ok) {
      toast.push(isNew ? 'Client added.' : 'Client updated.', 'success');
      setEditing(null);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.push((json?.errors && (Object.values(json.errors)[0] as string)) || 'Could not save.', 'error');
    }
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    setBusy(false);
    toast.push(res.ok ? 'Client removed.' : 'Could not remove that client.', res.ok ? 'success' : 'error');
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink-950">Clients</h1>
          <p className="mt-1 text-sm text-steel-600">
            The logo wall on the home page and /clients. {clients.length} added.
          </p>
        </div>
        <Button
          onClick={() => {
            setDraft({ ...EMPTY, order: clients.length });
            setEditing('new');
          }}
        >
          <Plus className="h-4 w-4" /> Add client
        </Button>
      </div>

      {fileLogos.length ? (
        <p className="rounded-card border border-line bg-porcelain p-4 text-sm text-steel-600">
          {fileLogos.length} logo {fileLogos.length === 1 ? 'file' : 'files'} also sit in{' '}
          <code className="font-mono text-[12px]">/public/clients</code>. Those show automatically until you add
          clients here — once this list has entries, it takes over.
        </p>
      ) : null}

      {editing ? (
        <section className="rounded-card border border-decart-300 bg-paper p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink-950">
              {editing === 'new' ? 'New client' : 'Edit client'}
            </h2>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close editor"
              className="flex h-9 w-9 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <ImageField
              label="Logo"
              value={draft.logo}
              onChange={(src) => set('logo', src)}
              aspect="aspect-[3/2]"
              hint="A transparent PNG or SVG reads best on the wall."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Client name"
                required
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Marriott"
              />
              <Input
                label="Sector"
                value={draft.sector}
                onChange={(e) => set('sector', e.target.value)}
                placeholder="Hospitality"
              />
              <Input
                label="Website"
                value={draft.website}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://…"
              />
              <Input
                label="Order"
                type="number"
                value={String(draft.order)}
                onChange={(e) => set('order', Number(e.target.value))}
              />
              <Select label="Status" value={draft.status} onChange={(e) => set('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft (hidden)</option>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={busy}>
              {busy ? <HexSpinner /> : null}
              Save client
            </Button>
          </div>
        </section>
      ) : null}

      {clients.length ? (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {clients.map((client) => (
            <li key={client._id} className="flex flex-col overflow-hidden rounded-card border border-line bg-paper">
              <div className="relative flex h-24 items-center justify-center bg-porcelain p-3">
                {client.logo ? (
                  <Image src={client.logo} alt={client.name} fill sizes="220px" className="object-contain p-4" />
                ) : (
                  <span className="text-center text-sm font-semibold text-steel-600">{client.name}</span>
                )}
                {client.status !== 'published' ? (
                  <span className="absolute left-2 top-2 rounded-full bg-ink-950/80 px-2 py-0.5 text-[10px] text-porcelain">
                    Draft
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-950">{client.name}</p>
                  {client.sector ? <p className="truncate text-xs text-steel-600">{client.sector}</p> : null}
                </div>
                <div className="flex shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const { _id, ...rest } = client;
                      setDraft(rest);
                      setEditing(client._id);
                    }}
                    aria-label={`Edit ${client.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-btn text-steel-600 hover:bg-porcelain hover:text-ink-950"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(client._id)}
                    aria-label={`Remove ${client.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded-btn text-steel-600 hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-dashed border-line bg-paper p-10 text-center text-sm text-steel-600">
          No clients added yet.
        </p>
      )}
    </div>
  );
}
