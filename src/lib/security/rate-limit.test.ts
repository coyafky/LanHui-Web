import { describe, it, expect, beforeEach } from "vitest";
import { rateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  beforeEach(() => {
    // 清理所有记录
    rateLimiter["store"].clear();
  });

  it("窗口内超限被拒绝 — 60 次后第 61 次返回 ok:false", () => {
    const key = "test:user-1";

    // 前 60 次应该都通过
    for (let i = 0; i < 60; i++) {
      const result = rateLimiter.check(key, 60, 60_000);
      expect(result.ok).toBe(true);
    }

    // 第 61 次应该被拒绝
    const result = rateLimiter.check(key, 60, 60_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.limit).toBe(60);
    }
  });

  it("窗口过期后恢复 — 超限后等待 window 重置", () => {
    const key = "test:user-2";

    // 填满窗口
    for (let i = 0; i < 60; i++) {
      rateLimiter.check(key, 60, 60_000);
    }

    // 确认被限
    const blocked = rateLimiter.check(key, 60, 60_000);
    expect(blocked.ok).toBe(false);

    // 手动将 resetAt 设为过去（模拟窗口过期）
    const entry = rateLimiter["store"].get(key);
    if (entry) {
      entry.resetAt = Date.now() - 1;
    }

    // 窗口过期后应该恢复
    const recovered = rateLimiter.check(key, 60, 60_000);
    expect(recovered.ok).toBe(true);
    if (recovered.ok) {
      expect(recovered.remaining).toBe(59);
    }
  });

  it("不同 key 互不影响", () => {
    // key-1 填满
    for (let i = 0; i < 60; i++) {
      rateLimiter.check("key-1", 60, 60_000);
    }

    // key-2 应该还能正常访问
    for (let i = 0; i < 60; i++) {
      const result = rateLimiter.check("key-2", 60, 60_000);
      expect(result.ok).toBe(true);
    }

    // key-1 被限制
    expect(rateLimiter.check("key-1", 60, 60_000).ok).toBe(false);

    // key-2 应该第 61 次被限制
    expect(rateLimiter.check("key-2", 60, 60_000).ok).toBe(false);
  });

  it("retryAfter 值正确计算", () => {
    const key = "test:user-4";

    // 填满窗口
    for (let i = 0; i < 60; i++) {
      rateLimiter.check(key, 60, 10_000);
    }

    const result = rateLimiter.check(key, 60, 10_000);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // retryAfter 应该是正数秒，且 <= 窗口大小 / 1000（刚刚被限时接近窗口剩余秒数）
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(10);
      // resetAt 应该是未来的时间戳
      expect(result.resetAt).toBeGreaterThan(Date.now());
    }
  });
});
