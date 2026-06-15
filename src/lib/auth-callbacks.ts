/**
 * Pure NextAuth callback implementations. Kept in their own module so they
 * can be unit-tested without importing `next-auth` (which transitively pulls
 * `next/server` and won't load under vitest without heavy mocking).
 *
 * The NextAuth wiring in `src/lib/auth.ts` delegates to these functions.
 */
export async function jwtCallback({
  token,
  user,
}: {
  token: Record<string, unknown>;
  user?: { id: string; role: string };
}) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
  }
  return token;
}

export async function sessionCallback<S extends { user?: unknown }>({
  session,
  token,
}: {
  session: S;
  token: Record<string, unknown>;
}) {
  if (session.user) {
    (session.user as Record<string, unknown>).id = token.id as string;
    (session.user as Record<string, unknown>).role = token.role as string;
  }
  return session;
}
