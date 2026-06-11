import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/analytics/track
 * 接收批量埋点事件，写入数据库
 */

const MAX_EVENTS_PER_REQUEST = 50;

// 简易内存限流：每 IP 每分钟最多 60 次请求
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 分钟
const RATE_LIMIT_MAX = 60;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// 定期清理过期的限流记录
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 120_000);
}

interface TrackEventInput {
  type: string;
  pathname: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    // 提取客户端信息
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') ?? undefined;
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    // BUG-5 修复：增加 Vercel/CF 头兜底
    const requestIp = headersList.get('x-vercel-forwarded-for')
      || headersList.get('cf-connecting-ip')
      || realIp;

    const resolvedIp = forwarded?.split(',')[0]?.trim() || requestIp || 'unknown';

    // BUG-5 修复：IP 格式校验，'unknown' 限流隔离（按 userAgent 分桶）
    const isValidIp = resolvedIp && resolvedIp !== 'unknown' && (
      /^\d{1,3}(\.\d{1,3}){3}$/.test(resolvedIp) ||
      /^[0-9a-fA-F:]+$/.test(resolvedIp)
    );
    const rateLimitKey = isValidIp ? resolvedIp : `unknown-${userAgent ?? 'no-ua'}`;

    // 限流检查
    if (!checkRateLimit(rateLimitKey)) {
      return Response.json(
        { success: false, error: '请求过于频繁' },
        { status: 429 }
      );
    }

    // 解析请求体
    const body = await request.json() as { events: TrackEventInput[] };

    if (!body.events || !Array.isArray(body.events)) {
      return Response.json(
        { success: false, error: '无效的请求数据' },
        { status: 400 }
      );
    }

    if (body.events.length > MAX_EVENTS_PER_REQUEST) {
      return Response.json(
        { success: false, error: `单次最多 ${MAX_EVENTS_PER_REQUEST} 条事件` },
        { status: 400 }
      );
    }

    // 基础验证
    const validTypes = new Set(['pageview', 'click', 'form_submit', 'reservation', 'store_view']);

    // BUG-4 修复：拆分 valid/invalid 事件并 warn
    const validEvents: TrackEventInput[] = [];
    const invalidEvents: TrackEventInput[] = [];
    for (const e of body.events) {
      if (e && e.type && validTypes.has(e.type) && e.pathname) {
        validEvents.push(e);
      } else {
        invalidEvents.push(e);
      }
    }

    if (invalidEvents.length > 0) {
      console.warn(
        `[POST /api/analytics/track] dropped ${invalidEvents.length} invalid events`,
        { sample: invalidEvents[0] }
      );
    }

    if (validEvents.length === 0) {
      return Response.json({
        success: true,
        count: 0,
        invalidCount: invalidEvents.length,
      });
    }

    // 批量写入
    const records = validEvents.map((event) => ({
      type: event.type,
      pathname: event.pathname,
      storeId: event.storeId || null,
      metadata: (event.metadata ?? null) as Record<string, unknown> | null,
      userAgent,
      ip: resolvedIp,
    }));

    const result = await prisma.analyticsEvent.createMany({
      data: records as Array<Parameters<typeof prisma.analyticsEvent.createMany>[0] extends { data: infer D } ? D : never>,
    });

    return Response.json({
      success: true,
      count: result.count,
      invalidCount: invalidEvents.length,
    });
  } catch (error) {
    console.error('[POST /api/analytics/track]', error);
    return Response.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
