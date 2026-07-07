/**
 * RateLimiter — 固定窗口速率限制器
 *
 * - 惰性清理：每次 check() 遍历 Map 清理过期记录
 * - 纯内存实现，无外部依赖
 */

type RateLimitOk = {
  ok: true;
  remaining: number;
  limit: number;
  resetAt: number;
};

type RateLimitBlocked = {
  ok: false;
  retryAfter: number;
  limit: number;
  resetAt: number;
};

type RateLimitResult = RateLimitOk | RateLimitBlocked;

class RateLimiter {
  private store: Map<string, { count: number; resetAt: number }>;

  constructor() {
    this.store = new Map();
  }

  check(key: string, max: number, windowMs: number): RateLimitResult {
    const now = Date.now();

    // 惰性清理过期条目
    this.evictExpired(now);

    const entry = this.store.get(key);
    if (!entry || now >= entry.resetAt) {
      // 新窗口
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { ok: true, remaining: max - 1, limit: max, resetAt: now + windowMs };
    }

    if (entry.count >= max) {
      return {
        ok: false,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        limit: max,
        resetAt: entry.resetAt,
      };
    }

    entry.count += 1;
    return { ok: true, remaining: max - entry.count, limit: max, resetAt: entry.resetAt };
  }

  private evictExpired(now: number): void {
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();
