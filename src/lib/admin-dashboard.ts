import { prisma } from "@/lib/prisma";

export type DashboardKpi = {
  activeStores: number;
  publishedArticles: number;
  monthlyPageViews: number;
  monthlyReservations: number;
};

export type ContentHealth = {
  byStatus: Array<{ status: string; count: number }>;
  byCategory: Array<{ category: string; count: number }>;
  totalDrafts: number;
  totalPublished: number;
  totalArchived: number;
};

export type StoreNetwork = {
  byProvince: Array<{ provinceSlug: string; provinceLabel: string; count: number }>;
  totalActive: number;
  totalInactive: number;
};

export type RecentActivityItem = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorName: string | null;
  createdAt: Date;
};

export type RecentActivity = {
  items: RecentActivityItem[];
};

export type DashboardSummary = {
  kpi: DashboardKpi | null;
  contentHealth: ContentHealth | null;
  storeNetwork: StoreNetwork | null;
  recentActivity: RecentActivity | null;
  fetchedAt: string;
};

export type DashboardFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; data: T | null };

/** 计算本月起止时间 */
function getMonthRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export async function getKpiSnapshot(): Promise<DashboardFetchResult<DashboardKpi>> {
  try {
    const { start, end } = getMonthRange();
    const [activeStores, publishedArticles, monthlyPageViews, monthlyReservations] = await Promise.all([
      prisma.store.count({ where: { isActive: true } }),
      prisma.article.count({ where: { status: "published" } }),
      prisma.analyticsEvent.count({
        where: { type: "pageview", timestamp: { gte: start, lt: end } },
      }),
      prisma.analyticsEvent.count({
        where: { type: "reservation", timestamp: { gte: start, lt: end } },
      }),
    ]);
    return {
      ok: true,
      data: { activeStores, publishedArticles, monthlyPageViews, monthlyReservations },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getContentHealth(): Promise<DashboardFetchResult<ContentHealth>> {
  try {
    const grouped = await prisma.article.groupBy({
      by: ["status", "category"],
      _count: { _all: true },
    });
    const byStatusMap = new Map<string, number>();
    const byCategoryMap = new Map<string, number>();
    for (const row of grouped) {
      byStatusMap.set(row.status, (byStatusMap.get(row.status) ?? 0) + row._count._all);
      const cat = row.category ?? "未分类";
      byCategoryMap.set(cat, (byCategoryMap.get(cat) ?? 0) + row._count._all);
    }
    const byStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count }));
    const byCategory = Array.from(byCategoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return {
      ok: true,
      data: {
        byStatus,
        byCategory,
        totalDrafts: byStatusMap.get("draft") ?? 0,
        totalPublished: byStatusMap.get("published") ?? 0,
        totalArchived: byStatusMap.get("archived") ?? 0,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getStoreNetwork(): Promise<DashboardFetchResult<StoreNetwork>> {
  try {
    const stores = await prisma.store.findMany({
      select: { provinceSlug: true, provinceLabel: true, isActive: true },
    });
    const byProvinceMap = new Map<string, { provinceLabel: string; count: number }>();
    let totalActive = 0;
    let totalInactive = 0;
    for (const s of stores) {
      if (!s.isActive) {
        totalInactive++;
        continue;
      }
      totalActive++;
      const existing = byProvinceMap.get(s.provinceSlug);
      if (existing) {
        existing.count++;
      } else {
        byProvinceMap.set(s.provinceSlug, { provinceLabel: s.provinceLabel, count: 1 });
      }
    }
    const byProvince = Array.from(byProvinceMap.entries())
      .map(([provinceSlug, v]) => ({ provinceSlug, provinceLabel: v.provinceLabel, count: v.count }))
      .sort((a, b) => b.count - a.count);
    return { ok: true, data: { byProvince, totalActive, totalInactive } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getRecentActivity(limit = 10): Promise<DashboardFetchResult<RecentActivity>> {
  try {
    const safeLimit = Math.min(50, Math.max(1, limit));
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: safeLimit,
      include: { actor: { select: { name: true, username: true } } },
    });
    const items: RecentActivityItem[] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      actorName: log.actor?.name ?? log.actor?.username ?? null,
      createdAt: log.createdAt,
    }));
    return { ok: true, data: { items } };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const results = await Promise.allSettled([
    getKpiSnapshot(),
    getContentHealth(),
    getStoreNetwork(),
    getRecentActivity(10),
  ]);
  return {
    kpi: results[0].status === "fulfilled" && results[0].value.ok ? results[0].value.data : null,
    contentHealth:
      results[1].status === "fulfilled" && results[1].value.ok ? results[1].value.data : null,
    storeNetwork:
      results[2].status === "fulfilled" && results[2].value.ok ? results[2].value.data : null,
    recentActivity:
      results[3].status === "fulfilled" && results[3].value.ok ? results[3].value.data : null,
    fetchedAt: new Date().toISOString(),
  };
}

export async function logActivity(input: {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        metadata: input.metadata ? (input.metadata as object) : undefined,
      },
    });
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[logActivity] failed:", error instanceof Error ? error.message : error);
    }
  }
}

