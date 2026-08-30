'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Plus, Trash2, ArrowLeft, ArrowRight, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/form';
import { useToast } from '@/components/ui/Toast';
import { HexSpinner } from '@/components/ui/bits';
import { INDIA_STATES } from '@/data/india-locations';
import { priceItem, quoteTotals, formatINR, type PricingMode } from '@/lib/quote-calc';
import { cn } from '@/lib/utils';

type Client = {
  _id: string;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  pan: string;
};

type ProductHit = {
  _id: string;
  code: string;
  name: string;
  family: string;
  priceAmount: number;
  images?: { src: string; alt?: string }[];
};

type Line = {
  key: string;
  productId: string;
  code: string;
  name: string;
  family: string;
  image: string;
  mrp: number;
  mode: PricingMode;
  discountPct: number;
  unitPrice: number;
  qty: number;
  note: string;
};

const STEPS = ['Client', 'Products', 'Pricing', 'Preview'] as const;

const blankClient = {
  company: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gstin: '',
  pan: '',
};

/**
 * Quote Master's four-step wizard: client → products → pricing → preview.
 *
 * Totals shown here are computed with the same functions the API uses on save, so the number the
 * salesperson reads is the number that gets stored. The server recomputes regardless — this is
 * for feedback while typing, never the source of truth.
 */
