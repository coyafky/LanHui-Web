import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { getRequestContext } from '@/lib/request-context';

const MAX_EVENTS_PER_REQUEST = 50;
const MAX_PATHNAME_LENGTH = 256;

const EventType = z.enum(['pageview', 'click', 'form_submit', 'reservation', 'store_view']);

const TrackEventSchema = z.object({
  type: EventType,
  pathname: z.string().min(1).max(MAX_PATHNAME_LENGTH),
  storeId: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  eventId: z.string().max(128).optional(),
});

const TrackPayloadSchema = z.object({
  events: z.array(TrackEventSchema).min(1).max(MAX_EVENTS_PER_REQUEST),
});

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

export async function POST(request: Request) {
  const start = Date.now();
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
      logger.warn({ event: "analytics.rate_limited", ip: rateLimitKey });
      return Response.json(
        { success: false, error: '请求过于频繁' },
        { status: 429 }
      );
    }

    // 解析请求体
    const body = await request.json();

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return Response.json({ success: false, error: '无效的请求格式' }, { status: 400 });
    }

    const parsed = TrackPayloadSchema.safeParse(body);
    if (!parsed.success) {
      const dropped = body.events?.length ?? 0;
      logger.warn({ event: 'analytics.invalid_payload', issues: parsed.error.flatten().fieldErrors, dropped });
      return Response.json({ success: true, count: 0, invalidCount: dropped });
    }

    const validEvents = parsed.data.events;

    if (validEvents.length === 0) {
      return Response.json({
        success: true,
        count: 0,
        invalidCount: 0,
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

    const trackCtx = getRequestContext(request, "/api/analytics/track");
    logger.info({
      event: "api.request.completed",
      ...trackCtx,
      status: 200,
      durationMs: Date.now() - start,
      count: result.count,
      invalidCount: 0,
    });

    return Response.json({
      success: true,
      count: result.count,
      invalidCount: 0,
    });
  } catch (error) {
    const trackErrCtx = getRequestContext(request, "/api/analytics/track");
    logger.error({
      event: "api.request.failed",
      ...trackErrCtx,
      status: 500,
      durationMs: Date.now() - start,
      error,
    });
    return Response.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
