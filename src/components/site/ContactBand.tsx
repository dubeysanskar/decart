import { Phone, Mail, Clock, MessageCircle, MapPin } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { CONTACT_DESKS, SITE } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

/**
 * Call / Email / Location, with every desk on screen at once. Shared by /contact and the home
 * page (client: "in home page as well") so the numbers can never drift apart between the two.
 *
 * Desks sharing a number or an inbox collapse into a single row, so the block reads
 * "General · Sales · Support" against one line rather than printing the same number three
 * times. The moment the client sets the per-desk env vars the rows split apart on their own.
 */
function collapse(entries: { label: string; value: string }[]) {
  const grouped = new Map<string, string[]>();
  for (const entry of entries) {
    grouped.set(entry.value, [...(grouped.get(entry.value) ?? []), entry.label]);
  }
  return [...grouped.entries()].map(([value, labels]) => ({ value, label: labels.join(' · ') }));
}

const deskName = (title: string) => title.replace(/\s*Enquiry$/i, '');

export function ContactBand({ className }: { className?: string }) {
  const phoneRows = collapse(
    CONTACT_DESKS.map((option) => ({ label: deskName(option.title), value: option.phones[0] })),
  );
  const emailRows = collapse(
    CONTACT_DESKS.map((option) => ({ label: deskName(option.title), value: option.email })),
  );

  return (
    <section className={cn('border-y border-line bg-paper py-12 md:py-14', className)}>
      <div className="container-x grid gap-8 md:grid-cols-3">
        <div className="min-w-0" data-anim="up">
          <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
            <Phone aria-hidden className="h-4 w-4 text-decart-600" />
            Call
          </h2>
          <dl className="mt-4 flex flex-col gap-3">
            {phoneRows.map((row) => (
              <div key={row.value}>
                <dt className="text-xs text-steel-600">{row.label}</dt>
                <dd>
                  <a
                    href={`tel:${row.value.replace(/[^+\d]/g, '')}`}
                    className="text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                  >
                    {row.value}
                  </a>
                </dd>
              </div>
            ))}
            <p className="mt-1 flex items-center gap-2 text-xs text-steel-600">
              <Clock aria-hidden className="h-3.5 w-3.5 shrink-0" />
              {SITE.hours}
            </p>
          </dl>
        </div>

        <div className="min-w-0" data-anim="up">
          <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
            <Mail aria-hidden className="h-4 w-4 text-decart-600" />
            Email
          </h2>
          <dl className="mt-4 flex flex-col gap-3">
            {emailRows.map((row) => (
              <div key={row.value} className="min-w-0">
                <dt className="text-xs text-steel-600">{row.label}</dt>
                <dd>
                  <a
                    href={`mailto:${row.value}`}
                    className="break-words text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                  >
                    {row.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <ButtonLink
            href={waLink(WA.float())}
            variant="whatsapp"
            size="sm"
            data-wa="contact-band"
            className="mt-5"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            WhatsApp us
          </ButtonLink>
        </div>

        <div className="min-w-0" data-anim="up">
          <h2 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-steel-400">
            <MapPin aria-hidden className="h-4 w-4 text-decart-600" />
            Location
          </h2>
          <address className="mt-4 not-italic text-[0.9375rem] leading-relaxed text-steel-600">
            {SITE.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-semibold text-decart-700 hover:underline"
          >
            Open in Google Maps →
          </a>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
            GSTIN {SITE.gstin}
          </p>
        </div>
      </div>
    </section>
  );
}
