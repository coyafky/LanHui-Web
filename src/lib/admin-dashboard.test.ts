import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Session } from "next-auth";

const mockStoreCount = vi.hoisted(() => vi.fn());
const mockStoreFindMany = vi.hoisted(() => vi.fn());
const mockArticleCount = vi.hoisted(() => vi.fn());
const mockArticleGroupBy = vi.hoisted(() => vi.fn());
const mockArticleFindMany = vi.hoisted(() => vi.fn());
const mockAnalyticsCount = vi.hoisted(() => vi.fn());
const mockAnalyticsFindMany = vi.hoisted(() => vi.fn());
const mockAnalyticsGroupBy = vi.hoisted(() => vi.fn());
const mockActivityLogFindMany = vi.hoisted(() => vi.fn());
const mockActivityLogCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: { count: mockStoreCount, findMany: mockStoreFindMany },
    article: {
      count: mockArticleCount,
      groupBy: mockArticleGroupBy,
      findMany: mockArticleFindMany,
    },
    analyticsEvent: {
      count: mockAnalyticsCount,
      findMany: mockAnalyticsFindMany,
      groupBy: mockAnalyticsGroupBy,
    },
    activityLog: { findMany: mockActivityLogFindMany, create: mockActivityLogCreate },
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockStoreCount.mockReset();
  mockStoreFindMany.mockReset();
  mockArticleCount.mockReset();
  mockArticleGroupBy.mockReset();
  mockArticleFindMany.mockReset();
  mockAnalyticsCount.mockReset();
  mockAnalyticsFindMany.mockReset();
  mockAnalyticsGroupBy.mockReset();
  mockActivityLogFindMany.mockReset();
  mockActivityLogCreate.mockReset();
});

async function load() {
  return await import("./admin-dashboard");
}

// ============================================
// V1 tests (保留)
// ============================================

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
    mockStoreCount.mockResolvedValueOnce(3);
    mockArticleCount.mockResolvedValueOnce(7);
    mockAnalyticsCount.mockResolvedValueOnce(50);
    mockAnalyticsCount.mockResolvedValueOnce(1);
    mockArticleGroupBy.mockResolvedValueOnce([
      { status: "published", category: "news", _count: { _all: 5 } },
      { status: "draft", category: null, _count: { _all: 2 } },
    ]);
    mockStoreFindMany.mockResolvedValueOnce([
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "fj", provinceLabel: "福建", isActive: false },
    ]);
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

// ============================================
// V2 tests (T10)
// ============================================

describe("getWelcomeV2", () => {
  it("成功：session.user.name = 冯科雅 → userName = 冯科雅, severity = ok", async () => {
    const { getWelcomeV2 } = await load();
    const session: Session = {
      user: { id: "u-test-1", name: "冯科雅", email: "coya@lanhui.com", role: "admin" },
      expires: "2099-01-01",
    };
    const r = await getWelcomeV2(session);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.userName).toBe("冯科雅");
      expect(r.data.severity).toBe("ok");
      expect(r.data.today).toBeTruthy();
      expect(r.data.summaryText).toBeTruthy();
    }
  });

  it("fallback：null session → userName = 用户, today/summaryText present", async () => {
    const { getWelcomeV2 } = await load();
    const r = await getWelcomeV2(null);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.userName).toBe("用户");
      expect(r.data.today).toBeTruthy();
      expect(r.data.summaryText).toBeTruthy();
    }
  });
});

