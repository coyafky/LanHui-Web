import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStoreCount = vi.hoisted(() => vi.fn());
const mockStoreFindMany = vi.hoisted(() => vi.fn());
const mockArticleCount = vi.hoisted(() => vi.fn());
const mockArticleGroupBy = vi.hoisted(() => vi.fn());
const mockAnalyticsCount = vi.hoisted(() => vi.fn());
const mockActivityLogFindMany = vi.hoisted(() => vi.fn());
const mockActivityLogCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: { count: mockStoreCount, findMany: mockStoreFindMany },
    article: { count: mockArticleCount, groupBy: mockArticleGroupBy },
    analyticsEvent: { count: mockAnalyticsCount },
    activityLog: { findMany: mockActivityLogFindMany, create: mockActivityLogCreate },
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockStoreCount.mockReset();
  mockStoreFindMany.mockReset();
  mockArticleCount.mockReset();
  mockArticleGroupBy.mockReset();
  mockAnalyticsCount.mockReset();
  mockActivityLogFindMany.mockReset();
  mockActivityLogCreate.mockReset();
});

async function load() {
  return await import("./admin-dashboard");
}

describe("getKpiSnapshot", () => {
  it("成功：返回 4 个 KPI 数字", async () => {
    mockStoreCount.mockResolvedValueOnce(5);
    mockArticleCount.mockResolvedValueOnce(10);
    mockAnalyticsCount.mockResolvedValueOnce(100);
    mockAnalyticsCount.mockResolvedValueOnce(3);
    const { getKpiSnapshot } = await load();
    const r = await getKpiSnapshot();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.activeStores).toBe(5);
      expect(r.data.publishedArticles).toBe(10);
      expect(r.data.monthlyPageViews).toBe(100);
      expect(r.data.monthlyReservations).toBe(3);
    }
  });

  it("失败：prisma throw → ok=false + data=null", async () => {
    mockStoreCount.mockRejectedValueOnce(new Error("DB down"));
    const { getKpiSnapshot } = await load();
    const r = await getKpiSnapshot();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("DB down");
    }
  });
});

describe("logActivity", () => {
  it("成功写入", async () => {
    mockActivityLogCreate.mockResolvedValueOnce({ id: "log_1" });
    const { logActivity } = await load();
    await logActivity({
      actorId: "u1",
      action: "article.create",
      entity: "article",
      entityId: "a1",
      metadata: { title: "Hello" },
    });
    expect(mockActivityLogCreate).toHaveBeenCalledWith({
      data: {
        actorId: "u1",
        action: "article.create",
        entity: "article",
        entityId: "a1",
        metadata: { title: "Hello" },
      },
    });
  });

  it("失败：不抛错，仅 console.warn", async () => {
    mockActivityLogCreate.mockRejectedValueOnce(new Error("fail"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { logActivity } = await load();
    await expect(
      logActivity({ actorId: null, action: "x", entity: "y", entityId: "z" })
    ).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("getDashboardSummary", () => {
  it("部分失败：单源失败时其他正常返回", async () => {
    // KpiSnapshot 成功
    mockStoreCount.mockResolvedValueOnce(3);
    mockArticleCount.mockResolvedValueOnce(7);
    mockAnalyticsCount.mockResolvedValueOnce(50);
    mockAnalyticsCount.mockResolvedValueOnce(1);
    // ContentHealth 成功
    mockArticleGroupBy.mockResolvedValueOnce([
      { status: "published", category: "news", _count: { _all: 5 } },
      { status: "draft", category: null, _count: { _all: 2 } },
    ]);
    // StoreNetwork 成功
    mockStoreFindMany.mockResolvedValueOnce([
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "fj", provinceLabel: "福建", isActive: false },
    ]);
    // ActivityLog 失败
    mockActivityLogFindMany.mockRejectedValueOnce(new Error("table not exist"));

    const { getDashboardSummary } = await load();
    const s = await getDashboardSummary();
    expect(s.kpi).not.toBeNull();
    expect(s.contentHealth).not.toBeNull();
    expect(s.storeNetwork).not.toBeNull();
    expect(s.recentActivity).toBeNull();
    expect(s.fetchedAt).toBeDefined();
  });
});
