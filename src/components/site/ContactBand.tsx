import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, MapPin, Headphones, IndianRupee, Info, Check } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { CONTACT_DESKS, SITE, type ContactDeskId } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const DESK_ICON: Record<ContactDeskId, typeof Info> = {
  general: Info,
  sales: IndianRupee,
  support: Headphones,
};

/**
 * Every enquiry desk on screen at once, each with its own number and inbox.
 *
 * An earlier version merged desks that shared a line into a single row, so all three collapsed
 * into one while they still share the main number — which read as only the first desk showing up.
 * Each desk now always prints in full, repeated number or not.
 *
 * The cards are sized and styled as a tab strip rather than as content cards: compact type, a
 * clear selected state, and the whole card clickable. That last part uses a stretched link
 * covering the card underneath the phone and email links — wrapping the card in an anchor would
 * nest anchors, which is invalid.
 *
 * Shared by /contact and the home page so the details cannot drift apart between the two.
 */
export function ContactBand({
  activeDesk,
  selectable = false,
  stacked = false,
  className,
}: {
  activeDesk?: ContactDeskId;
  /** On /contact the cards set ?desk= on the same page instead of navigating to it. */
  selectable?: boolean;
  /** Sidebar form: one column, no band chrome, so it sits beside the form instead of above it. */
  stacked?: boolean;
  className?: string;
}) {
  const Wrapper = stacked ? 'div' : 'section';

  return (
    <Wrapper className={cn(stacked ? 'min-w-0' : 'border-y border-line bg-porcelain py-14 md:py-16', className)}>
      <div className={stacked ? 'min-w-0' : 'container-x'}>
        {stacked ? (
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-steel-400">
            Choose a desk
          </p>
        ) : null}

        <div className={cn('grid gap-3', stacked ? 'grid-cols-1' : 'lg:grid-cols-3')} data-stagger="0.06">
          {CONTACT_DESKS.map((desk) => {
            const Icon = DESK_ICON[desk.id];
            const active = selectable && desk.id === activeDesk;
            return (
              <div
                key={desk.id}
                data-anim="up"
                className={cn(
                  'relative isolate flex min-w-0 flex-col rounded-card border p-4 transition-colors',
                  active
                    ? 'border-ink-900 bg-paper ring-1 ring-ink-900'
                    : 'border-line bg-paper hover:border-ink-800 hover:bg-porcelain/60',
                )}
              >
                {/* the tab hit area: covers the card, sits under the contact links */}
                <Link
                  href={`/contact?desk=${desk.id}`}
                  scroll={!selectable}
                  aria-current={active ? 'true' : undefined}
                  className="absolute inset-0 z-0 rounded-card"
                >
                  <span className="sr-only">
                    {active ? `${desk.title}, currently selected` : `Write to the ${desk.title.toLowerCase()}`}
                  </span>
                </Link>

                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                      active ? 'bg-ink-900 text-porcelain' : 'bg-decart-50 text-decart-700',
                    )}
                  >
                    <Icon aria-hidden className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="min-w-0 truncate text-[0.9375rem] font-semibold text-ink-950">{desk.title}</h3>
                  {active ? (
                    <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-ink-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-porcelain">
                      <Check aria-hidden className="h-3 w-3" />
                      Selected
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-steel-600">{desk.blurb}</p>

                {/* one row, not a stack — it kept the tab twice as tall as it needed to be.
                    Wraps rather than truncating, because a clipped email is useless. */}
                <dl className="relative z-10 mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Phone aria-hidden className="h-3.5 w-3.5 shrink-0 text-decart-600" />
                    <dt className="sr-only">Phone</dt>
                    <dd className="flex min-w-0 flex-wrap gap-x-2">
                      {desk.phones.map((phone) => (
                        <a
                          key={phone}
                          href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                          className="text-[0.8125rem] font-semibold text-ink-950 hover:text-decart-700"
                        >
                          {phone}
                        </a>
                      ))}
                    </dd>
                  </div>

                  <div className="flex min-w-0 items-center gap-1.5">
                    <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-decart-600" />
                    <dt className="sr-only">Email</dt>
                    <dd className="min-w-0">
                      <a
                        href={`mailto:${desk.email}`}
                        className="break-words text-[0.8125rem] text-steel-600 hover:text-decart-700"
                      >
                        {desk.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        {/* one factory address, so it sits under the desks rather than competing with them */}
        <div
          className={cn(
            'mt-3 grid gap-4 rounded-card border border-line bg-paper p-4',
            stacked ? '' : 'md:grid-cols-[1.4fr_1fr_auto] md:items-center md:p-6',
          )}
        >
          <div className="flex min-w-0 items-start gap-2">
            <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-decart-600" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                Office &amp; factory
              </p>
              <address className="mt-1 not-italic text-sm leading-relaxed text-steel-600">
                {SITE.addressLines.join(', ')}
              </address>
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-semibold text-decart-700 hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>

          <div className="flex min-w-0 items-start gap-2">
            <Clock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-decart-600" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Hours</p>
              <p className="mt-1 text-sm text-steel-600">{SITE.hours}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
                GSTIN {SITE.gstin}
              </p>
            </div>
          </div>

          <ButtonLink
            href={waLink(WA.float())}
            variant="whatsapp"
            size="sm"
            data-wa="contact-band"
            className={stacked ? 'w-full' : ''}
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            WhatsApp us
          </ButtonLink>
        </div>
      </div>
    </Wrapper>
  );
}
