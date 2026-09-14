'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Logo } from '@/components/site/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/form';
import { HexSpinner } from '@/components/ui/bits';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const res = await signIn('credentials', { email, password, redirect: false });
    setBusy(false);

    if (res?.error) {
      setError(
        res.error === 'CredentialsSignin'
          ? 'That email and password did not match. Try again.'
          : res.error,
      );
      return;
    }
    router.replace(params.get('callbackUrl') || '/admin');
    router.refresh();
  }

  return (
    <main className="dark-section flex min-h-screen items-center justify-center bg-ink-950 p-5">
      <div className="hex-grid absolute inset-0" aria-hidden />
      <div className="relative w-full max-w-sm rounded-card border border-line bg-paper p-7">
        <Logo width={150} href={null} />
        <h1 className="mt-6 font-display text-2xl text-ink-950">Admin sign in</h1>
        <p className="mt-2 text-sm text-steel-600">Queries, products, reviews and blog.</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? (
            <p className="rounded-btn border border-danger/30 bg-danger/5 p-3 text-sm text-ink-900" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" disabled={busy}>
            {busy ? (
              <>
                <HexSpinner /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-steel-600">
          The admin account is seeded from <code className="font-mono">ADMIN_EMAIL</code> and{' '}
          <code className="font-mono">ADMIN_PASSWORD</code> by <code className="font-mono">npm run seed</code>.
        </p>
      </div>
    </main>
  );
}
