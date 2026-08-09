import Link from 'next/link';
import { ArrowUpRight, Mail, MapPin, Phone, Clock, Lock } from 'lucide-react';
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
  { href: '/clients', label: 'Clients' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/downloads', label: 'Downloads' },
];

const ENQUIRE = [
  { href: '/quote?type=quote', label: 'Request a quote' },
  { href: '/quote?type=bulk', label: 'Bulk orders' },
  { href: '/quote?type=dealer', label: 'Become a dealer' },
  { href: '/quote?type=oem', label: 'OEM manufacturing' },
  { href: '/quote?type=custom', label: 'Custom builds' },
  { href: '/contact', label: 'Contact us' },
];

export function Footer({ families }: { families: NavFamily[] }) {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-porcelain">
      {/* ---- closing call to action ---- */}
      <div className="border-b border-white/10">
        <div className="container-x flex flex-col gap-8 py-16 md:py-20 lg:flex-row lg:items-end lg:justify-between">
          <div data-anim="clip">
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

      {/* ---- columns ---- */}
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <Logo onDark width={185} />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-steel-400">
            Office chairs and modular furniture, manufactured in Faridabad since {SITE.established}.
          </p>

          <ul className="mt-7 space-y-3.5 text-sm text-steel-400">
            <li className="flex gap-3">
              <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {SITE.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={SITE.phoneHref} className="font-mono tracking-[0.04em] transition-colors hover:text-porcelain">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <a href={`mailto:${SITE.emailPrimary}`} className="transition-colors hover:text-porcelain">
                {SITE.emailPrimary}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{SITE.hours}</span>
            </li>
          </ul>
        </div>

        <FooterColumn title="Products" className="lg:col-span-3">
          {families.slice(0, 7).map((family) => (
            <FooterLink key={family.slug} href={`/products/${family.slug}`}>
              {family.name}
            </FooterLink>
          ))}
          <FooterLink href="/products" accent>
            All products
          </FooterLink>
        </FooterColumn>

        <FooterColumn title="Company" className="lg:col-span-2">
          {COMPANY.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Enquire" className="lg:col-span-3">
          {ENQUIRE.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>
      </div>

      {/* ---- badges + legal ---- */}
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 py-6">
          {['Est. 2015', 'Made in Faridabad', 'GST Verified', 'Pan-India delivery'].map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-steel-400"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-steel-400 lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} {SITE.legalName} · GSTIN <span className="font-mono tracking-[0.06em]">{SITE.gstin}</span>
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="transition-colors hover:text-porcelain">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-porcelain">
              Terms
            </Link>
            <Link href="/shipping-refund-policy" className="transition-colors hover:text-porcelain">
              Shipping &amp; Refunds
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-1.5 transition-colors hover:border-white/40 hover:text-porcelain"
            >
              <Lock aria-hidden className="h-3 w-3" />
              Admin login
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

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <nav aria-label={title} className={className}>
      <h2 className="text-eyebrow font-semibold uppercase tracking-[0.14em] text-decart-300">{title}</h2>
      <ul className="mt-5 space-y-3">{children}</ul>
    </nav>
  );
}

function FooterLink({
  href,
  children,
  accent,
}: {
  href: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
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
