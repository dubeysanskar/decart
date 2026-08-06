'use client';

import { useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select, Textarea, Honeypot } from '@/components/ui/form';
import { HexSpinner } from '@/components/ui/bits';
import { leadSchema, fieldErrors, type LeadInput } from '@/lib/validators';
import { COPY, LEAD_TYPE_LABEL, SITE, type LeadType } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { BUILD_OPTIONS } from '@/data/specs';

/**
 * One form powers all six lead types (§10.2). A lead is never lost: on any failure the
 * WhatsApp fallback carries the same data the form collected.
 */
export function LeadForm({
  type,
  productSlug = '',
  productCode = '',
  productName = '',
  families = [],
  compact = false,
}: {
  type: LeadType;
  productSlug?: string;
  productCode?: string;
  productName?: string;
  families?: { slug: string; name: string }[];
  compact?: boolean;
}) {
  const pathname = usePathname();
  const startedAt = useRef(Date.now());
  const [values, setValues] = useState<Record<string, string>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    city: '',
    message: '',
    quantity: '',
    targetDate: '',
    family: '',
    currentBrands: '',
    monthlyVolume: '',
    castors: '',
    base: '',
    gasLift: '',
    armrests: '',
    mechanism: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValues((current) => ({ ...current, [key]: e.target.value }));

  const waFallback = useMemo(
    () =>
      waLink(
        WA.form({
          name: values.name,
          type: LEAD_TYPE_LABEL[type],
          product: productName,
          code: productCode,
          quantity: values.quantity,
          city: values.city,
          message: values.message,
        }),
      ),
    [values, type, productName, productCode],
  );

  function buildPayload(): LeadInput {
    const extra: Record<string, string> = {};
    if (type === 'dealer' && values.currentBrands) extra.currentBrands = values.currentBrands;
    if (type === 'oem' && values.monthlyVolume) extra.monthlyVolume = values.monthlyVolume;
    if (type === 'custom') {
      for (const key of ['castors', 'base', 'gasLift', 'armrests', 'mechanism'] as const) {
        if (values[key]) extra[key] = values[key];
      }
      if (values.family) extra.baseFamily = values.family;
    }
    if (type === 'bulk' && values.family) extra.family = values.family;

    return {
      type,
      name: values.name,
      company: values.company,
      email: values.email,
      phone: values.phone,
      city: values.city,
      message: values.message,
      productSlug,
      productCode,
      quantity: values.quantity,
      targetDate: values.targetDate,
      extra,
      page: pathname,
      utm: {},
      website: values.website,
      startedAt: startedAt.current,
    } as LeadInput;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = buildPayload();

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setState('sending');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.errors) setErrors(json.errors);
        setState('error');
        return;
      }
      setState('sent');
    } catch {
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-card border border-success/25 bg-success/5 p-6">
        <h2 className="font-display text-xl text-ink-950">Query received</h2>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-600">{COPY.success}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href={waFallback} variant="whatsapp" data-wa="form-success">
            Continue on WhatsApp
          </ButtonLink>
          <ButtonLink href={SITE.catalogueLocal} variant="secondary" external>
            Download catalogue
          </ButtonLink>
        </div>
      </div>
    );
  }

  const needsQuantity = type === 'bulk' || type === 'quote' || type === 'custom';
  const needsCompany = type === 'dealer' || type === 'oem' || type === 'bulk';

  return (
    <form onSubmit={onSubmit} className="relative flex flex-col gap-4" noValidate>
      <Honeypot />

      {productName ? (
        <div className="rounded-btn border border-line bg-porcelain p-3.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-steel-600">Enquiring about</p>
          <p className="mt-1 text-sm font-semibold text-ink-950">
            {productName} <span className="font-mono text-xs text-steel-600">{productCode}</span>
          </p>
        </div>
      ) : null}

      <div className={compact ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>
        <Input label="Name" name="name" required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
        <Input
          label="Phone / WhatsApp"
          name="phone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={set('phone')}
          error={errors.phone}
        />
      </div>

      <div className={compact ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>
        <Input
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          hint="So we can send the quotation"
        />
        <Input label="City" name="city" required={type === 'dealer'} value={values.city} onChange={set('city')} error={errors.city} />
      </div>

      {needsCompany ? (
        <Input
          label="Company"
          name="company"
          required={type === 'dealer' || type === 'oem'}
          value={values.company}
          onChange={set('company')}
          error={errors.company}
        />
      ) : null}

      {families.length && (type === 'bulk' || type === 'custom') ? (
        <Select label={type === 'custom' ? 'Base family' : 'Product family'} name="family" value={values.family} onChange={set('family')}>
          <option value="">Select a family</option>
          {families.map((family) => (
            <option key={family.slug} value={family.name}>
              {family.name}
            </option>
          ))}
        </Select>
      ) : null}

      {needsQuantity ? (
        <div className={compact ? 'grid gap-4' : 'grid gap-4 md:grid-cols-2'}>
          <Input
            label="Quantity"
            name="quantity"
            required={type === 'bulk'}
            inputMode="numeric"
            placeholder="e.g. 120 chairs"
            value={values.quantity}
            onChange={set('quantity')}
            error={errors.quantity}
          />
          {type === 'bulk' ? (
            <Input
              label="Target date"
              name="targetDate"
              placeholder="e.g. mid-March"
              value={values.targetDate}
              onChange={set('targetDate')}
            />
          ) : null}
        </div>
      ) : null}

      {type === 'dealer' ? (
        <Input
          label="Brands you currently deal in"
          name="currentBrands"
          value={values.currentBrands}
          onChange={set('currentBrands')}
        />
      ) : null}

      {type === 'oem' ? (
        <Input
          label="Monthly volume"
          name="monthlyVolume"
          placeholder="e.g. 500 units / month"
          value={values.monthlyVolume}
          onChange={set('monthlyVolume')}
        />
      ) : null}

      {type === 'custom' ? (
        <fieldset className="rounded-card border border-line p-4">
          <legend className="px-1 text-sm font-medium text-ink-900">Build options</legend>
          <div className="grid gap-4 md:grid-cols-2">
            {BUILD_OPTIONS.map((group) => {
              const key = group.label.replace(/\s+/g, '').replace(/^./, (c) => c.toLowerCase());
              return (
                <Select key={group.label} label={group.label} name={key} value={values[key] ?? ''} onChange={set(key)}>
                  <option value="">No preference</option>
                  {group.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <Textarea
        label={type === 'oem' ? 'Requirement details' : type === 'custom' ? 'Reference notes' : 'Message'}
        name="message"
        required={type === 'contact' || type === 'oem'}
        rows={compact ? 3 : 4}
        value={values.message}
        onChange={set('message')}
        error={errors.message}
        placeholder={
          type === 'custom'
            ? 'Describe the chair, or tell us you will send a reference photo on WhatsApp.'
            : 'Sizes, quantities, site city — anything that helps us quote accurately.'
        }
      />

      {state === 'error' ? (
        <div className="rounded-btn border border-danger/30 bg-danger/5 p-4">
          <p className="text-sm text-ink-900">{COPY.error}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <ButtonLink href={waFallback} size="sm" variant="whatsapp" data-wa="form-error">
              Send on WhatsApp
            </ButtonLink>
            <ButtonLink href={SITE.phoneHref} size="sm" variant="secondary">
              Call {SITE.phone}
            </ButtonLink>
          </div>
        </div>
      ) : null}

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={state === 'sending'}>
          {state === 'sending' ? (
            <>
              <HexSpinner /> Sending…
            </>
          ) : (
            'Send enquiry'
          )}
        </Button>
        <a
          href={waFallback}
          target="_blank"
          rel="noopener noreferrer"
          data-wa="form-alt"
          className="text-sm font-semibold text-decart-700 hover:underline"
        >
          or send it on WhatsApp
        </a>
      </div>

      <p className="text-xs leading-relaxed text-steel-600">{COPY.formHelper}</p>
    </form>
  );
}
