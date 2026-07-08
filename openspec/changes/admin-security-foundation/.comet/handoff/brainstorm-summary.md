# Brainstorm Summary

- Change: admin-security-foundation
- Date: 2026-07-07

## 确认的技术方案

1. **方案 B — 叠加模式**：保留现有 route handler 内 auth/role 检查代码不变，guard 不创建，每个 route 直接调用 `requireCsrf()` + `rateLimiter.check()`
2. **方案 B — 会话级 CSRF token**：token 绑定 session，不主动过期，`/api/admin/csrf` 每次可返回相同 token（客户端缓存一次即可）
3. **RateLimiter**：类 + 模块级单例，`check(key, max, windowMs)` → `{ ok, retryAfter, limit, remaining, resetAt }`，惰性清理
4. **CSRF**：`crypto.randomUUID()` 生成，cookie `lanhui_csrf` (httpOnly/sameSite=lax/path=/) + header `x-csrf-token` 比对
5. **不创建 api-guard.ts**：方案 B 下过度抽象，直接调用两个独立函数

## 关键取舍与风险

- 微小的代码重复（每个 route 2 步调用）换取零风险叠加（不改动现有 auth/role 逻辑）
- 内存 Map 重启丢失——可接受，管理后台低频
- CSRF token 不主动过期——cookie 被清除时自然失效

## 测试策略

- rate-limit.test.ts：4 场景（超限/恢复/不同 key/Retry-After）
- csrf.test.ts：3 场景（缺 header/不匹配/匹配）
- 已有 API route 测试：补充 CSRF cookie + header mock

## Spec Patch

无
