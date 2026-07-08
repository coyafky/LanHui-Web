import pino from 'pino';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  cause?: SerializedError | Record<string, unknown> | null;
  code?: string;
  meta?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Sanitize — recursively remove sensitive keys
// ---------------------------------------------------------------------------

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'cookie',
  'authorization',
  'csrf',
  'sessionToken',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
}

/**
 * Recursively removes sensitive keys from an object.
 * Returns a new object; does not mutate the input.
 */
export function sanitize<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item)) as unknown as T;
  }

  if (!isPlainObject(obj)) {
    return obj;
  }

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    if (SENSITIVE_KEYS.has(key)) {
      result[key] = '[REDACTED]';
    } else {
      result[key] = sanitize(obj[key]);
    }
  }
  return result as T;
}

// ---------------------------------------------------------------------------
// serializeError — structured error serialization
// ---------------------------------------------------------------------------

/**
 * Converts an error (or any unknown value) into a plain serializable object.
 * Handles Error instances, cause chains, and Prisma-specific code/meta fields.
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const result: SerializedError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    // Cause chain
    if ('cause' in error && error.cause !== undefined) {
      result.cause =
        error.cause instanceof Error
          ? serializeError(error.cause)
          : (error.cause as Record<string, unknown> | null);
    }

    // Prisma-specific: code & meta
    const prismaErr = error as { code?: string; meta?: Record<string, unknown> };
    if (prismaErr.code !== undefined) {
      result.code = prismaErr.code;
    }
    if (prismaErr.meta !== undefined && isPlainObject(prismaErr.meta)) {
      result.meta = prismaErr.meta as Record<string, unknown>;
    } else if (prismaErr.meta !== undefined) {
      result.meta = { value: prismaErr.meta };
    }

    return result;
  }

  // Non-Error: string, number, null, etc.
  return {
    name: 'UnknownError',
    message: String(error),
  };
}

// ---------------------------------------------------------------------------
// Log level resolution
// ---------------------------------------------------------------------------

function resolveLogLevel(): string {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

// ---------------------------------------------------------------------------
// Singleton logger
// ---------------------------------------------------------------------------

export const logger = pino({
  level: resolveLogLevel(),
  serializers: {
    err: serializeError,
  },
});
