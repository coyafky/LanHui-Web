import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Session } from "next-auth";

const mockLoggerWarn = vi.hoisted(() => vi.fn());
const mockLoggerError = vi.hoisted(() => vi.fn());
const mockLoggerInfo = vi.hoisted(() => vi.fn());
const mockLoggerDebug = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: {
    debug: mockLoggerDebug,
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
  },
}));

const mockStoreCount = vi.hoisted(() => vi.fn());
const mockStoreFindMany = vi.hoisted(() => vi.fn());
const mockAnalyticsCount = vi.hoisted(() => vi.fn());
const mockAnalyticsFindMany = vi.hoisted(() => vi.fn());
const mockAnalyticsGroupBy = vi.hoisted(() => vi.fn());
const mockActivityLogFindMany = vi.hoisted(() => vi.fn());
const mockActivityLogCreate = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: { count: mockStoreCount, findMany: mockStoreFindMany },
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
  mockAnalyticsCount.mockReset();
  mockAnalyticsFindMany.mockReset();
  mockAnalyticsGroupBy.mockReset();
  mockActivityLogFindMany.mockReset();
  mockActivityLogCreate.mockReset();
  mockLoggerWarn.mockClear();
  mockLoggerError.mockClear();
  mockLoggerInfo.mockClear();
  mockLoggerDebug.mockClear();
});

async function load() {
  return await import("./admin-dashboard");
}

// ============================================
// V1 tests (保留)
// ============================================

describe("getKpiSnapshot", () => {
  it("成功：返回 3 个 KPI 数字", async () => {
    mockStoreCount.mockResolvedValueOnce(5);
    mockAnalyticsCount.mockResolvedValueOnce(100);
    mockAnalyticsCount.mockResolvedValueOnce(3);
    const { getKpiSnapshot } = await load();
    const r = await getKpiSnapshot();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.activeStores).toBe(5);
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
    mockLoggerWarn.mockClear();
    const { logActivity } = await load();
    await expect(
      logActivity({ actorId: null, action: "x", entity: "y", entityId: "z" })
    ).resolves.toBeUndefined();
    expect(mockLoggerWarn).toHaveBeenCalled();
    mockLoggerWarn.mockClear();
  });
});

describe("getDashboardSummary", () => {
  it("部分失败：单源失败时其他正常返回", async () => {
    mockStoreCount.mockResolvedValueOnce(3);
    mockAnalyticsCount.mockResolvedValueOnce(50);
    mockAnalyticsCount.mockResolvedValueOnce(1);
    mockStoreFindMany.mockResolvedValueOnce([
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "gd", provinceLabel: "广东", isActive: true },
      { provinceSlug: "fj", provinceLabel: "福建", isActive: false },
    ]);
    mockActivityLogFindMany.mockRejectedValueOnce(new Error("table not exist"));

    const { getDashboardSummary } = await load();
    const s = await getDashboardSummary();
    expect(s.kpi).not.toBeNull();
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
    mockStoreCount.mockResolvedValueOnce(3);
    mockStoreCount.mockResolvedValueOnce(2);
    mockStoreCount.mockResolvedValueOnce(1);

    const { getTodoSummaryV2 } = await load();
    const r = await getTodoSummaryV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.items.length).toBe(4);
      expect(r.data.totalCount).toBe(4);

      const ids = r.data.items.map((i) => i.id);
      expect(ids).toContain("pending-stores");
      expect(ids).toContain("missing-cover-stores");
      expect(ids).toContain("consultation-channels-missing");
      expect(ids).toContain("suspended-stores");

      const cc = r.data.items.find((i) => i.id === "consultation-channels-missing");
      expect(cc).toBeDefined();
      expect(cc?.disabled).toBe(true);
      expect(cc?.severity).toBe("P0");

      const firstThree = r.data.items.slice(0, 3);
      expect(firstThree.every((i) => i.severity === "P0")).toBe(true);

      const pending = r.data.items.find((i) => i.id === "pending-stores");
      expect(pending?.count).toBe(3);
    }
  });

  it("全部计数 = 0：仅保留 consultation-channels, totalCount = 1", async () => {
    mockStoreCount.mockResolvedValueOnce(0);
    mockStoreCount.mockResolvedValueOnce(0);
    mockStoreCount.mockResolvedValueOnce(0);

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
    mockLoggerWarn.mockClear();
    const { getTodoSummaryV2 } = await load();
    const r = await getTodoSummaryV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("DB exploded");
    }
    expect(mockLoggerWarn).toHaveBeenCalled();
    mockLoggerWarn.mockClear();
  });
});

