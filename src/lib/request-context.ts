// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RequestContext {
  requestId: string;
  method: string;
  route: string;
  path: string;
  ip: string;
  userAgent: string;
}

// ---------------------------------------------------------------------------
// getRequestContext — extract unified context from a Request
// ---------------------------------------------------------------------------

/**
 * Extracts a `RequestContext` object from a standard Request (or NextRequest).
 *
 * Header resolution order:
 * - `requestId`: `x-request-id` → `x-vercel-id` → `crypto.randomUUID()`
 * - `ip`: `x-forwarded-for` (first address) → `x-real-ip` → `"unknown"`
 * - `userAgent`: `user-agent` → `"unknown"`
 * - `route`: `routeName` parameter → `pathname`
 */
export function getRequestContext(
  request: Request,
  routeName?: string,
): RequestContext {
  const url = new URL(request.url);
  const path = url.pathname;

  const requestId =
    request.headers.get('x-request-id') ??
    request.headers.get('x-vercel-id') ??
    crypto.randomUUID();

  const xForwardedFor = request.headers.get('x-forwarded-for');
  const ip = xForwardedFor
    ? xForwardedFor.split(',')[0].trim()
    : request.headers.get('x-real-ip') ?? 'unknown';

  const userAgent = request.headers.get('user-agent') ?? 'unknown';

  return {
    requestId,
    method: request.method,
    route: routeName ?? path,
    path,
    ip,
    userAgent,
  };
}
