import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';
import { captureException, __setSentryForTesting } from './observability';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/logger', () => ({
  logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const ORIGINAL_ENV = process.env;

describe('captureException', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SENTRY_DSN;
    __setSentryForTesting(undefined); // reset cached Sentry
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('calls logger.error with the error and context', () => {
    const error = new Error('test error');
    const context = { userId: '123', action: 'test' };

    captureException(error, context);

    expect(logger.error).toHaveBeenCalledWith({
      event: 'exception.capture',
      error,
      meta: context,
    });
  });

  it('does NOT throw and does not call Sentry when SENTRY_DSN is not set', () => {
    expect(() => captureException(new Error('test'))).not.toThrow();
  });

  it('passes context as meta to logger.error', () => {
    const context = { route: '/api/test', method: 'GET' };

    captureException('string error', context);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ meta: context }),
    );
  });

  it('calls Sentry.captureException when Sentry is configured', () => {
    process.env.SENTRY_DSN = 'https://key@sentry.io/project';
    const mockSentry = { captureException: vi.fn() };
    __setSentryForTesting(mockSentry);
    const error = new Error('sentry error');

    captureException(error);

    expect(mockSentry.captureException).toHaveBeenCalledWith(error);
  });

  it('skips Sentry when SENTRY_DSN is set but Sentry module is null', () => {
    process.env.SENTRY_DSN = 'https://key@sentry.io/project';
    __setSentryForTesting(null);
    const loggerErrorSpy = logger.error as ReturnType<typeof vi.fn>;

    captureException(new Error('should log only'));

    expect(loggerErrorSpy).toHaveBeenCalledOnce();
  });

  it('works with non-Error objects (string, object, number, null)', () => {
    captureException('string error');
    captureException({ foo: 'bar' });
    captureException(42);
    captureException(null);

    expect(logger.error).toHaveBeenCalledTimes(4);
  });
});