describe("getKpiSnapshotV2", () => {
  it("成功：返回 V2 shape, 含 monthlyContactIntent, 3 个字段都是 number", async () => {
    mockStoreCount.mockResolvedValueOnce(7);
    mockAnalyticsCount.mockResolvedValueOnce(500);
    mockAnalyticsCount.mockResolvedValueOnce(8);

    const { getKpiSnapshotV2 } = await load();
    const r = await getKpiSnapshotV2();
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.activeStores).toBe(7);
      expect(r.data.monthlyPageViews).toBe(500);
      expect(r.data.monthlyContactIntent).toBe(8);
      expect((r.data as Record<string, unknown>).monthlyReservations).toBeUndefined();
    }
  });

  it("失败：prisma throw → ok=false, data=null", async () => {
    mockStoreCount.mockRejectedValueOnce(new Error("timeout"));
    mockLoggerWarn.mockClear();
    const { getKpiSnapshotV2 } = await load();
    const r = await getKpiSnapshotV2();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("timeout");
    }
    mockLoggerWarn.mockClear();
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

      // missingProfile：门店图片只认 imagePath；旧 imageUrl 不再作为门店主图来源
      expect(r.data.missingProfile).toBe(3);
    }
  });

  it("失败：prisma throw → ok=false, data=null", async () => {
    mockStoreFindMany.mockRejectedValueOnce(new Error("store table missing"));
    mockLoggerWarn.mockClear();
    const { getStoreSummary } = await load();
    const r = await getStoreSummary();
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.data).toBeNull();
      expect(r.error).toContain("store table missing");
    }
    mockLoggerWarn.mockClear();
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
    mockLoggerWarn.mockClear();
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
    mockLoggerWarn.mockClear();
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

    // getTodoSummaryV2 (3 counts, all 0 → 仅 consultation-channels)
    mockStoreCount.mockResolvedValue(0);

    // getKpiSnapshotV2 (3 counts)
    mockAnalyticsCount.mockResolvedValue(0);

    // getStoreSummary (1 findMany)
    mockStoreFindMany.mockResolvedValue([]);

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

  it("成功：role=admin → /admin/stores/new visible=true AND /admin/consultation-channels visible=true (disabled)", async () => {
    mockStoreCount.mockResolvedValue(0);
    mockAnalyticsCount.mockResolvedValue(0);
    mockStoreFindMany.mockResolvedValue([]);
    mockAnalyticsFindMany.mockResolvedValue([]);
    mockAnalyticsGroupBy.mockResolvedValue([]);
    mockActivityLogFindMany.mockResolvedValue([]);

    const { getDashboardSummaryV2 } = await load();
    const session: Session = {
      user: { id: "u-test-admin", name: "Admin", email: "admin@lanhui.com", role: "admin" },
      expires: "2099-01-01",
    };
    const summary = await getDashboardSummaryV2(session);

    const storeNew = summary.quickActions.find((a) => a.href === "/admin/stores/new");
    expect(storeNew).toBeDefined();
    expect(storeNew?.visible).toBe(true);

    const cc = summary.quickActions.find((a) => a.href === "/admin/consultation-channels");
    expect(cc).toBeDefined();
    expect(cc?.visible).toBe(true);
    expect(cc?.disabled).toBe(true);

    const analytics = summary.quickActions.find((a) => a.href === "/admin/analytics");
    expect(analytics?.visible).toBe(true);
  });

  it("部分失败：getTodoSummaryV2 失败 → todoSummary=null, 其他非 null, quickActions 仍填充", async () => {
    // getTodoSummaryV2 失败：第一次 store.count 直接 reject
    mockStoreCount.mockRejectedValueOnce(new Error("todo failed"));
    mockLoggerWarn.mockClear();

    // 其他 5 个数据源都成功
    mockStoreCount.mockResolvedValue(3);
    mockAnalyticsCount.mockResolvedValue(100);
    mockAnalyticsCount.mockResolvedValue(2);

    // getStoreSummary
    mockStoreFindMany.mockResolvedValue([]);

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
    expect(summary.interestSummary).not.toBeNull();
    expect(summary.recentActivity).not.toBeNull();
    expect(summary.quickActions.length).toBeGreaterThan(0);
    expect(summary.fetchedAt).toBeDefined();

    mockLoggerWarn.mockClear();
  });
});
