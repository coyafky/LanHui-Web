import { prisma } from "@/lib/prisma";

/**
 * Pure NextAuth callback implementations. Kept in their own module so they
 * can be unit-tested without importing `next-auth` (which transitively pulls
 * `next/server` and won't load under vitest without heavy mocking).
 *
 * The NextAuth wiring in `src/lib/auth.ts` delegates to these functions.
 */

/**
 * Migrate stale JWT tokens issued before user.id was injected on sign-in.
 * Cookies from before the article fix carry `role` but no `id`, which causes
 * `if (!session.user.id) return 401` to fire on every authenticated request
 * until the user logs out and back in. This helper runs ONCE per stale
 * token — on the first request after deployment we look up the user by
 * email (or sub) and patch `id`/`role` in. NextAuth re-signs the patched
 * token on response, so subsequent requests carry `id` and skip this path.
 */
async function migrateStaleToken(token: Record<string, unknown>): Promise<void> {
  if (token.id) return;
  const email = (token.email as string | undefined) ?? (token.sub as string | undefined);
  if (!email) return;

  const dbUser = await prisma.user.findUnique({
    where: typeof email === "string" && email.includes("@")
      ? { email }
      : { id: email },
    select: { id: true, role: true },
  });
  if (dbUser) {
    token.id = dbUser.id;
    token.role = dbUser.role;
  }
}

export async function jwtCallback({
  token,
  user,
}: {
  token: Record<string, unknown>;
  user?: { id: string; role: string };
}) {
  // Initial sign-in: user argument is present → write id/role into token.
  if (user) {
    token.id = user.id;
    token.role = user.role;
    return token;
  }

  // Stale-token migration: token came from cookie but lacks `id`.
  // Look up the user once so subsequent requests don't hit the DB.
  await migrateStaleToken(token);

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
