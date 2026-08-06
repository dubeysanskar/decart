import { withAuth } from 'next-auth/middleware';

/** Protect the admin panel. Mutating API routes guard themselves via requireAdmin(). */
export default withAuth({
  pages: { signIn: '/admin/login' },
});

export const config = {
  // '/admin' must be listed separately: '/admin/(...)' does not match the bare dashboard route,
  // which would otherwise serve lead data to anonymous visitors.
  matcher: ['/admin', '/admin/((?!login).*)'],
};
