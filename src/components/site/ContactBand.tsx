import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, MapPin, Headphones, IndianRupee, Info, ArrowRight } from 'lucide-react';
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
 * An earlier version merged desks that shared a line into a single row, which meant all three
 * collapsed into one while they still share the main number — the client read that as only the
 * first desk showing up. Each desk now always prints in full, repeated number or not.
 *
 * Shared by /contact and the home page so the details cannot drift apart between the two. On
 * /contact the cards also pick which desk the form writes to; elsewhere they link through.
 */
export function ContactBand({
  activeDesk,
  selectable = false,
  className,
}: {
  activeDesk?: ContactDeskId;
  /** On /contact the cards set ?desk= on the same page instead of navigating to it. */
  selectable?: boolean;
  className?: string;
}) {
  return (
    <section className={cn('border-y border-line bg-porcelain py-14 md:py-16', className)}>
      <div className="container-x">
        <div className="grid gap-4 lg:grid-cols-3" data-stagger="0.06">
          {CONTACT_DESKS.map((desk) => {
            const Icon = DESK_ICON[desk.id];
            const active = selectable && desk.id === activeDesk;
            return (
              <div
                key={desk.id}
                data-anim="up"
                className={cn(
                  'flex min-w-0 flex-col rounded-card border bg-paper p-6 transition-colors',
                  active ? 'border-ink-900 ring-1 ring-ink-900' : 'border-line',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      active ? 'bg-ink-900 text-porcelain' : 'bg-decart-50 text-decart-700',
                    )}
                  >
                    <Icon aria-hidden className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-lg text-ink-950">{desk.title}</h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-steel-600">{desk.blurb}</p>

                <dl className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                  <div className="flex items-start gap-2.5">
                    <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                    <div className="min-w-0">
                      <dt className="sr-only">Phone</dt>
                      <dd className="flex flex-wrap gap-x-3">
                        {desk.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                            className="text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                          >
                            {phone}
                          </a>
                        ))}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
                    <div className="min-w-0">
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a
                          href={`mailto:${desk.email}`}
                          className="break-words text-[0.9375rem] font-semibold text-ink-950 hover:text-decart-700"
                        >
                          {desk.email}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>

                <Link
                  href={`/contact?desk=${desk.id}`}
                  scroll={!selectable}
                  className={cn(
                    'group mt-5 inline-flex items-center gap-1.5 text-sm font-semibold',
                    active ? 'text-steel-600' : 'text-decart-700 hover:underline',
                  )}
                  aria-current={active ? 'true' : undefined}
                >
                  {active ? 'Writing to this desk below' : 'Write to this desk'}
                  {active ? null : (
                    <ArrowRight
                      aria-hidden
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        {/* one factory address, so it sits under the desks rather than competing with them */}
        <div className="mt-4 grid gap-4 rounded-card border border-line bg-paper p-6 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
          <div className="flex min-w-0 items-start gap-2.5">
            <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">
                Office &amp; factory
              </p>
              <address className="mt-1 not-italic text-[0.9375rem] leading-relaxed text-steel-600">
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

          <div className="flex min-w-0 items-start gap-2.5">
            <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-decart-600" />
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel-400">Hours</p>
              <p className="mt-1 text-[0.9375rem] text-steel-600">{SITE.hours}</p>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-steel-600">
                GSTIN {SITE.gstin}
              </p>
            </div>
          </div>

          <ButtonLink href={waLink(WA.float())} variant="whatsapp" data-wa="contact-band">
            <MessageCircle aria-hidden className="h-4 w-4" />
            WhatsApp us
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