describe("getTodoSummaryV2", () => {
  it("全部计数 > 0：所有 todo + P0 在 P1 之前 + consultation-channels 始终 disabled", async () => {
    // getTodoSummaryV2 调用 5 次 prisma.count:
    // 1. store.count where status=pending -> 3
    // 2. store.count where status in [active,pending] AND (imageUrl null OR imagePath null) -> 2
    // 3. store.count where status=suspended -> 1
    // 4. article.count where status=draft -> 4
    // 5. article.count where status=withdrawn -> 1
    mockStoreCount.mockResolvedValueOnce(3);
    mockStoreCount.mockResolvedValueOnce(2);
    mockStoreCount.mockResolvedValueOnce(1);
    mockArticleCount.mockResolvedValueOnce(4);
    mockArticleCount.mockResolvedValueOnce(1);

    const { getTodoSummaryV2 } = await load();
    const r = await getTodoSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 期望 6 项：pending-stores + missing-cover-stores + consultation-channels-missing
      //                + suspended-stores + draft-articles + withdrawn-articles
      expect(r.data.items.length).toBe(6);
      expect(r.data.totalCount).toBe(6);

      const ids = r.data.items.map((i) => i.id);
      expect(ids).toContain("pending-stores");
      expect(ids).toContain("missing-cover-stores");
      expect(ids).toContain("consultation-channels-missing");
      expect(ids).toContain("suspended-stores");
      expect(ids).toContain("draft-articles");
      expect(ids).toContain("withdrawn-articles");

      // consultation-channels 必须始终存在且 disabled
      const cc = r.data.items.find((i) => i.id === "consultation-channels-missing");
      expect(cc).toBeDefined();
      expect(cc?.disabled).toBe(true);
      expect(cc?.severity).toBe("P0");

      // P0 在 P1 之前：前 3 个都应该是 P0
      const firstThree = r.data.items.slice(0, 3);
      expect(firstThree.every((i) => i.severity === "P0")).toBe(true);

      // 检查 count 字段
      const pending = r.data.items.find((i) => i.id === "pending-stores");
      expect(pending?.count).toBe(3);
      const drafts = r.data.items.find((i) => i.id === "draft-articles");
      expect(drafts?.count).toBe(4);
    }
  });

  it("全部计数 = 0：仅保留 consultation-channels, totalCount = 1", async () => {
    mockStoreCount.mockResolvedValueOnce(0); // pending
    mockStoreCount.mockResolvedValueOnce(0); // missing cover
    mockStoreCount.mockResolvedValueOnce(0); // suspended
    mockArticleCount.mockResolvedValueOnce(0); // draft
    mockArticleCount.mockResolvedValueOnce(0); // withdrawn

    const { getTodoSummaryV2 } = await load();
    const r = await getTodoSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.items.length).toBe(1);
      expect(r.data.totalCount).toBe(1);
      expect(r.data.items[0]?.id).toBe("consultation-channels-missing");
      expect(r.data.items[0]?.disabled).toBe(true);
    }
  });

  it("失败：prisma throw → ok=false, data=null, error 包含消息", async () => {
    mockStoreCount.mockRejectedValueOnce(new Error("DB exploded"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getTodoSummaryV2 } = await load();
    const r = await getTodoSummaryV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("DB exploded");
    }
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe("getKpiSnapshotV2", () => {
  it("成功：返回 V2 shape, 含 monthlyContactIntent, 4 个字段都是 number", async () => {
    // V2 使用 4 次 prisma 查询:
    // 1. store.count (active + fallback)
    // 2. article.count where status=published
    // 3. analyticsEvent.count type=pageview
    // 4. analyticsEvent.count type IN [reservation, form_submit]
    mockStoreCount.mockResolvedValueOnce(7);
    mockArticleCount.mockResolvedValueOnce(12);
    mockAnalyticsCount.mockResolvedValueOnce(500);
    mockAnalyticsCount.mockResolvedValueOnce(8);

    const { getKpiSnapshotV2 } = await load();
    const r = await getKpiSnapshotV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.activeStores).toBe(7);
      expect(r.data.publishedArticles).toBe(12);
      expect(r.data.monthlyPageViews).toBe(500);
      expect(r.data.monthlyContactIntent).toBe(8);
      // 不应该有 V1 的 monthlyReservations 字段
      expect((r.data as Record<string, unknown>).monthlyReservations).toBeUndefined();
    }
  });

  it("失败：prisma throw → ok=false, data=null", async () => {
    mockStoreCount.mockRejectedValueOnce(new Error("timeout"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getKpiSnapshotV2 } = await load();
    const r = await getKpiSnapshotV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("timeout");
    }
    warnSpy.mockRestore();
  });
});

