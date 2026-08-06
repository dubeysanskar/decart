import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/site/Logo';
import { COPY } from '@/lib/site';
import { waLink, WA } from '@/lib/whatsapp';

export default function NotFound() {
  return (
    <main className="dark-section relative flex min-h-screen items-center overflow-hidden bg-ink-950 text-porcelain">
      <div className="hex-grid absolute inset-0" aria-hidden />
      <div className="container-x relative text-center">
        <Logo onDark width={170} />
        <p className="mt-10 font-mono text-sm uppercase tracking-[0.2em] text-decart-300">404</p>
        <h1 className="mt-4 font-display text-h1 text-porcelain">{COPY.notFound}</h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/products" size="lg" onDark>
            Browse products
          </ButtonLink>
          <ButtonLink href={waLink(WA.float())} size="lg" variant="whatsapp" data-wa="404">
            WhatsApp us
          </ButtonLink>
          <ButtonLink href="/" size="lg" variant="secondary" onDark>
            Home
          </ButtonLink>
        </div>
        <p className="mt-10 text-sm text-steel-400">
          Looking for a model code?{' '}
          <Link href="/products" className="underline hover:text-porcelain">
            Search the catalogue
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
