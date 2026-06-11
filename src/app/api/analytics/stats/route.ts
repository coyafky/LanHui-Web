import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/analytics/stats
 * 需要 admin 权限
 * 查询参数：startDate, endDate, groupBy(day/week/month)
 */

type GroupBy = 'day' | 'week' | 'month';

interface StatsResponse {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  topPages: { pathname: string; count: number }[];
  topStores: { storeId: string; storeName: string; count: number }[];
  dailyTrend: { date: string; count: number }[];
}

export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { success: false, error: '未认证' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return Response.json(
        { success: false, error: '权限不足' },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = request.nextUrl;
    const endDateParam = searchParams.get('endDate') || new Date().toISOString();
    const startDateParam = searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const groupBy = (searchParams.get('groupBy') || 'day') as GroupBy;

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return Response.json(
        { success: false, error: '无效的日期格式' },
        { status: 400 }
      );
    }

    const validGroupBy: GroupBy[] = ['day', 'week', 'month'];
    if (!validGroupBy.includes(groupBy)) {
      return Response.json(
        { success: false, error: 'groupBy 必须为 day/week/month' },
        { status: 400 }
      );
    }

    const dateFilter = {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    };

    // 并行查询所有数据
    const [totalEvents, eventsByTypeRaw, topPagesRaw, topStoresRaw, dailyTrendRaw] =
      await Promise.all([
        // 总事件数
        prisma.analyticsEvent.count({ where: dateFilter }),

        // 按类型分组
        prisma.analyticsEvent.groupBy({
          by: ['type'],
          where: dateFilter,
          _count: { type: true },
          orderBy: { _count: { type: 'desc' } },
        }),

        // 热门页面 Top 10
        prisma.analyticsEvent.groupBy({
          by: ['pathname'],
          where: dateFilter,
          _count: { pathname: true },
          orderBy: { _count: { pathname: 'desc' } },
          take: 10,
        }),

        // 热门门店 Top 10（需要关联 Store 表获取名称）
        prisma.analyticsEvent.groupBy({
          by: ['storeId'],
          where: {
            ...dateFilter,
            storeId: { not: null },
          },
          _count: { storeId: true },
          orderBy: { _count: { storeId: 'desc' } },
          take: 10,
        }),

        // 每日趋势（按 groupBy 分 3 个独立 queryRaw，避免 ${groupBy} 被参数化为 $1）
        (() => {
          const whereClause = Prisma.sql`WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}`;
          if (groupBy === 'day') {
            return prisma.$queryRaw<Array<{ date: string; count: number }>>`
              SELECT
                DATE_TRUNC('day', "timestamp")::date::text AS date,
                COUNT(*)::int AS count
              FROM "AnalyticsEvent"
              ${whereClause}
              GROUP BY DATE_TRUNC('day', "timestamp")
              ORDER BY date ASC
            `;
          } else if (groupBy === 'week') {
            return prisma.$queryRaw<Array<{ date: string; count: number }>>`
              SELECT
                DATE_TRUNC('week', "timestamp")::date::text AS date,
                COUNT(*)::int AS count
              FROM "AnalyticsEvent"
              ${whereClause}
              GROUP BY DATE_TRUNC('week', "timestamp")
              ORDER BY date ASC
            `;
          } else {
            // 'month'
            return prisma.$queryRaw<Array<{ date: string; count: number }>>`
              SELECT
                DATE_TRUNC('month', "timestamp")::date::text AS date,
                COUNT(*)::int AS count
              FROM "AnalyticsEvent"
              ${whereClause}
              GROUP BY DATE_TRUNC('month', "timestamp")
              ORDER BY date ASC
            `;
          }
        })(),
      ]);

    // 获取门店名称
    const storeIds = topStoresRaw
      .map((s) => s.storeId)
      .filter((id): id is string => id !== null);

    const stores = storeIds.length > 0
      ? await prisma.store.findMany({
          where: { id: { in: storeIds } },
          select: { id: true, name: true },
        })
      : [];

    const storeNameMap = new Map(stores.map((s) => [s.id, s.name]));

    // 组装响应
    const result: StatsResponse = {
      totalEvents,
      eventsByType: eventsByTypeRaw.map((item) => ({
        type: item.type,
        count: item._count.type,
      })),
      topPages: topPagesRaw.map((item) => ({
        pathname: item.pathname,
        count: item._count.pathname,
      })),
      topStores: topStoresRaw.map((item) => ({
        storeId: item.storeId ?? '',
        storeName: storeNameMap.get(item.storeId ?? '') ?? '未知门店',
        count: item._count.storeId,
      })),
      dailyTrend: dailyTrendRaw.map((item) => ({
        date: item.date,
        count: Number(item.count),
      })),
    };

    return Response.json({ success: true, data: result });
  } catch (error) {
    console.error('[GET /api/analytics/stats]', error);
    return Response.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}