describe("getStoreSummary", () => {
  it("成功：4 状态 + 正确 label + byLevel 存在 + topProvinces ≤ 10 + missingProfile 计数", async () => {
    // 一个综合数据集：覆盖四种状态 + 各种 level + 一个缺资料的门店
    mockStoreFindMany.mockResolvedValueOnce([
      {
        status: "pending",
        isActive: false,
        provinceSlug: "gd",
        provinceLabel: "广东",
        level: "flagship",
        address: "顺德大良",
        phone: "13800000001",
        imageUrl: null,
        imagePath: "/img/1.webp",
      },
      {
        status: "active",
        isActive: true,
        provinceSlug: "gd",
        provinceLabel: "广东",
        level: "premium",
        address: "深圳福田",
        phone: "13800000002",
        imageUrl: "/img/2.webp",
        imagePath: null,
      },
      {
        status: "active",
        isActive: true,
        provinceSlug: "fj",
        provinceLabel: "福建",
        level: "standard",
        address: "厦门",
        phone: "13800000003",
        imageUrl: null,
        imagePath: null,
      },
      {
        status: "suspended",
        isActive: false,
        provinceSlug: "sd",
        provinceLabel: "山东",
        level: "standard",
        address: "济南",
        phone: "13800000004",
        imageUrl: null,
        imagePath: null,
      },
      {
        status: "terminated",
        isActive: false,
        provinceSlug: "hb",
        provinceLabel: "河北",
        level: "standard",
        address: "石家庄",
        phone: "13800000005",
        imageUrl: null,
        imagePath: null,
      },
      {
        // 缺资料 active（active + 无 image + 无 phone）
        status: "active",
        isActive: true,
        provinceSlug: "gd",
        provinceLabel: "广东",
        level: "premium",
        address: "广州",
        phone: "",
        imageUrl: null,
        imagePath: null,
      },
    ]);

    const { getStoreSummary } = await load();
    const r = await getStoreSummary();
    expect(r.ok).toBe(true);
    if (r.ok) {
      // 4 状态都返回
      expect(r.data.byStatus.length).toBe(4);
      const labels = r.data.byStatus.map((s) => s.label);
      expect(labels).toContain("待发布");
      expect(labels).toContain("营业中");
      expect(labels).toContain("暂停合作");
      expect(labels).toContain("终止合作");

      // 各状态计数
      const byStatusMap = Object.fromEntries(r.data.byStatus.map((s) => [s.label, s.count]));
      expect(byStatusMap["待发布"]).toBe(1);
      expect(byStatusMap["营业中"]).toBe(3);
      expect(byStatusMap["暂停合作"]).toBe(1);
      expect(byStatusMap["终止合作"]).toBe(1);

      // byLevel 至少包含 flagship / premium / standard
      const levelKeys = r.data.byLevel.map((l) => l.level);
      expect(levelKeys).toContain("flagship");
      expect(levelKeys).toContain("premium");
      expect(levelKeys).toContain("standard");

      // topProvinces ≤ 10（这里是 2 个活跃省份：gd + fj）
      expect(r.data.topProvinces.length).toBeLessThanOrEqual(10);
      expect(r.data.topProvinces.length).toBe(2);

      // missingProfile：active + 无图无电话那一条
      expect(r.data.missingProfile).toBe(2);
    }
  });

  it("失败：prisma throw → ok=false, data=null", async () => {
    mockStoreFindMany.mockRejectedValueOnce(new Error("store table missing"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getStoreSummary } = await load();
    const r = await getStoreSummary();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("store table missing");
    }
    warnSpy.mockRestore();
  });
});

