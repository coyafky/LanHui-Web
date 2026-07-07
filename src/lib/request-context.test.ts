import { describe, it, expect } from 'vitest';
import { getRequestContext } from '@/lib/request-context';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockRequest(overrides: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
} = {}): Request {
  const { method = 'GET', url = 'http://localhost:3000/api/test', headers = {} } = overrides;
  return new Request(url, { method, headers: new Headers(headers) });
}

// ---------------------------------------------------------------------------
// getRequestContext
// ---------------------------------------------------------------------------

describe('getRequestContext', () => {
  describe('requestId', () => {
    it('returns requestId from x-request-id header when present', () => {
      const request = createMockRequest({
        headers: { 'x-request-id': 'req-12345' },
      });
      const ctx = getRequestContext(request);
      expect(ctx.requestId).toBe('req-12345');
    });

    it('falls back to x-vercel-id when x-request-id is absent', () => {
      const request = createMockRequest({
        headers: { 'x-vercel-id': 'vercel-abc' },
      });
      const ctx = getRequestContext(request);
      expect(ctx.requestId).toBe('vercel-abc');
    });

    it('generates UUID v4 when neither header is present', () => {
      const request = createMockRequest();
      const ctx = getRequestContext(request);
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(ctx.requestId).toMatch(uuidV4Pattern);
    });

    it('prefers x-request-id over x-vercel-id when both are present', () => {
      const request = createMockRequest({
        headers: {
          'x-request-id': 'req-12345',
          'x-vercel-id': 'vercel-abc',
        },
      });
      const ctx = getRequestContext(request);
      expect(ctx.requestId).toBe('req-12345');
    });
  });

  describe('method and path', () => {
    it('extracts method from the request', () => {
      const request = createMockRequest({ method: 'POST' });
      const ctx = getRequestContext(request);
      expect(ctx.method).toBe('POST');
    });

    it('extracts pathname from the URL', () => {
      const request = createMockRequest({ url: 'http://localhost:3000/api/articles' });
      const ctx = getRequestContext(request);
      expect(ctx.path).toBe('/api/articles');
    });
  });

  describe('route', () => {
    it('uses routeName parameter as route when provided', () => {
      const request = createMockRequest();
      const ctx = getRequestContext(request, 'articles.create');
      expect(ctx.route).toBe('articles.create');
    });

    it('falls back to URL pathname for route when routeName not provided', () => {
      const request = createMockRequest({ url: 'http://localhost:3000/api/stores' });
      const ctx = getRequestContext(request);
      expect(ctx.route).toBe('/api/stores');
    });
  });

  describe('userAgent', () => {
    it('extracts userAgent from the request', () => {
      const request = createMockRequest({
        headers: { 'user-agent': 'TestAgent/1.0' },
      });
      const ctx = getRequestContext(request);
      expect(ctx.userAgent).toBe('TestAgent/1.0');
    });

    it('returns "unknown" when user-agent header is absent', () => {
      const request = createMockRequest();
      const ctx = getRequestContext(request);
      expect(ctx.userAgent).toBe('unknown');
    });
  });

  describe('ip', () => {
    it('extracts IP from x-forwarded-for header (first IP)', () => {
      const request = createMockRequest({
        headers: { 'x-forwarded-for': '203.0.113.1, 198.51.100.2, 192.0.2.3' },
      });
      const ctx = getRequestContext(request);
      expect(ctx.ip).toBe('203.0.113.1');
    });

    it('falls back to x-real-ip when x-forwarded-for is absent', () => {
      const request = createMockRequest({
        headers: { 'x-real-ip': '10.0.0.42' },
      });
      const ctx = getRequestContext(request);
      expect(ctx.ip).toBe('10.0.0.42');
    });

    it('returns "unknown" for IP when no IP headers present', () => {
      const request = createMockRequest();
      const ctx = getRequestContext(request);
      expect(ctx.ip).toBe('unknown');
    });

    it('prefers x-forwarded-for over x-real-ip when both are present', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.1',
          'x-real-ip': '10.0.0.42',
        },
      });
      const ctx = getRequestContext(request);
      expect(ctx.ip).toBe('203.0.113.1');
    });
  });

  describe('all fields together', () => {
    it('returns a complete RequestContext object', () => {
      const request = createMockRequest({
        method: 'DELETE',
        url: 'http://localhost:3000/api/articles/42',
        headers: {
          'x-request-id': 'req-complete',
          'x-forwarded-for': '1.2.3.4',
          'user-agent': 'Curl/8.0',
        },
      });
      const ctx = getRequestContext(request);
      expect(ctx).toEqual({
        requestId: 'req-complete',
        method: 'DELETE',
        route: '/api/articles/42',
        path: '/api/articles/42',
        ip: '1.2.3.4',
        userAgent: 'Curl/8.0',
      });
    });
  });
});