// ============================================
// Dashboard v2 数据层（T1+T4 phase A）
// 保留旧导出兼容性，仅追加 V2 实现
// 后续 Phase B/C 将替换旧调用方
// ============================================

import type { Session } from "next-auth";

export type DashboardWelcomeV2 = {
  userName: string;
  today: string;
  summaryText: string;
  severity: "ok" | "warn" | "error";
};

export type TodoItemV2 = {
  id: string;
  severity: "P0" | "P1";
  title: string;
  count?: number;
  description: string;
  href: string;
  hrefLabel: string;
  disabled?: boolean;
  disabledHint?: string;
};

export type TodoSummaryV2 = {
  items: TodoItemV2[];
  totalCount: number;
};

// V2 KPI：monthlyContactIntent 替代旧的 monthlyReservations
export type DashboardKpiV2 = {
  activeStores: number;
  publishedArticles: number;
  monthlyPageViews: number;
  monthlyContactIntent: number;
};

// V2 StoreSummary：四态 + 等级 + Top 10 + 缺资料
export type StoreSummaryV2 = {
  byStatus: {
    status: "pending" | "active" | "suspended" | "terminated";
    label: string;
    count: number;
  }[];
  topProvinces: { provinceSlug: string; provinceLabel: string; count: number }[];
  byLevel: { level: string; label: string; count: number }[];
  missingProfile: number;
};

export type ContentSummaryV2 = {
  byStatus: { status: string; label: string; count: number }[];
  recent7dPublished: number;
  topCategories: { category: string; count: number }[];
  missingCover: number;
};

export type InterestSummaryV2 = {
  dailyTrend30d: { date: string; pv: number }[];
  topProductInterest: { productKey: string; productName: string; count: number }[];
  topTopicInterest: { topicKey: string; topicName: string; count: number }[];
  topStoreViews: { storeId: string; storeName: string; count: number }[];
  contactTrend30d: { date: string; count: number }[];
  zeroReason: "real" | "tracking-missing" | "event-incompatible" | "query-failed" | null;
};

export type QuickActionV2 = {
  href: string;
  label: string;
  desc: string;
  iconName: string;
  visible: boolean;
  disabled?: boolean;
  disabledHint?: string;
};

export type DashboardSummaryV2 = {
  welcome: DashboardWelcomeV2 | null;
  todoSummary: TodoSummaryV2 | null;
  kpi: DashboardKpiV2 | null;
  storeSummary: StoreSummaryV2 | null;
  contentSummary: ContentSummaryV2 | null;
  interestSummary: InterestSummaryV2 | null;
  recentActivity: RecentActivity | null;
  quickActions: QuickActionV2[];
  fetchedAt: string;
};

const STORE_STATUS_LABELS_V2: Record<"pending" | "active" | "suspended" | "terminated", string> = {
  pending: "待发布",
  active: "营业中",
  suspended: "暂停合作",
  terminated: "终止合作",
};

const STORE_LEVEL_LABELS_V2: Record<string, string> = {
  flagship: "旗舰店",
  premium: "高级店",
  standard: "标准店",
};

