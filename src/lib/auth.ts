import 'server-only';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { hasDb } from './db';
import { adminByEmail } from './repo';

/** Single seeded admin (§6.1). Credentials only — no public sign-up. */
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 },
  pages: { signIn: '/admin/login' },
  providers: [
    CredentialsProvider({
      name: 'DecArt Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? '';
        if (!email || !password) return null;
        if (!hasDb()) throw new Error('Database is not configured — set TURSO_DATABASE_URL and run `npm run seed`.');

        const user = await adminByEmail(email);
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return { id: user._id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role ?? 'admin';
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = (token.role as string) ?? 'admin';
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authOptions);

/**
 * Roles, per the Quote Master spec. A master sees every quotation in the business; a sales user
 * only ever sees their own.
 */
export const QUOTE_ROLES = ['admin', 'manager', 'sales'] as const;
export type QuoteRole = (typeof QUOTE_ROLES)[number];

export const isMaster = (role: string | undefined) => role === 'admin' || role === 'manager';

export type SignedInUser = {
  id: string;
  name: string;
  email: string;
  role: QuoteRole;
  office: string;
  designation: string;
};

/**
 * The signed-in user, read from the database rather than the JWT: sessions issued before the
 * office and designation columns existed carry neither, and a role change should take effect
 * without waiting for the token to expire.
 */
export async function currentUser(): Promise<SignedInUser | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const admin = await adminByEmail(email);
  if (!admin || !admin.active) return null;

  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: (QUOTE_ROLES as readonly string[]).includes(admin.role) ? (admin.role as QuoteRole) : 'sales',
    office: admin.office,
    designation: admin.designation,
  };
}

/** Guard for the quotation routes. Returns the user, or a Response to hand straight back. */
export async function requireUser(): Promise<SignedInUser | Response> {
  const user = await currentUser();
  if (!user) return Response.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  return user;
}

export const isResponse = (value: unknown): value is Response => value instanceof Response;

/** Guard for mutating API routes. Returns null when authorised, or a 401 Response. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }
  return null;
}
