import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * /api/analytics/stats integration tests (S1-S7)
 *
 * mock:
 * - @/lib/auth: auth()
 * - @/lib/prisma: prisma.analyticsEvent.{count, groupBy}, prisma.$queryRaw, prisma.store.findMany
 */

const authMock = vi.hoisted(() => vi.fn());
const countMock = vi.hoisted(() => vi.fn());
const groupByMock = vi.hoisted(() => vi.fn());
const queryRawMock = vi.hoisted(() => vi.fn());
const storeFindManyMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth', () => ({
  auth: authMock,
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: {
      count: countMock,
      groupBy: groupByMock,
    },
    $queryRaw: queryRawMock,
    store: {
      findMany: storeFindManyMock,
    },
  },
}));

interface FakeRequest {
  nextUrl: URL;
}

function makeRequest(params: Record<string, string> = {}): FakeRequest {
  const url = new URL('http://localhost:3000/api/analytics/stats');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return { nextUrl: url };
}

async function freshGET() {
  vi.resetModules();
  return import('./route');
}

describe('GET /api/analytics/stats', () => {
  beforeEach(() => {
    authMock.mockReset();
    countMock.mockReset();
    groupByMock.mockReset();
    queryRawMock.mockReset();
    storeFindManyMock.mockReset();
    groupByMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);
    queryRawMock.mockResolvedValue([]);
    storeFindManyMock.mockResolvedValue([]);
  });

  it('S1: auth() 返回 null → 401 "未认证"', async () => {
    authMock.mockResolvedValue(null);
    const { GET } = await freshGET();
    const res = await GET(makeRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('未认证');
  });

  it('S2: auth() 返回 editor → 403 "权限不足"', async () => {
    authMock.mockResolvedValue({ user: { role: 'editor' } });
    const { GET } = await freshGET();
    const res = await GET(makeRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('权限不足');
  });

  it('S3: startDate=invalid → 400 "无效的日期格式"', async () => {
    authMock.mockResolvedValue({ user: { role: 'admin' } });
    const { GET } = await freshGET();
    const res = await GET(
      makeRequest({ startDate: 'not-a-date' }) as unknown as Parameters<typeof GET>[0],
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('无效的日期格式');
  });

  it('S4: groupBy=year → 400 "groupBy 必须为 day/week/month"', async () => {
    authMock.mockResolvedValue({ user: { role: 'admin' } });
    const { GET } = await freshGET();
    const res = await GET(
      makeRequest({ groupBy: 'year' }) as unknown as Parameters<typeof GET>[0],
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('groupBy 必须为 day/week/month');
  });

  it('S5: 合法参数 → 200, data 含 5 字段', async () => {
    authMock.mockResolvedValue({ user: { role: 'admin' } });
    countMock.mockResolvedValue(100);
    groupByMock
      .mockResolvedValueOnce([{ type: 'pageview', _count: { type: 80 } }])
      .mockResolvedValueOnce([{ pathname: '/', _count: { pathname: 50 } }])
      .mockResolvedValueOnce([{ storeId: 's1', _count: { storeId: 5 } }]);
    queryRawMock.mockResolvedValue([{ date: '2026-06-01', count: 30n }]);
    storeFindManyMock.mockResolvedValue([{ id: 's1', name: '佛山店' }]);

    const { GET } = await freshGET();
    const res = await GET(makeRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty('totalEvents', 100);
    expect(json.data).toHaveProperty('eventsByType');
    expect(json.data).toHaveProperty('topPages');
    expect(json.data).toHaveProperty('topStores');
    expect(json.data).toHaveProperty('dailyTrend');
  });

  it('S6: dailyTrend mock 返回 bigint → Number() 不抛错', async () => {
    authMock.mockResolvedValue({ user: { role: 'admin' } });
    countMock.mockResolvedValue(50);
    groupByMock.mockResolvedValue([]);
    queryRawMock.mockResolvedValue([
      { date: '2026-06-01', count: 100n },
      { date: '2026-06-02', count: 0n },
    ]);
    storeFindManyMock.mockResolvedValue([]);

    const { GET } = await freshGET();
    const res = await GET(makeRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.dailyTrend[0].count).toBe(100);
    expect(json.data.dailyTrend[1].count).toBe(0);
  });

  it('S7: topStores 含 storeId 但 Store 表已删 → storeName "未知门店"', async () => {
    authMock.mockResolvedValue({ user: { role: 'admin' } });
    countMock.mockResolvedValue(10);
    groupByMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ storeId: 'deleted-store', _count: { storeId: 3 } }]);
    queryRawMock.mockResolvedValue([]);
    storeFindManyMock.mockResolvedValue([]);

    const { GET } = await freshGET();
    const res = await GET(makeRequest() as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.topStores[0].storeName).toBe('未知门店');
    expect(json.data.topStores[0].storeId).toBe('deleted-store');
  });
});
