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
