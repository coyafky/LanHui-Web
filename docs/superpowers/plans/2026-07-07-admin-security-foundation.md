---
change: admin-security-foundation
design-doc: docs/superpowers/specs/2026-07-07-admin-security-foundation-design.md
base-ref: 15eab1e9919d8b7ca1992888ba34c85432725d0d
---

# admin-security-foundation — 实施计划

## 任务 1: 安全基础设施模块

### 1.1 rate-limit.ts
- 创建 `src/lib/security/` 目录
- 实现 `RateLimiter` 类：Map + 固定窗口 + 惰性清理
- 导出单例 `rateLimiter`
- 验证：`vitest run src/lib/security/rate-limit.test.ts`

### 1.2 csrf.ts
- 实现 `generateCsrfToken()` — `crypto.randomUUID()`
- 实现 `requireCsrf(request)` — cookie `lanhui_csrf` vs header `x-csrf-token`
- 验证：`vitest run src/lib/security/csrf.test.ts`

### 1.3 安全模块常量
- 将限流默认值和上传策略常量提取到 `src/lib/security/upload-policy.ts`（可选）
- 或直接在 rate-limit.ts 中内联常量

## 任务 2: CSRF Token 端点

### 2.1 GET /api/admin/csrf
- 创建 `src/app/api/admin/csrf/route.ts`
- `GET`：auth() 校验 → generateCsrfToken() → Set-Cookie + JSON 返回
- 验证：`curl -v http://localhost:3000/api/admin/csrf`（需 cookie session）

## 任务 3: API 路由接入

### 3.1 文章 API
- `articles/route.ts` POST
- `articles/[id]/route.ts` PUT, DELETE
- `articles/[id]/[action]/route.ts` POST
- `articles/bulk/route.ts` POST

### 3.2 门店 API
- `stores/route.ts` POST
- `stores/[id]/route.ts` PUT, PATCH, DELETE
- `stores/[id]/[action]/route.ts` POST

### 3.3 上传 API
- `upload/route.ts` POST, DELETE（含更严格限流策略）

每个 route 接入模式（叠加，不动现有代码）：
```ts
// 在现有 auth/role 检查之后插入
import { requireCsrf } from "@/lib/security/csrf";
import { rateLimiter } from "@/lib/security/rate-limit";

const csrf = requireCsrf(request);
if (!csrf.ok) return csrf.response;

const rl = rateLimiter.check(`route:${session.user.id}`, 60, 60_000);
if (!rl.ok) return Response.json(
  { success: false, error: "请求过于频繁，请稍后再试", details: { retryAfter: rl.retryAfter } },
  { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
);
```

## 任务 4: 测试

### 4.1 rate-limit.test.ts
- 窗口内超限拒绝
- 窗口过期后恢复
- 不同 key 互不影响
- retryAfter 正确计算

### 4.2 csrf.test.ts
- 缺 x-csrf-token header → 403
- token 与 cookie 不匹配 → 403
- token 匹配 → 通过

### 4.3 已有 API route 测试
- 为写操作测试补充合法 CSRF cookie + header mock
- 验证：`vitest run` 全部通过

## 验证

```bash
npx tsc --noEmit           # 类型检查
vitest run                  # 全部测试
npm run build               # 构建
```
