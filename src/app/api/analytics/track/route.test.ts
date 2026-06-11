import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * /api/analytics/track integration tests (I1-I10)
 *
 * 关键点：rateLimitMap 是模块级状态。需要 vi.resetModules() 让每个测试
 * 拿到全新的 route 模块实例。
 */

const createManyMock = vi.hoisted(() => vi.fn());

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (k: string) => {
      const m: Record<string, string> = {
        'user-agent': 'jest-test',
        'x-forwarded-for': '1.2.3.4',
      };
      return m[k.toLowerCase()] ?? null;
    },
  }),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: {
      createMany: createManyMock,
    },
  },
}));

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/analytics/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function freshPOST() {
  vi.resetModules();
  return import('./route');
}

describe('POST /api/analytics/track', () => {
  beforeEach(() => {
    createManyMock.mockReset();
    createManyMock.mockResolvedValue({ count: 0 });
  });

  it('I1: 1 条 pageview → 200, count=1', async () => {
    createManyMock.mockResolvedValue({ count: 1 });
    const { POST } = await freshPOST();
    const res = await POST(makeRequest({ events: [{ type: 'pageview', pathname: '/' }] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(1);
    expect(createManyMock).toHaveBeenCalledTimes(1);
  });

  it('I2: 50 条不同事件 → 200, count=50', async () => {
    createManyMock.mockResolvedValue({ count: 50 });
    const { POST } = await freshPOST();
    const events = Array.from({ length: 50 }, (_, i) => ({
      type: 'pageview',
      pathname: `/p${i}`,
    }));
    const res = await POST(makeRequest({ events }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(50);
  });

  it('I3: 51 条 → 400, error 含 "50"', async () => {
    const { POST } = await freshPOST();
    const events = Array.from({ length: 51 }, (_, i) => ({
      type: 'pageview',
      pathname: `/p${i}`,
    }));
    const res = await POST(makeRequest({ events }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('50');
  });

  it('I4: BUG — 1 条 invalid type → 200, count=0（filter 静默丢弃）', async () => {
    const { POST } = await freshPOST();
    const res = await POST(makeRequest({ events: [{ type: 'invalid', pathname: '/' }] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });

  it('I5: 空 body / 缺 events → 400 "无效的请求数据"', async () => {
    const { POST } = await freshPOST();
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('无效的请求数据');
  });

  it('I6: events=[] → 200, count=0', async () => {
    const { POST } = await freshPOST();
    const res = await POST(makeRequest({ events: [] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });

  it('I7: 连续 61 次 → 第 61 次 429（rate limit）', async () => {
    createManyMock.mockResolvedValue({ count: 1 });
    const { POST } = await freshPOST();
    for (let i = 0; i < 60; i++) {
      const res = await POST(makeRequest({ events: [{ type: 'pageview', pathname: '/x' }] }));
      expect(res.status).toBe(200);
    }
    const res61 = await POST(makeRequest({ events: [{ type: 'pageview', pathname: '/x' }] }));
    expect(res61.status).toBe(429);
    const json = await res61.json();
    expect(json.error).toContain('请求过于频繁');
  });

  it('I8: BUG — 事件缺 pathname → 200, count=0（filter 静默丢弃）', async () => {
    const { POST } = await freshPOST();
    const res = await POST(
      makeRequest({ events: [{ type: 'click' }] }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });

  it('I9: 事件含 storeId → createMany.data 含该 storeId', async () => {
    createManyMock.mockResolvedValue({ count: 1 });
    const { POST } = await freshPOST();
    const res = await POST(
      makeRequest({ events: [{ type: 'store_view', pathname: '/s', storeId: 'validId' }] }),
    );
    expect(res.status).toBe(200);
    const callArgs = createManyMock.mock.calls[0] as [
      { data: Array<{ storeId: string | null }> },
    ];
    expect(callArgs[0].data[0].storeId).toBe('validId');
  });

  it('I10: 事件含 metadata → createMany.data 含 metadata JSON', async () => {
    createManyMock.mockResolvedValue({ count: 1 });
    const { POST } = await freshPOST();
    const meta = { target: 'btn', x: 5 };
    const res = await POST(
      makeRequest({
        events: [{ type: 'click', pathname: '/p', metadata: meta }],
      }),
    );
    expect(res.status).toBe(200);
    const callArgs = createManyMock.mock.calls[0] as [
      { data: Array<{ metadata: unknown }> },
    ];
    expect(callArgs[0].data[0].metadata).toEqual(meta);
  });
});