describe("getContentSummaryV2", () => {
  it("成功：byStatus 含 4 label + recent7dPublished + topCategories ≤ 5 + missingCover", async () => {
    // getContentSummaryV2 调用顺序:
    // 1. article.groupBy by status
    // 2. article.count where status=published publishedAt >= 7d ago
    // 3. article.groupBy by category
    // 4. article.count where status=published featuredImage=null
    mockArticleGroupBy.mockResolvedValueOnce([
      { status: "draft", _count: { _all: 5 } },
      { status: "published", _count: { _all: 12 } },
      { status: "archived", _count: { _all: 3 } },
      { status: "withdrawn", _count: { _all: 1 } },
    ]);
    mockArticleCount.mockResolvedValueOnce(4); // recent7dPublished
    mockArticleGroupBy.mockResolvedValueOnce([
      { category: "新闻", _count: { _all: 6 } },
      { category: "技术", _count: { _all: 4 } },
      { category: "案例", _count: { _all: 2 } },
    ]);
    mockArticleCount.mockResolvedValueOnce(2); // missingCover

    const { getContentSummaryV2 } = await load();
    const r = await getContentSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      // byStatus 含 4 label
      const labels = r.data.byStatus.map((s) => s.label);
      expect(labels).toContain("草稿");
      expect(labels).toContain("已发布");
      expect(labels).toContain("已归档");
      expect(labels).toContain("已撤回");

      expect(r.data.recent7dPublished).toBe(4);

      // topCategories ≤ 5（这里是 3 个）
      expect(r.data.topCategories.length).toBeLessThanOrEqual(5);
      expect(r.data.topCategories.length).toBe(3);

      expect(r.data.missingCover).toBe(2);
    }
  });

  it("失败：prisma throw → ok=false, data=null", async () => {
    mockArticleGroupBy.mockRejectedValueOnce(new Error("article.groupBy failed"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getContentSummaryV2 } = await load();
    const r = await getContentSummaryV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("article.groupBy failed");
    }
    warnSpy.mockRestore();
  });
});

describe("getInterestSummaryV2", () => {
  it("成功（满数据）：dailyTrend30d=30, topProductInterest≤5, topTopicInterest≤5, topStoreViews≤5, contactTrend30d=30, zeroReason=null", async () => {
    // getInterestSummaryV2 调用顺序:
    // 1. analyticsEvent.findMany type=pageview (PV)
    // 2. analyticsEvent.findMany pathname startsWith /product/ (product events)
    // 3. analyticsEvent.groupBy store_view storeId
    //    若 storeIds 非空，再调 store.findMany 拉门店名
    // 4. analyticsEvent.findMany type in [reservation, form_submit] (contact)
    // 5. analyticsEvent.groupBy type (last 7d 类型分布)
    const now = new Date("2026-06-25T00:00:00Z");
    const dayMs = 24 * 60 * 60 * 1000;
    // 30 天 PV（每天 1 个事件）
    const pvEvents = Array.from({ length: 30 }, (_, i) => ({
      timestamp: new Date(now.getTime() - (29 - i) * dayMs),
    }));
    mockAnalyticsFindMany.mockResolvedValueOnce(pvEvents);

    // product events (4 个不同 product 路径)
    mockAnalyticsFindMany.mockResolvedValueOnce([
      { pathname: "/product/wenjie/m7" },
      { pathname: "/product/wenjie/m9" },
      { pathname: "/product/xiaomi/y7" },
      { pathname: "/product/zeekr/9x" },
      { pathname: "/product/zeekr/8x" },
      { pathname: "/product/zeekr/8x" },
    ]);

    // store_view groupBy
    mockAnalyticsGroupBy.mockResolvedValueOnce([
      { storeId: "s1", _count: { _all: 10 } },
      { storeId: "s2", _count: { _all: 5 } },
    ]);
    // store.findMany (用于映射 store name)
    mockStoreFindMany.mockResolvedValueOnce([
      { id: "s1", name: "顺德店" },
      { id: "s2", name: "深圳店" },
    ]);

    // contact events
    mockAnalyticsFindMany.mockResolvedValueOnce([
      { timestamp: new Date(now.getTime() - 1 * dayMs) },
      { timestamp: new Date(now.getTime() - 2 * dayMs) },
    ]);

    // last 7d type groupBy（包含 pageview + store_view + reservation → zeroReason = null）
    mockAnalyticsGroupBy.mockResolvedValueOnce([
      { type: "pageview", _count: { _all: 50 } },
      { type: "store_view", _count: { _all: 8 } },
      { type: "reservation", _count: { _all: 2 } },
    ]);

    const { getInterestSummaryV2 } = await load();
    const r = await getInterestSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.dailyTrend30d.length).toBe(30);
      expect(r.data.contactTrend30d.length).toBe(30);
      expect(r.data.topProductInterest.length).toBeLessThanOrEqual(5);
      expect(r.data.topTopicInterest.length).toBeLessThanOrEqual(5);
      expect(r.data.topStoreViews.length).toBeLessThanOrEqual(5);
      // product: wenjie=2, xiaomi=1, zeekr=3
      expect(r.data.topProductInterest.length).toBe(3);
      // topic: wenjie/m9 -> wenjie, xiaomi/y7 -> xiaomi, zeekr/9x -> zeekr, zeekr/8x -> zeekr => 3 topics
      expect(r.data.topTopicInterest.length).toBe(3);
      expect(r.data.topStoreViews.length).toBe(2);
      expect(r.data.zeroReason).toBeNull();
    }
  });

  it("zeroReason = tracking-missing：last 7d 有 pageview 但缺 store_view", async () => {
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // PV events
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // product events
    mockAnalyticsGroupBy.mockResolvedValueOnce([]); // store_view (空)
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // contact events
    // last 7d 只有 pageview 没有 store_view
    mockAnalyticsGroupBy.mockResolvedValueOnce([{ type: "pageview", _count: { _all: 5 } }]);

    const { getInterestSummaryV2 } = await load();
    const r = await getInterestSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.zeroReason).toBe("tracking-missing");
    }
  });

  it("zeroReason = real：last 7d 完全无事件", async () => {
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // PV events
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // product events
    mockAnalyticsGroupBy.mockResolvedValueOnce([]); // store_view
    mockAnalyticsFindMany.mockResolvedValueOnce([]); // contact events
    mockAnalyticsGroupBy.mockResolvedValueOnce([]); // last 7d types (空)

    const { getInterestSummaryV2 } = await load();
    const r = await getInterestSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.zeroReason).toBe("real");
    }
  });

  it("失败：prisma throw → ok=false, error 包含消息, data 仍返回空 shape (zeroReason = query-failed)", async () => {
    mockAnalyticsFindMany.mockRejectedValueOnce(new Error("analytics down"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getInterestSummaryV2 } = await load();
    const r = await getInterestSummaryV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("analytics down");
      // 即使失败 data 仍返回（empty shape + zeroReason = query-failed）
      expect(r.data).not.toBeNull();
      if (r.data) {
        expect(r.data.zeroReason).toBe("query-failed");
        expect(r.data.dailyTrend30d).toEqual([]);
        expect(r.data.topProductInterest).toEqual([]);
        expect(r.data.topTopicInterest).toEqual([]);
        expect(r.data.topStoreViews).toEqual([]);
        expect(r.data.contactTrend30d).toEqual([]);
      }
    }
    warnSpy.mockRestore();
  });
});

