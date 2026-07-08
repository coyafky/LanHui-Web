import { describe, it, expect, vi, afterEach } from 'vitest';
import { Writable } from 'node:stream';
import pino from 'pino';
import { serializeError, sanitize } from '@/lib/logger';

interface LogEntry {
  level: number;
  time: number;
  pid: number;
  hostname: string;
  msg?: string;
  err?: Record<string, unknown>;
  [key: string]: unknown;
}

function createCaptureLogger() {
  const lines: string[] = [];
  const stream = new Writable({
    write(
      chunk: Buffer,
      _encoding: string,
      callback: (error?: Error | null) => void,
    ) {
      const line = chunk.toString().trim();
      if (line) lines.push(line);
      callback();
    },
  });
  const testLogger = pino(
    { level: 'trace', serializers: { err: serializeError } },
    stream,
  );
  return { logger: testLogger, lines };
}

function parseLogs(lines: string[]): LogEntry[] {
  return lines.filter(Boolean).map((line) => JSON.parse(line));
}

// ---------------------------------------------------------------------------
// serializeError
// ---------------------------------------------------------------------------
describe('serializeError', () => {
  it('serializes a plain Error with name, message, and stack', () => {
    const error = new Error('test error');
    const result = serializeError(error);
    expect(result).toMatchObject({
      name: 'Error',
      message: 'test error',
    });
    expect(result).toHaveProperty('stack');
  });

  it('serializes Error with cause chain', () => {
    const inner = new Error('inner error');
    const outer = new Error('outer error');
    outer.cause = inner;

    const result = serializeError(outer);
    expect(result).toMatchObject({
      name: 'Error',
      message: 'outer error',
    });
    expect(result.cause).toMatchObject({
      name: 'Error',
      message: 'inner error',
    });
  });

  it('serializes Prisma error with code and meta', () => {
    const prismaError = new Error('Unique constraint violation');
    (prismaError as unknown as Record<string, unknown>).code = 'P2002';
    (prismaError as unknown as Record<string, unknown>).meta = { modelName: 'User' };

    const result = serializeError(prismaError);
    expect(result.code).toBe('P2002');
    expect(result.meta).toEqual({ modelName: 'User' });
  });

  it('handles non-Error objects gracefully', () => {
    const result = serializeError('string error');
    expect(result).toMatchObject({
      name: 'UnknownError',
      message: 'string error',
    });
  });
});

// ---------------------------------------------------------------------------
// sanitize
// ---------------------------------------------------------------------------
describe('sanitize', () => {
  it('removes sensitive keys from flat objects', () => {
    const input = {
      name: 'John',
      password: 'secret123',
      email: 'john@example.com',
      token: 'abc',
      cookie: 'xyz',
      authorization: 'Bearer foo',
      csrf: 'csrf-token',
      sessionToken: 'sess123',
    };
    const result = sanitize(input);
    expect(result.name).toBe('John');
    expect(result.email).toBe('john@example.com');
    expect(result.password).toBe('[REDACTED]');
    expect(result.token).toBe('[REDACTED]');
    expect(result.cookie).toBe('[REDACTED]');
    expect(result.authorization).toBe('[REDACTED]');
    expect(result.csrf).toBe('[REDACTED]');
    expect(result.sessionToken).toBe('[REDACTED]');
  });

  it('recursively removes sensitive fields from nested objects', () => {
    const input = {
      user: {
        name: 'John',
        password: 'secret',
        settings: {
          token: 'xyz',
        },
      },
    };
    const result = sanitize(input) as Record<
      string,
      Record<string, unknown>
    >;
    expect(result.user.password).toBe('[REDACTED]');
    expect(
      (result.user.settings as Record<string, unknown>).token,
    ).toBe('[REDACTED]');
    expect(result.user.name).toBe('John');
  });

  it('handles arrays of objects', () => {
    const input = [
      { name: 'A', token: 'secret1' },
      { name: 'B', token: 'secret2' },
    ];
    const result = sanitize(input);
    expect(result[0].name).toBe('A');
    expect(result[0].token).toBe('[REDACTED]');
    expect(result[1].token).toBe('[REDACTED]');
  });

  it('preserves non-sensitive keys unchanged', () => {
    const input = {
      id: 1,
      name: 'test',
      email: 'test@example.com',
      role: 'admin',
    };
    const result = sanitize(input);
    expect(result).toEqual(input);
  });
});

// ---------------------------------------------------------------------------
// logger integration (pino output)
// ---------------------------------------------------------------------------
describe('logger integration', () => {
  it('produces valid JSON output for info/warn/error', () => {
    const { logger, lines } = createCaptureLogger();
    logger.info({ msg: 'info test' });
    logger.warn({ msg: 'warn test' });
    logger.error({ msg: 'error test' });

    const entries = parseLogs(lines);
    expect(entries).toHaveLength(3);
    // pino level numbers: 30=info, 40=warn, 50=error
    expect(entries[0].level).toBe(30);
    expect(entries[1].level).toBe(40);
    expect(entries[2].level).toBe(50);
  });

  it('includes error name, message, stack in err field', () => {
    const { logger, lines } = createCaptureLogger();
    const error = new Error('something failed');
    logger.error({ err: error, msg: 'operation failed' });

    const entries = parseLogs(lines);
    expect(entries[0].err).toBeDefined();
    expect(entries[0].err).toMatchObject({
      name: 'Error',
      message: 'something failed',
    });
    expect((entries[0].err as Record<string, unknown>).stack).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// LOG_LEVEL
// ---------------------------------------------------------------------------
describe('LOG_LEVEL', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to debug when NODE_ENV is not production', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.resetModules();
    const mod = await import('@/lib/logger');
    expect(mod.logger.level).toBe('debug');
  });

  it('defaults to info in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const mod = await import('@/lib/logger');
    expect(mod.logger.level).toBe('info');
  });

  it('uses LOG_LEVEL env var override', async () => {
    vi.stubEnv('LOG_LEVEL', 'warn');
    vi.resetModules();
    const mod = await import('@/lib/logger');
    expect(mod.logger.level).toBe('warn');
  });
});
