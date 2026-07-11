"use client";

let _sentryCapture: ((error: unknown) => void) | null | undefined;

async function getSentryCapture(): Promise<((error: unknown) => void) | null> {
  if (_sentryCapture !== undefined) return _sentryCapture;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    _sentryCapture = null;
    return null;
  }
  try {
    const Sentry = await import("@sentry/nextjs");
    _sentryCapture = Sentry.captureException;
    return _sentryCapture;
  } catch {
    _sentryCapture = null;
    return null;
  }
}

export function captureClientException(error: unknown): void {
  getSentryCapture().then((capture) => {
    if (capture) capture(error);
  });
}