describe("getDashboardSummaryV2", () => {
  it("成功：role=admin → quickActions 含 /admin/stores/new visible=true AND /admin/consultation-channels visible=true", async () => {
    // 需要让 7 个数据源都成功（或返回空 shape），然后断言 quickActions 字段。
    // 各数据源 prisma 调用:
    //   getWelcomeV2: 无 prisma 调用（纯函数）
    //   getTodoSummaryV2: 5 count
    //   getKpiSnapshotV2: 4 count
    //   getStoreSummary: 1 findMany
    //   getContentSummaryV2: 2 groupBy + 2 count
    //   getInterestSummaryV2: 4 findMany + 2 groupBy (若 storeIds 为空则不再 store.findMany)
    //   getRecentActivity: 1 findMany

    // getTodoSummaryV2 (5 counts, all 0 → 仅 consultation-channels)
    mockStoreCount.mockResolvedValue(0);
    mockArticleCount.mockResolvedValue(0);

    // getKpiSnapshotV2 (4 counts)
    mockAnalyticsCount.mockResolvedValue(0);

    // getStoreSummary (1 findMany)
    mockStoreFindMany.mockResolvedValue([]);

    // getContentSummaryV2 (groupBy + count + groupBy + count)
    mockArticleGroupBy.mockResolvedValue([]);
    mockArticleCount.mockResolvedValue(0);

    // getInterestSummaryV2
    mockAnalyticsFindMany.mockResolvedValue([]);
    mockAnalyticsGroupBy.mockResolvedValue([]);

    // getRecentActivity
    mockActivityLogFindMany.mockResolvedValue([]);

    const { getDashboardSummaryV2 } = await load();
    const session: Session = {
      user: { id: "u-test-admin", name: "Coya", email: "coya@lanhui.com", role: "admin" },
      expires: "2099-01-01",
    };
    const summary = await getDashboardSummaryV2(session);

    expect(summary.quickActions.length).toBeGreaterThan(0);
    const storeNew = summary.quickActions.find((a) => a.href === "/admin/stores/new");
    expect(storeNew).toBeDefined();
    expect(storeNew?.visible).toBe(true);

    const cc = summary.quickActions.find((a) => a.href === "/admin/consultation-channels");
    expect(cc).toBeDefined();
    expect(cc?.visible).toBe(true);

    expect(summary.fetchedAt).toBeDefined();
  });

  it("成功：role=editor → /admin/stores/new visible=false AND /admin/consultation-channels visible=false", async () => {
    mockStoreCount.mockResolvedValue(0);
    mockArticleCount.mockResolvedValue(0);
    mockAnalyticsCount.mockResolvedValue(0);
    mockStoreFindMany.mockResolvedValue([]);
    mockArticleGroupBy.mockResolvedValue([]);
    mockAnalyticsFindMany.mockResolvedValue([]);
    mockAnalyticsGroupBy.mockResolvedValue([]);
    mockActivityLogFindMany.mockResolvedValue([]);

    const { getDashboardSummaryV2 } = await load();
    const session: Session = {
      user: { id: "u-test-editor", name: "Editor", email: "editor@lanhui.com", role: "editor" },
      expires: "2099-01-01",
    };
    const summary = await getDashboardSummaryV2(session);

    const storeNew = summary.quickActions.find((a) => a.href === "/admin/stores/new");
    expect(storeNew).toBeDefined();
    expect(storeNew?.visible).toBe(false);

    const cc = summary.quickActions.find((a) => a.href === "/admin/consultation-channels");
    expect(cc).toBeDefined();
    expect(cc?.visible).toBe(false);

    // 其他项仍然 visible（新建文章、查看分析、查看待完善门店、查看草稿文章）
    const articleNew = summary.quickActions.find((a) => a.href === "/admin/articles/new");
    expect(articleNew?.visible).toBe(true);
    const analytics = summary.quickActions.find((a) => a.href === "/admin/analytics");
    expect(analytics?.visible).toBe(true);
  });

  it("部分失败：getTodoSummaryV2 失败 → todoSummary=null, 其他非 null, quickActions 仍填充", async () => {
    // getTodoSummaryV2 失败：第一次 store.count 直接 reject
    mockStoreCount.mockRejectedValueOnce(new Error("todo failed"));
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // 其他 6 个数据源都成功
    // getKpiSnapshotV2 (4 counts)
    mockStoreCount.mockResolvedValue(3);
    mockArticleCount.mockResolvedValue(7);
    mockAnalyticsCount.mockResolvedValue(100);
    mockAnalyticsCount.mockResolvedValue(2);

    // getStoreSummary
    mockStoreFindMany.mockResolvedValue([]);

    // getContentSummaryV2
    mockArticleGroupBy.mockResolvedValue([]);
    mockArticleCount.mockResolvedValue(0);

    // getInterestSummaryV2
    mockAnalyticsFindMany.mockResolvedValue([]);
    mockAnalyticsGroupBy.mockResolvedValue([]);

    // getRecentActivity
    mockActivityLogFindMany.mockResolvedValue([]);

    const { getDashboardSummaryV2 } = await load();
    const session: Session = {
      user: { id: "u-test-admin", name: "Coya", email: "coya@lanhui.com", role: "admin" },
      expires: "2099-01-01",
    };
    const summary = await getDashboardSummaryV2(session);

    expect(summary.todoSummary).toBeNull();
    expect(summary.welcome).not.toBeNull();
    expect(summary.kpi).not.toBeNull();
    expect(summary.storeSummary).not.toBeNull();
    expect(summary.contentSummary).not.toBeNull();
    expect(summary.interestSummary).not.toBeNull();
    expect(summary.recentActivity).not.toBeNull();
    expect(summary.quickActions.length).toBeGreaterThan(0);
    expect(summary.fetchedAt).toBeDefined();

    warnSpy.mockRestore();
  });
});
