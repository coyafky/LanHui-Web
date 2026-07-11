"use client";

function getSentryCapture(): ((error: unknown) => void) | null {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;
  try {
    return require("@sentry/nextjs").captureException;
  } catch {
    return null;
  }
}

export function captureClientException(error: unknown): void {
  const capture = getSentryCapture();
  if (capture) capture(error);
}