// V2 门店摘要：四态分布 + 等级 + Top 10 + 缺资料
// 兼容旧 isActive fallback（旧数据无 status 字段时）
export async function getStoreSummary(): Promise<DashboardFetchResult<StoreSummaryV2>> {
  try {
    const all = await prisma.store.findMany({
      select: {
        status: true,
        isActive: true,
        provinceSlug: true,
        provinceLabel: true,
        level: true,
        address: true,
        phone: true,
        imageUrl: true,
        imagePath: true,
      },
    });

    // 四态分布
    const byStatusMap = new Map<"pending" | "active" | "suspended" | "terminated", number>();
    for (const s of all) {
      const effective: "pending" | "active" | "suspended" | "terminated" =
        s.status === "pending" ||
        s.status === "active" ||
        s.status === "suspended" ||
        s.status === "terminated"
          ? s.status
          : s.isActive
            ? "active"
            : "pending";
      byStatusMap.set(effective, (byStatusMap.get(effective) ?? 0) + 1);
    }
    const byStatus = (["pending", "active", "suspended", "terminated"] as const).map((status) => ({
      status,
      label: STORE_STATUS_LABELS_V2[status],
      count: byStatusMap.get(status) ?? 0,
    }));

    // Top 10 营业中门店省份
    const byProvinceMap = new Map<string, { provinceLabel: string; count: number }>();
    for (const s of all) {
      const isActive =
        s.status === "active" || (s.isActive && s.status !== "suspended" && s.status !== "terminated");
      if (!isActive) continue;
      const existing = byProvinceMap.get(s.provinceSlug);
      if (existing) existing.count++;
      else byProvinceMap.set(s.provinceSlug, { provinceLabel: s.provinceLabel, count: 1 });
    }
    const topProvinces = Array.from(byProvinceMap.entries())
      .map(([provinceSlug, v]) => ({ provinceSlug, provinceLabel: v.provinceLabel, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 等级分布（active + pending + isActive fallback）
    const byLevelMap = new Map<string, number>();
    for (const s of all) {
      const isVisible =
        s.status === "active" ||
        s.status === "pending" ||
        (s.isActive && s.status !== "suspended" && s.status !== "terminated");
      if (!isVisible) continue;
      const lvl = s.level || "unknown";
      byLevelMap.set(lvl, (byLevelMap.get(lvl) ?? 0) + 1);
    }
    const byLevel = Array.from(byLevelMap.entries())
      .map(([level, count]) => ({ level, label: STORE_LEVEL_LABELS_V2[level] ?? level, count }))
      .sort((a, b) => b.count - a.count);

    // 缺资料门店：active/pending 且缺封面/地址/电话
    const missingProfile = all.filter(
      (s) =>
        (s.status === "active" ||
          s.status === "pending" ||
          (s.isActive && s.status !== "suspended" && s.status !== "terminated")) &&
        ((!s.imageUrl && !s.imagePath) || !s.address?.trim() || !s.phone?.trim()),
    ).length;

    return {
      ok: true,
      data: { byStatus, topProvinces, byLevel, missingProfile },
    };
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn(
        "[dashboard] getStoreSummary failed:",
        error instanceof Error ? error.message : error,
      );
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

// V2 占位实现（后续 Phase 替换）
export async function getWelcomeV2(
  session: Session | null,
): Promise<DashboardFetchResult<DashboardWelcomeV2>> {
  return {
    ok: true,
    data: {
      userName: session?.user?.name ?? "用户",
      today: new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
      summaryText: "运营正常，今日无待办。",
      severity: "ok",
    },
  };
}

export async function getTodoSummaryV2(): Promise<DashboardFetchResult<TodoSummaryV2>> {
  try {
    const [
      pendingStoresCount,
      missingCoverCount,
      suspendedStoresCount,
      draftArticlesCount,
      withdrawnArticlesCount,
    ] = await Promise.all([
      prisma.store.count({ where: { status: "pending" } }),
      prisma.store.count({
        where: {
          status: { in: ["active", "pending"] },
          AND: [{ OR: [{ imageUrl: null }, { imagePath: null }] }],
        },
      }),
      prisma.store.count({ where: { status: "suspended" } }),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.article.count({ where: { status: "withdrawn" } }),
    ]);

    const items: TodoItemV2[] = [];

    if (pendingStoresCount > 0) {
      items.push({
        id: "pending-stores",
        severity: "P0",
        title: "待发布门店",
        count: pendingStoresCount,
        description: `${pendingStoresCount} 家门店待审核发布`,
        href: "/admin/stores?status=pending",
        hrefLabel: "去审核 →",
      });
    }
    if (missingCoverCount > 0) {
      items.push({
        id: "missing-cover-stores",
        severity: "P0",
        title: "缺封面图门店",
        count: missingCoverCount,
        description: `${missingCoverCount} 家门店缺少封面图，影响官网展示`,
        href: "/admin/stores?image=missing",
        hrefLabel: "去补图 →",
      });
    }
    items.push({
      id: "consultation-channels-missing",
      severity: "P0",
      title: "未配置默认咨询渠道",
      description: "请配置企业微信、电话或导航等承接渠道",
      href: "/admin/consultation-channels",
      hrefLabel: "规划中",
      disabled: true,
      disabledHint: "/admin/consultation-channels 规划中，预计下一版本上线",
    });

    if (suspendedStoresCount > 0) {
      items.push({
        id: "suspended-stores",
        severity: "P1",
        title: "暂停合作门店",
        count: suspendedStoresCount,
        description: `${suspendedStoresCount} 家门店暂停合作`,
        href: "/admin/stores?status=suspended",
        hrefLabel: "查看 →",
      });
    }
    if (draftArticlesCount > 0) {
      items.push({
        id: "draft-articles",
        severity: "P1",
        title: "草稿文章",
        count: draftArticlesCount,
        description: `${draftArticlesCount} 篇文章待发布`,
        href: "/admin/articles?status=draft",
        hrefLabel: "去编辑 →",
      });
    }
    if (withdrawnArticlesCount > 0) {
      items.push({
        id: "withdrawn-articles",
        severity: "P1",
        title: "已撤回文章",
        count: withdrawnArticlesCount,
        description: `${withdrawnArticlesCount} 篇文章已撤回`,
        href: "/admin/articles?status=withdrawn",
        hrefLabel: "查看 →",
      });
    }

    return { ok: true, data: { items, totalCount: items.length } };
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn(
        "[dashboard] getTodoSummaryV2 failed:",
        error instanceof Error ? error.message : error,
      );
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getKpiSnapshotV2(): Promise<DashboardFetchResult<DashboardKpiV2>> {
  try {
    const { start, end } = getMonthRange();
    const [activeStores, publishedArticles, monthlyPageViews, monthlyContactIntent] = await Promise.all([
      prisma.store.count({
        where: {
          OR: [
            { status: "active" },
            { isActive: true, status: { notIn: ["suspended", "terminated"] } },
          ],
        },
      }),
      prisma.article.count({ where: { status: "published" } }),
      prisma.analyticsEvent.count({
        where: { type: "pageview", timestamp: { gte: start, lt: end } },
      }),
      prisma.analyticsEvent.count({
        where: { type: { in: ["reservation", "form_submit"] }, timestamp: { gte: start, lt: end } },
      }),
    ]);
    return {
      ok: true,
      data: { activeStores, publishedArticles, monthlyPageViews, monthlyContactIntent },
    };
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn(
        "[dashboard] getKpiSnapshotV2 failed:",
        error instanceof Error ? error.message : error,
      );
    }
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}

export async function getContentSummaryV2(): Promise<DashboardFetchResult<ContentSummaryV2>> {
  return {
    ok: true,
    data: { byStatus: [], recent7dPublished: 0, topCategories: [], missingCover: 0 },
  };
}

export async function getInterestSummaryV2(): Promise<DashboardFetchResult<InterestSummaryV2>> {
  return {
    ok: true,
    data: {
      dailyTrend30d: [],
      topProductInterest: [],
      topTopicInterest: [],
      topStoreViews: [],
      contactTrend30d: [],
      zeroReason: null,
    },
  };
}

// V2 聚合函数：接收 session，按 role 过滤快捷入口
export async function getDashboardSummaryV2(session: Session | null): Promise<DashboardSummaryV2> {
  const results = await Promise.allSettled([
    getWelcomeV2(session),
    getTodoSummaryV2(),
    getKpiSnapshotV2(),
    getStoreSummary(),
    getContentSummaryV2(),
    getInterestSummaryV2(),
    getRecentActivity(10),
  ]);

  const extract = <T>(r: PromiseSettledResult<DashboardFetchResult<T>>): T | null =>
    r.status === "fulfilled" && r.value.ok ? r.value.data : null;

  const role = session?.user?.role ?? "editor";

  const quickActions: QuickActionV2[] = [
    {
      href: "/admin/articles/new",
      label: "新建文章",
      desc: "撰写新闻或行业文章",
      iconName: "FileText",
      visible: true,
    },
    {
      href: "/admin/stores/new",
      label: "新建门店",
      desc: "添加一个新门店到网络",
      iconName: "Plus",
      visible: role === "admin",
    },
    {
      href: "/admin/analytics",
      label: "查看分析",
      desc: "访问趋势与门店热度",
      iconName: "BarChart3",
      visible: true,
    },
    {
      href: "/admin/consultation-channels",
      label: "管理咨询渠道",
      desc: "配置企业微信/电话/导航等承接渠道",
      iconName: "MessageCircle",
      visible: role === "admin",
      disabled: true,
      disabledHint: "规划中，预计下一版本上线",
    },
    {
      href: "/admin/stores?image=missing",
      label: "查看待完善门店",
      desc: "补全资料与封面图",
      iconName: "ImageOff",
      visible: true,
    },
    {
      href: "/admin/articles?status=draft",
      label: "查看草稿文章",
      desc: "继续编辑未发布的文章",
      iconName: "FileEdit",
      visible: true,
    },
  ];

  return {
    welcome: extract(results[0]),
    todoSummary: extract(results[1]),
    kpi: extract(results[2]),
    storeSummary: extract(results[3]),
    contentSummary: extract(results[4]),
    interestSummary: extract(results[5]),
    recentActivity: extract(results[6]),
    quickActions,
    fetchedAt: new Date().toISOString(),
  };
}