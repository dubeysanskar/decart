import { Logo } from '@/components/site/Logo';
import { SITE } from '@/lib/site';
import { formatINR, quoteTotals, QUOTE_STATUS_LABEL } from '@/lib/quote-calc';
import type { QuotationRecord } from '@/lib/repo-quotes';

/**
 * The quotation itself, rendered once and used in three places: the admin preview, the public
 * link, and the print view the client saves as a PDF.
 *
 * The tax split is recomputed from the stored line items rather than stored separately, so the
 * CGST/SGST/IGST breakdown can never disagree with the totals sitting next to it.
 */
export function QuoteDocument({ quotation }: { quotation: QuotationRecord }) {
  const client = quotation.client;
  const totals = quoteTotals(quotation.items, {
    taxRate: quotation.taxRate,
    clientState: client?.state ?? '',
  });

  return (
    <article className="mx-auto max-w-4xl bg-paper p-6 text-ink-950 md:p-10 print:max-w-none print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
        <div className="min-w-0">
          <Logo width={160} href={null} />
          <address className="mt-4 not-italic text-xs leading-relaxed text-steel-600">
            {SITE.legalName}
            <br />
            {SITE.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            GSTIN {SITE.gstin}
          </address>
        </div>

        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">Quotation</p>
          <p className="mt-1 font-display text-2xl font-semibold text-ink-950">{quotation.number}</p>
          <p className="mt-1 text-xs text-steel-600">
            {new Date(quotation.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          {quotation.validUntil ? (
            <p className="text-xs text-steel-600">Valid until {quotation.validUntil}</p>
          ) : null}
          <p className="mt-2 inline-block rounded-full bg-porcelain px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-steel-600 print:hidden">
            {QUOTE_STATUS_LABEL[quotation.status]}
          </p>
        </div>
      </header>

      <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">Quotation for</p>
          <p className="mt-2 text-base font-semibold text-ink-950">{client?.company}</p>
          <address className="mt-1 not-italic text-sm leading-relaxed text-steel-600">
            {client?.contactPerson ? (
              <span className="block">{client.contactPerson}</span>
            ) : null}
            {client?.address ? <span className="block">{client.address}</span> : null}
            <span className="block">{[client?.city, client?.state, client?.pincode].filter(Boolean).join(', ')}</span>
            {client?.gstin ? <span className="block">GSTIN {client.gstin}</span> : null}
            {client?.phone ? <span className="block">{client.phone}</span> : null}
          </address>
        </div>

        <div className="min-w-0 sm:text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">Raised by</p>
          <p className="mt-2 text-sm font-semibold text-ink-950">{quotation.createdByName || SITE.shortName}</p>
          {quotation.office ? <p className="text-sm text-steel-600">{quotation.office}</p> : null}
          <p className="mt-1 text-sm text-steel-600">{SITE.phone}</p>
          <p className="text-sm text-steel-600">{SITE.emailPrimary}</p>
          {quotation.title ? (
            <p className="mt-3 text-sm font-semibold text-ink-950">{quotation.title}</p>
          ) : null}
        </div>
      </section>

      <div className="overflow-x-auto py-6">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-[10px] uppercase tracking-[0.1em] text-steel-600">
              <th className="pb-3 pr-3">#</th>
              <th className="pb-3 pr-3">Item</th>
              <th className="pb-3 pr-3 text-right">MRP</th>
              <th className="pb-3 pr-3 text-right">Disc.</th>
              <th className="pb-3 pr-3 text-right">Rate</th>
              <th className="pb-3 pr-3 text-right">Qty</th>
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items.map((item, i) => (
              <tr key={item._id} className="border-b border-line/70 align-top">
                <td className="py-3 pr-3 font-mono text-xs text-steel-400">{String(i + 1).padStart(2, '0')}</td>
                <td className="py-3 pr-3">
                  <span className="block font-semibold text-ink-950">{item.name}</span>
                  {item.code ? <span className="block font-mono text-[11px] text-steel-400">{item.code}</span> : null}
                  {item.note ? <span className="mt-1 block text-xs text-steel-600">{item.note}</span> : null}
                </td>
                <td className="py-3 pr-3 text-right text-steel-600">{item.mrp ? formatINR(item.mrp) : '—'}</td>
                <td className="py-3 pr-3 text-right text-steel-600">
                  {item.discountPct ? `${item.discountPct}%` : '—'}
                </td>
                <td className="py-3 pr-3 text-right text-ink-950">{formatINR(item.unitPrice)}</td>
                <td className="py-3 pr-3 text-right text-ink-950">{item.qty}</td>
                <td className="py-3 text-right font-semibold text-ink-950">{formatINR(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end border-t border-line pt-6">
        <dl className="w-full max-w-xs text-sm">
          <div className="flex justify-between py-1">
            <dt className="text-steel-600">Subtotal</dt>
            <dd className="text-ink-950">{formatINR(totals.subtotal)}</dd>
          </div>
          {totals.interState ? (
            <div className="flex justify-between py-1">
              <dt className="text-steel-600">IGST {totals.taxRate}%</dt>
              <dd className="text-ink-950">{formatINR(totals.igst)}</dd>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-1">
                <dt className="text-steel-600">CGST {totals.taxRate / 2}%</dt>
                <dd className="text-ink-950">{formatINR(totals.cgst)}</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-steel-600">SGST {totals.taxRate / 2}%</dt>
                <dd className="text-ink-950">{formatINR(totals.sgst)}</dd>
              </div>
            </>
          )}
          <div className="mt-2 flex justify-between border-t border-line pt-3">
            <dt className="font-semibold text-ink-950">Total</dt>
            <dd className="font-display text-xl font-semibold text-decart-700">{formatINR(totals.total)}</dd>
          </div>
        </dl>
      </div>

      {quotation.notes ? (
        <section className="mt-6 border-t border-line pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">Notes</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-steel-600">{quotation.notes}</p>
        </section>
      ) : null}

      {quotation.terms ? (
        <section className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">Terms</p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-steel-600">{quotation.terms}</p>
        </section>
      ) : null}

      <footer className="mt-8 border-t border-line pt-5 text-xs text-steel-600">
        This is a computer-generated quotation and needs no signature. Prices are subject to the terms above.
        Questions? Call {SITE.phone} or write to {SITE.emailPrimary}.
      </footer>
    </article>
  );
}
