import Link from 'next/link';
import { Phone, Mail, Clock, MessageCircle, MapPin, Headphones, Users, MailOpen, ArrowRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';
import { CONTACT_DESKS, SITE, type ContactDeskId } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const DESK_ICON: Record<ContactDeskId, typeof Users> = {
  general: MailOpen,
  sales: Users,
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
 * Built to the client's own mockup: three separate cards, a round icon badge on the left, the
 * desk name in small caps over what it handles, the phone and inbox stacked under it, and one
 * outlined button on the right that opens the form with that desk already chosen. No selected
 * state — the client asked for that badge to go, so the form itself says where a message lands.
 *
 * Shared by /contact and the home page so the details cannot drift apart between the two.
 */
export function ContactBand({
  stacked = false,
  className,
}: {
  /** Beside the form: one column of cards, no band chrome. */
  stacked?: boolean;
  className?: string;
}) {
  const Wrapper = stacked ? 'div' : 'section';
  const desks = ORDER.map((id) => CONTACT_DESKS.find((desk) => desk.id === id)!);

  return (
    <Wrapper className={cn(stacked ? 'min-w-0' : 'border-y border-line bg-porcelain py-14 md:py-16', className)}>
      <div className={stacked ? 'min-w-0' : 'container-x'}>
        {/* the mockup's rule-and-caps label, on both variants so they read as the same block */}
        <p className="flex items-center gap-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cognac-600">
          <span aria-hidden className="h-px w-6 bg-cognac-500" />
          Connect with the right team
        </p>
        {!stacked ? (
          <h2 className="mt-3 font-display text-h3 text-ink-950">Talk to the desk that can act on it</h2>
        ) : null}

        <div className={cn('mt-4 grid gap-3', stacked ? 'grid-cols-1' : 'lg:grid-cols-3')} data-stagger="0.06">
          {desks.map((desk) => {
            const Icon = DESK_ICON[desk.id];
            return (
              <div
                key={desk.id}
                data-anim="up"
                className={cn(
                  'flex min-w-0 gap-4 rounded-card border border-line bg-paper p-5 shadow-[0_1px_2px_rgb(15_19_23/0.04),0_8px_24px_-18px_rgb(15_19_23/0.28)] transition-shadow hover:shadow-lift',
                  stacked ? 'items-center' : 'flex-col',
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cognac-500/10 text-cognac-600">
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={1.6} />
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-[0.06em] text-ink-950">{SHORT[desk.id]}</h3>
                  <p className="mt-0.5 text-xs text-steel-600">{desk.blurb}</p>

                  <dl className="mt-2.5 flex flex-col gap-1.5 text-[0.8125rem]">
                    <div className="flex min-w-0 items-center gap-2">
                      <Phone aria-hidden className="h-3.5 w-3.5 shrink-0 text-steel-400" />
                      <dt className="sr-only">Phone</dt>
                      <dd className="flex min-w-0 flex-wrap gap-x-2">
                        {desk.phones.map((phone) => (
                          <a
                            key={phone}
                            href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                            className="font-semibold text-ink-950 hover:text-cognac-600"
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
                        <a href={`mailto:${desk.email}`} className="break-words text-steel-600 hover:text-cognac-600">
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
                    'group inline-flex shrink-0 items-center gap-2 rounded-btn border border-cognac-500 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-cognac-600 transition-colors hover:bg-cognac-500 hover:text-white',
                    stacked ? 'self-center' : 'mt-auto self-start',
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
            <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cognac-600" />
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
            <Clock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cognac-600" />
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