export function QuoteWizard() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // step 1
  const [clientQuery, setClientQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftClient, setDraftClient] = useState(blankClient);

  // step 2
  const [productQuery, setProductQuery] = useState('');
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);

  // step 3
  const [taxRate, setTaxRate] = useState(18);
  const [title, setTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Prices are ex-works Faridabad unless stated. Delivery 2–3 weeks from confirmed PO.');

  const totals = useMemo(
    () => quoteTotals(lines, { taxRate, clientState: client?.state ?? '' }),
    [lines, taxRate, client?.state],
  );

  /* ------------------------------------------------------------ client search */
  const clientTimer = useRef<number>();
  useEffect(() => {
    window.clearTimeout(clientTimer.current);
    clientTimer.current = window.setTimeout(async () => {
      const res = await fetch(`/api/quote-clients?q=${encodeURIComponent(clientQuery)}`).catch(() => null);
      const json = await res?.json().catch(() => null);
      setClients(json?.data ?? []);
    }, 250);
    return () => window.clearTimeout(clientTimer.current);
  }, [clientQuery]);

  async function saveClient() {
    if (draftClient.company.trim().length < 2) {
      toast.push('The company name is required.', 'error');
      return;
    }
    setBusy(true);
    const res = await fetch('/api/quote-clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draftClient),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      toast.push(json?.errors ? Object.values(json.errors).join(' ') : 'Could not save the client.', 'error');
      return;
    }
    setClient(json.data);
    setCreating(false);
    setDraftClient(blankClient);
    toast.push('Client saved.', 'success');
  }

  /* ------------------------------------------------------------ product search */
  const productTimer = useRef<number>();
  useEffect(() => {
    if (!productQuery.trim()) {
      setHits([]);
      return;
    }
    setSearching(true);
    window.clearTimeout(productTimer.current);
    productTimer.current = window.setTimeout(async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(productQuery)}&limit=12`).catch(() => null);
      const json = await res?.json().catch(() => null);
      setHits((json?.data?.rows ?? []).slice(0, 12));
      setSearching(false);
    }, 250);
    return () => window.clearTimeout(productTimer.current);
  }, [productQuery]);

  function addProduct(hit: ProductHit) {
    setLines((current) => [
      ...current,
      {
        key: `${hit._id}-${current.length}`,
        productId: hit._id,
        code: hit.code,
        name: hit.name,
        family: hit.family,
        image: hit.images?.[0]?.src ?? '',
        mrp: hit.priceAmount ?? 0,
        mode: 'price',
        discountPct: 0,
        // seeding the unit price from MRP means a line is never quoted at zero by accident
        unitPrice: hit.priceAmount ?? 0,
        qty: 1,
        note: '',
      },
    ]);
  }

  function addCustomLine() {
    setLines((current) => [
      ...current,
      {
        key: `custom-${Date.now()}`,
        productId: '',
        code: '',
        name: '',
        family: '',
        image: '',
        mrp: 0,
        mode: 'price',
        discountPct: 0,
        unitPrice: 0,
        qty: 1,
        note: '',
      },
    ]);
  }

  const setLine = (key: string, patch: Partial<Line>) =>
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const removeLine = (key: string) => setLines((current) => current.filter((line) => line.key !== key));

  /* ------------------------------------------------------------ submit */
  async function generate() {
    setBusy(true);
    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: client?._id,
        title,
        notes,
        terms,
        taxRate,
        validUntil,
        items: lines.map((line) => ({
          productId: line.productId,
          code: line.code,
          name: line.name,
          family: line.family,
          image: line.image,
          mrp: line.mrp,
          mode: line.mode,
          discountPct: line.discountPct,
          unitPrice: line.unitPrice,
          qty: line.qty,
          note: line.note,
        })),
      }),
    });
    const json = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      toast.push(json?.errors ? Object.values(json.errors).join(' ') : 'Could not generate the quotation.', 'error');
      return;
    }
    toast.push(`${json.data.number} generated.`, 'success');
    router.push(`/admin/quotations/${json.data._id}`);
  }

  const canAdvance = step === 0 ? Boolean(client) : step === 1 ? lines.length > 0 : true;
  const namedLines = lines.every((line) => line.name.trim());

  return (
    <div className="flex flex-col gap-5">
      {/* step rail */}
      <ol className="flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className={cn(
                'flex items-center gap-2 rounded-btn px-3 py-2 text-sm transition-colors',
                i === step
                  ? 'bg-ink-900 font-semibold text-porcelain'
                  : i < step
                    ? 'bg-porcelain text-ink-950 hover:bg-decart-50'
                    : 'text-steel-400',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold',
                  i === step ? 'bg-porcelain text-ink-900' : i < step ? 'bg-decart-600 text-white' : 'bg-line text-steel-600',
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 ? <span aria-hidden className="h-px w-4 bg-line" /> : null}
          </li>
        ))}
      </ol>

      {/* ------------------------------------------------------------ step 1 */}
      {step === 0 ? (
        <section className="rounded-card border border-line bg-paper p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink-950">Who is this for?</h2>
              <p className="mt-1 text-sm text-steel-600">
                Pick a client you have quoted before, or add a new one. Saved once, reused on every quotation.
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreating((v) => !v)}>
              <Plus className="h-4 w-4" />
              {creating ? 'Cancel' : 'New client'}
            </Button>
          </div>

          {creating ? (
            <div className="mt-5 grid gap-3 rounded-card border border-line bg-porcelain p-4 md:grid-cols-2">
              <Input
                label="Company"
                value={draftClient.company}
                onChange={(e) => setDraftClient({ ...draftClient, company: e.target.value })}
              />
              <Input
                label="Contact person"
                value={draftClient.contactPerson}
                onChange={(e) => setDraftClient({ ...draftClient, contactPerson: e.target.value })}
              />
              <Input
                label="Phone"
                value={draftClient.phone}
                onChange={(e) => setDraftClient({ ...draftClient, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={draftClient.email}
                onChange={(e) => setDraftClient({ ...draftClient, email: e.target.value })}
              />
              <Textarea
                label="Address"
                rows={2}
                wrapperClassName="md:col-span-2"
                value={draftClient.address}
                onChange={(e) => setDraftClient({ ...draftClient, address: e.target.value })}
              />
              <Input
                label="City"
                value={draftClient.city}
                onChange={(e) => setDraftClient({ ...draftClient, city: e.target.value })}
              />
              <Select
                label="State"
                hint="Decides CGST + SGST or IGST on the quotation"
                value={draftClient.state}
                onChange={(e) => setDraftClient({ ...draftClient, state: e.target.value })}
              >
                <option value="">Select a state</option>
                {INDIA_STATES.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <Input
                label="PIN code"
                value={draftClient.pincode}
                onChange={(e) => setDraftClient({ ...draftClient, pincode: e.target.value })}
              />
              <Input
                label="GSTIN"
                value={draftClient.gstin}
                onChange={(e) => setDraftClient({ ...draftClient, gstin: e.target.value.toUpperCase() })}
              />
              <Input
                label="PAN"
                value={draftClient.pan}
                onChange={(e) => setDraftClient({ ...draftClient, pan: e.target.value.toUpperCase() })}
              />
              <div className="md:col-span-2">
                <Button type="button" onClick={saveClient} disabled={busy}>
                  {busy ? <HexSpinner /> : null}
                  Save client
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mt-5">
                <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
                <input
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                  placeholder="Search by company, contact, phone or GSTIN"
                  aria-label="Search clients"
                  className="h-12 w-full rounded-btn border border-line bg-paper pl-10 pr-3 text-sm"
                />
              </div>

              <ul className="mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto">
                {clients.map((row) => (
                  <li key={row._id}>
                    <button
                      type="button"
                      onClick={() => setClient(row)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-card border p-3 text-left transition-colors',
                        client?._id === row._id ? 'border-ink-900 ring-1 ring-ink-900' : 'border-line hover:border-ink-800',
                      )}
                    >
                      <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-ink-950">{row.company}</span>
                        <span className="block truncate text-xs text-steel-600">
                          {[row.contactPerson, row.city, row.state, row.gstin].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                      {client?._id === row._id ? <Check className="ml-auto h-4 w-4 shrink-0 text-decart-700" /> : null}
                    </button>
                  </li>
                ))}
                {!clients.length ? (
                  <li className="rounded-card border border-dashed border-line p-6 text-center text-sm text-steel-600">
                    {clientQuery ? 'No client matches that.' : 'No clients yet — add the first one.'}
                  </li>
                ) : null}
              </ul>
            </>
          )}
        </section>
      ) : null}

      {/* ------------------------------------------------------------ step 2 */}
      {step === 1 ? (
        <section className="rounded-card border border-line bg-paper p-5">
          <h2 className="text-lg font-semibold text-ink-950">What are we quoting?</h2>
          <p className="mt-1 text-sm text-steel-600">
            Search the product master — the code, name, image and price come across automatically.
          </p>

          <div className="relative mt-4">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel-400" />
            <input
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              placeholder="Search by product name or code"
              aria-label="Search products"
              className="h-12 w-full rounded-btn border border-line bg-paper pl-10 pr-3 text-sm"
            />
          </div>

          {productQuery ? (
            <ul className="mt-3 flex max-h-72 flex-col gap-2 overflow-y-auto">
              {searching ? <li className="p-4 text-center text-sm text-steel-600">Searching…</li> : null}
              {!searching && !hits.length ? (
                <li className="p-4 text-center text-sm text-steel-600">Nothing matched.</li>
              ) : null}
              {hits.map((hit) => (
                <li key={hit._id}>
                  <button
                    type="button"
                    onClick={() => addProduct(hit)}
                    className="flex w-full items-center gap-3 rounded-card border border-line p-2.5 text-left hover:border-ink-800"
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-btn bg-porcelain">
                      {hit.images?.[0]?.src ? (
                        <Image src={hit.images[0].src} alt="" fill sizes="44px" className="object-contain p-1" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-950">{hit.name}</span>
                      <span className="block font-mono text-[11px] text-steel-400">
                        {hit.code} · {hit.family}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm text-steel-600">
                      {hit.priceAmount ? formatINR(hit.priceAmount) : 'no MRP'}
                    </span>
                    <Plus aria-hidden className="h-4 w-4 shrink-0 text-decart-700" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-sm font-semibold text-ink-950">
              {lines.length} {lines.length === 1 ? 'line' : 'lines'} added
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={addCustomLine}>
              <Plus className="h-4 w-4" />
              Custom line
            </Button>
          </div>

          {lines.length ? (
            <ul className="mt-3 flex flex-col gap-2">
              {lines.map((line) => (
                <li key={line.key} className="flex items-center gap-3 rounded-card border border-line p-3">
                  <span className="min-w-0 flex-1">
                    {line.productId ? (
                      <>
                        <span className="block truncate text-sm font-semibold text-ink-950">{line.name}</span>
                        <span className="block font-mono text-[11px] text-steel-400">{line.code}</span>
                      </>
                    ) : (
                      <Input
                        label="Description"
                        value={line.name}
                        onChange={(e) => setLine(line.key, { name: e.target.value })}
                        placeholder="e.g. Installation and freight"
                      />
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    aria-label={`Remove ${line.name || 'line'}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-steel-600 hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {/* ------------------------------------------------------------ step 3 */}
      {step === 2 ? (
        <section className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-card border border-line bg-paper">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-line bg-porcelain text-left">
                <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel-600">
                  <th className="p-3">Item</th>
                  <th className="p-3">MRP</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Discount %</th>
                  <th className="p-3">Unit price</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => {
                  const priced = priceItem(line);
                  return (
                    <tr key={line.key} className="border-b border-line last:border-0">
                      <td className="max-w-[220px] p-3">
                        <span className="block truncate font-semibold text-ink-950">{line.name || 'Untitled'}</span>
                        <span className="block font-mono text-[11px] text-steel-400">{line.code || 'custom'}</span>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={line.mrp}
                          onChange={(e) => setLine(line.key, { mrp: Number(e.target.value) })}
                          aria-label={`MRP for ${line.name}`}
                          className="h-9 w-24 rounded-btn border border-line px-2"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={line.mode}
                          onChange={(e) => setLine(line.key, { mode: e.target.value as PricingMode })}
                          aria-label={`Pricing mode for ${line.name}`}
                          className="h-9 rounded-btn border border-line px-2"
                        >
                          <option value="price">Price</option>
                          <option value="discount">Discount</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          disabled={line.mode !== 'discount'}
                          value={line.mode === 'discount' ? line.discountPct : priced.discountPct}
                          onChange={(e) => setLine(line.key, { discountPct: Number(e.target.value) })}
                          aria-label={`Discount for ${line.name}`}
                          className="h-9 w-20 rounded-btn border border-line px-2 disabled:bg-porcelain disabled:text-steel-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          disabled={line.mode !== 'price'}
                          value={line.mode === 'price' ? line.unitPrice : priced.unitPrice}
                          onChange={(e) => setLine(line.key, { unitPrice: Number(e.target.value) })}
                          aria-label={`Unit price for ${line.name}`}
                          className="h-9 w-28 rounded-btn border border-line px-2 disabled:bg-porcelain disabled:text-steel-400"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={1}
                          value={line.qty}
                          onChange={(e) => setLine(line.key, { qty: Number(e.target.value) })}
                          aria-label={`Quantity for ${line.name}`}
                          className="h-9 w-20 rounded-btn border border-line px-2"
                        />
                      </td>
                      <td className="p-3 text-right font-semibold text-ink-950">{formatINR(priced.lineTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-3 rounded-card border border-line bg-paper p-5">
              <Input label="Quotation title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 4th floor seating" />
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  label="GST %"
                  type="number"
                  value={String(taxRate)}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                <Input label="Valid until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              <Textarea label="Notes for the client" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
              <Textarea label="Terms" rows={3} value={terms} onChange={(e) => setTerms(e.target.value)} />
            </div>

            <dl className="flex flex-col gap-2 rounded-card border border-line bg-porcelain p-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-steel-600">Subtotal</dt>
                <dd className="font-semibold text-ink-950">{formatINR(totals.subtotal)}</dd>
              </div>
              {totals.interState ? (
                <div className="flex justify-between">
                  <dt className="text-steel-600">IGST {totals.taxRate}%</dt>
                  <dd className="text-ink-950">{formatINR(totals.igst)}</dd>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <dt className="text-steel-600">CGST {totals.taxRate / 2}%</dt>
                    <dd className="text-ink-950">{formatINR(totals.cgst)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-steel-600">SGST {totals.taxRate / 2}%</dt>
                    <dd className="text-ink-950">{formatINR(totals.sgst)}</dd>
                  </div>
                </>
              )}
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
                <dt className="font-semibold text-ink-950">Total</dt>
                <dd className="font-display text-xl font-semibold text-decart-700">{formatINR(totals.total)}</dd>
              </div>
              <p className="mt-2 text-xs text-steel-600">
                {client?.state
                  ? totals.interState
                    ? `${client.state} is outside Haryana, so IGST applies.`
                    : `${client.state} is intra-state, so CGST and SGST apply.`
                  : 'No client state set — treated as intra-state.'}
              </p>
            </dl>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ step 4 */}
      {step === 3 ? (
        <section className="rounded-card border border-line bg-paper p-5">
          <h2 className="text-lg font-semibold text-ink-950">Ready to generate</h2>
          <p className="mt-1 text-sm text-steel-600">
            A number is reserved the moment you generate, and it is never reused — so generate when the
            figures are right.
          </p>

          <dl className="mt-5 grid gap-4 rounded-card border border-line bg-porcelain p-4 sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Client</dt>
              <dd className="mt-1 text-sm font-semibold text-ink-950">{client?.company}</dd>
              <dd className="text-xs text-steel-600">
                {[client?.city, client?.state].filter(Boolean).join(', ')}
                {client?.gstin ? ` · ${client.gstin}` : ''}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Value</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-decart-700">{formatINR(totals.total)}</dd>
              <dd className="text-xs text-steel-600">
                {lines.length} {lines.length === 1 ? 'line' : 'lines'} · incl. {totals.taxRate}% GST
              </dd>
            </div>
          </dl>

          {!namedLines ? (
            <p className="mt-4 rounded-card border border-warning/30 bg-warning/5 p-3 text-sm text-steel-600">
              Every line needs a description before this can be generated.
            </p>
          ) : null}

          <Button type="button" onClick={generate} disabled={busy || !namedLines} className="mt-5">
            {busy ? <HexSpinner /> : null}
            Generate quotation
          </Button>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ nav */}
      <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
        <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
