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

/** Sales first — it is the desk most visitors want — then support, then everything else. */
const ORDER: ContactDeskId[] = ['sales', 'support', 'general'];

/** The row heading: the desk name alone, the way the client's reference labels them. */
const SHORT: Record<ContactDeskId, string> = {
  sales: 'Sales',
  support: 'Support',
  general: 'General enquiries',
};

/**
 * Every enquiry desk on screen at once, each with its own number and inbox.
 *
 * Laid out as plain rows, after the client's reference: icon, desk name, what it handles, the
 * phone and email under it, and one outlined button that takes you to the enquiry form with the
 * desk already chosen. There is no selected state any more — the client asked for the "Selected"
 * badge to go, so the form itself now says which desk a message is going to.
 *
 * Shared by /contact and the home page so the details cannot drift apart between the two.
 */
export function ContactBand({
  stacked = false,
  className,
}: {
  /** Beside the form: one column of rows, no band chrome. */
  stacked?: boolean;
  className?: string;
}) {
  const Wrapper = stacked ? 'div' : 'section';
  const desks = ORDER.map((id) => CONTACT_DESKS.find((desk) => desk.id === id)!);

  return (
    <Wrapper className={cn(stacked ? 'min-w-0' : 'border-y border-line bg-porcelain py-14 md:py-16', className)}>
      <div className={stacked ? 'min-w-0' : 'container-x'}>
        {!stacked ? (
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-decart-700">
              Connect with the right team
            </p>
            <h2 className="mt-2 font-display text-h3 text-ink-950">Talk to the desk that can act on it</h2>
          </div>
        ) : null}

        <div
          className={cn(
            stacked
              ? 'divide-y divide-line overflow-hidden rounded-card border border-line bg-paper'
              : 'grid gap-3 lg:grid-cols-3',
          )}
          data-stagger="0.06"
        >
          {desks.map((desk) => {
            const Icon = DESK_ICON[desk.id];
            return (
              <div
                key={desk.id}
                data-anim="up"
                className={cn(
                  'flex min-w-0 gap-4 p-5',
                  stacked
                    ? 'flex-col sm:flex-row sm:items-center'
                    : 'flex-col rounded-card border border-line bg-paper transition-colors hover:border-ink-800',
                )}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-porcelain text-ink-900">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-950">
                    {SHORT[desk.id]}
                  </h3>
                  <p className="mt-1 text-xs text-steel-600">{desk.blurb}</p>

                  <dl className="mt-2.5 flex flex-col gap-1 text-[0.8125rem]">
                    <div className="flex min-w-0 items-center gap-2">
                      <Phone aria-hidden className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                      <dt className="sr-only">Phone</dt>
                      <dd className="flex min-w-0 flex-wrap gap-x-2">
                        {desk.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                            className="font-semibold text-ink-950 hover:text-decart-700"
                          >
                            {phone}
                          </a>
                        ))}
                      </dd>
                    </div>
                    <div className="flex min-w-0 items-center gap-2">
                      <Mail aria-hidden className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                      <dt className="sr-only">Email</dt>
                      <dd className="min-w-0">
                        <a href={`mailto:${desk.email}`} className="break-words text-steel-600 hover:text-decart-700">
                          {desk.email}
                        </a>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* one action per desk: straight to the form, with this desk already chosen */}
                <Link
                  href={`/contact?desk=${desk.id}#enquiry`}
                  className={cn(
                    'group inline-flex shrink-0 items-center gap-1.5 self-start rounded-btn border border-ink-900 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-950 transition-colors hover:bg-ink-900 hover:text-porcelain',
                    stacked ? 'sm:self-center' : 'mt-auto',
                  )}
                >
                  {desk.cta}
                  <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
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
