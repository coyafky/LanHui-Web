import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Lazy Sentry accessor
// ---------------------------------------------------------------------------

interface SentryModule {
  captureException: (error: unknown) => void;
}

/**
 * Module-scoped Sentry implementation.
 *
 * - `undefined` (initial) → `getSentry()` will attempt lazy resolution.
 * - `null`               → no Sentry available (skip call).
 * - `SentryModule`       → Sentry is active.
 *
 * @internal Exposed for testing via {@link __setSentryForTesting}.
 */
let _sentry: SentryModule | null | undefined = undefined;

/** @internal Visible for testing only. */
export function __setSentryForTesting(
  sentry: SentryModule | null | undefined,
): void {
  _sentry = sentry;
}

function getSentry(): SentryModule | null {
  if (_sentry !== undefined) {
    return _sentry;
  }

  if (!process.env.SENTRY_DSN) {
    _sentry = null;
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _sentry = require('@sentry/nextjs') as SentryModule;
    return _sentry;
  } catch {
    _sentry = null;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Capture an exception for observability.
 *
 * Always logs to pino. When `SENTRY_DSN` is set, also forwards the error to
 * Sentry via `@sentry/nextjs`. The Sentry import is lazy — the module is only
 * loaded when `SENTRY_DSN` is present, so this is safe in environments without
 * the Sentry SDK configured.
 *
 * @param error   The error or unknown value to capture.
 * @param context Optional structured context attached to the log entry as `meta`.
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  logger.error({ event: 'exception.capture', error, meta: context });

  const sentry = getSentry();
  if (sentry) {
    sentry.captureException(error);
  }
}
