import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone, Clock, Lock, Instagram, Linkedin, Facebook } from 'lucide-react';
import { Logo } from './Logo';
import { ButtonLink } from '@/components/ui/Button';
import { SITE } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';
import type { NavFamily } from './Header';

const COMPANY = [
  { href: '/about', label: 'About DecArt' },
  { href: '/life-at-decart', label: 'Life at DecArt' },
  { href: '/manufacturing', label: 'Manufacturing' },
  { href: '/sustainability', label: 'Sustainability' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/career', label: 'Career' },
];

const ENQUIRE = [
  { href: '/quote?type=quote', label: 'Request a quote' },
  { href: '/quote?type=bulk', label: 'Bulk orders' },
  { href: '/quote?type=dealer', label: 'Become a dealer' },
  { href: '/quote?type=oem', label: 'OEM manufacturing' },
  { href: '/quote?type=custom', label: 'Custom builds' },
  { href: '/contact', label: 'Contact us' },
];

const RESOURCES = [
  { href: '/projects', label: 'Latest projects' },
  { href: '/clients', label: 'Clients' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/downloads', label: 'Downloads' },
  { href: '/shipping-refund-policy', label: 'Shipping & returns' },
];

/** Only rendered when the client has actually supplied the handle — never a dead icon. */
const SOCIALS = [
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
] as const;

export function Footer({ families }: { families: NavFamily[] }) {
  const year = new Date().getFullYear();
  const socials = SOCIALS.map((s) => ({ ...s, href: SITE.social[s.key] })).filter((s) => Boolean(s.href));

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-porcelain">
      {/* ---- closing call to action ---- */}
      <div className="border-b border-white/10">
        <div className="container-x flex flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div data-anim="clip" className="min-w-0">
            <p className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-300">
              Let&rsquo;s furnish it
            </p>
            <h2 className="mt-5 max-w-[16ch] font-display text-h2 font-semibold text-porcelain">
              Tell us the floor. We&rsquo;ll quote it today.
            </h2>
          </div>
          <div className="flex flex-wrap gap-3" data-anim="up">
            <ButtonLink href="/quote" size="lg" onDark>
              Get a quote
              <ArrowUpRight aria-hidden className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href={waLink(WA.float())} size="lg" variant="whatsapp" data-wa="footer-cta">
              WhatsApp us
            </ButtonLink>
          </div>
        </div>
      </div>

      {/* ---- link columns, five across like the reference footer ---- */}
      <div className="container-x grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
        <FooterColumn title="Seating">
          {families.slice(0, 6).map((family) => (
            <FooterLink key={family.slug} href={`/products/${family.slug}`}>
              {family.name}
            </FooterLink>
          ))}
          <FooterLink href="/products" accent>
            All products
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Desks & storage">
          {families.slice(6, 13).map((family) => (
            <FooterLink key={family.slug} href={`/products/${family.slug}`}>
              {family.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Company">
          {COMPANY.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Enquire">
          {ENQUIRE.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Resources">
          {RESOURCES.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      {/* ---- brand band: lockup + tagline, contact, socials ---- */}
      <div className="container-x">
        <div className="flex flex-col gap-8 border-t border-white/10 py-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Logo onDark width={170} />
            <p className="mt-5 font-display text-lg font-semibold text-porcelain">{SITE.tagline}.</p>
            <p className="mt-1 text-sm font-semibold text-decart-300">#MadeInFaridabad</p>
          </div>

          <ul className="grid min-w-0 gap-3.5 text-sm text-steel-400 sm:grid-cols-2 lg:max-w-xl">
            <li className="flex gap-3 sm:col-span-2">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="min-w-0">
                {SITE.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={SITE.phoneHref}
                data-call
                className="font-mono tracking-[0.04em] transition-colors hover:text-porcelain"
              >
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <a
                href={`mailto:${SITE.emailPrimary}`}
                className="min-w-0 break-all transition-colors hover:text-porcelain"
              >
                {SITE.emailPrimary}
              </a>
            </li>
            <li className="flex gap-3 sm:col-span-2">
              <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{SITE.hours}</span>
            </li>
          </ul>

          {socials.length ? (
            <div className="flex shrink-0 gap-2.5">
              {socials.map(({ key, label, Icon, href }) => (
                <a
                  key={key}
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-steel-400 transition-colors hover:border-decart-300 hover:text-porcelain"
                >
                  <Icon aria-hidden className="h-4 w-4" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 py-6">
          {[`Est. ${SITE.established}`, 'Made in Faridabad', 'GST verified', 'Pan-India delivery'].map((badge) => (
            <span key={badge} className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-steel-400">
              {badge}
            </span>
          ))}
        </div>

        {/* ---- legal line, centred like the reference ---- */}
        <div className="flex flex-col items-center gap-3 border-t border-white/10 py-6 text-xs text-steel-400 md:flex-row md:justify-center">
          <p className="text-center">
            © {year} {SITE.legalName}. All rights reserved. · GSTIN{' '}
            <span className="font-mono tracking-[0.06em]">{SITE.gstin}</span>
          </p>
          <span aria-hidden className="hidden md:inline">
            ·
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/terms" className="transition-colors hover:text-porcelain">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="transition-colors hover:text-porcelain">
              Privacy Policy
            </Link>
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 transition-colors hover:text-porcelain">
              <Lock aria-hidden className="h-3 w-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* ---- oversized wordmark: the sign-off ---- */}
      <div aria-hidden className="relative select-none overflow-hidden">
        <p className="container-x -mb-[0.18em] whitespace-nowrap font-display text-[19vw] font-semibold leading-none tracking-[-0.04em] text-white/[0.055]">
          DecArt
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="min-w-0">
      <h2 className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-300">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </nav>
  );
}

function FooterLink({ href, children, accent }: { href: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={`group inline-flex items-center gap-1.5 text-sm transition-colors ${
          accent ? 'font-medium text-decart-300 hover:text-porcelain' : 'text-steel-400 hover:text-porcelain'
        }`}
      >
        {children}
        <ArrowUpRight
          aria-hidden
          className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
        />
      </Link>
    </li>
  );
}
