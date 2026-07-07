---
comet_change: admin-security-foundation
role: technical-design
canonical_spec: openspec
---

# admin-security-foundation — 技术设计

## 架构

```
Route Handler (existing, unchanged auth/role checks)
    │
    ├── 1. auth() session ──── 保留现有代码不动
    ├── 2. role check ──────── 保留现有代码不动
    ├── 3. requireCsrf(request) ──── 新增: csrf.ts
    ├── 4. rateLimiter.check() ───── 新增: rate-limit.ts
    └── 5. business logic ──── 保留现有代码不动

GET /api/admin/csrf ──── auth() → generateCsrfToken() → Set-Cookie + JSON
```

**叠加模式**：不创建 api-guard.ts，每个 route handler 在现有 auth/role 检查之后显式调用 CSRF 和 rate-limit 两个独立函数。

## 模块设计

### rate-limit.ts

```ts
interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter?: number; // 仅 ok=false 时
}

class RateLimiter {
  private store: Map<string, { count: number; resetAt: number }>;

  check(key: string, max: number, windowMs: number): RateLimitResult;
}

export const rateLimiter = new RateLimiter();
```

- 固定窗口算法
- 每次 `check()` 惰性清理过期记录（遍历 Map 删除 `resetAt < now` 的条目）
- `retryAfter = Math.ceil((resetAt - now) / 1000)`

### csrf.ts

```ts
export function generateCsrfToken(): string; // crypto.randomUUID()
export function requireCsrf(request: NextRequest):
  { ok: true } | { ok: false; response: Response };
```

- `requireCsrf` 从 cookie 中读取 `lanhui_csrf`，从 header 读取 `x-csrf-token`，比对
- 任一缺失或不等 → 403 + `{ success: false, error: "CSRF 校验失败，请刷新页面后重试" }`
- 不做 token 过期校验（会话级复用）

### /api/admin/csrf

```
GET /api/admin/csrf
  ← auth() guard (未登录 → 401)
  → Set-Cookie: lanhui_csrf=<token>; HttpOnly; SameSite=Lax; Path=/
  → { success: true, data: { token: "<token>" } }
```

## Route 接入清单

| Route | Methods | Role | CSRF | Rate Limit |
|-------|---------|------|------|------------|
| `/api/articles` | POST | admin/editor | ✓ | 60/min/user |
| `/api/articles/[id]` | PUT, DELETE | admin/editor | ✓ | 60/min/user |
| `/api/articles/[id]/[action]` | POST | admin/editor | ✓ | 60/min/user |
| `/api/articles/bulk` | POST | admin/editor | ✓ | 60/min/user |
| `/api/stores` | POST | admin | ✓ | 60/min/user |
| `/api/stores/[id]` | PUT, PATCH, DELETE | admin | ✓ | 60/min/user |
| `/api/stores/[id]/[action]` | POST | admin | ✓ | 60/min/user |
| `/api/upload` | POST, DELETE | admin/editor* | ✓ | 10/min + 30/day |

*upload 的 role 已有 `ensureUploadPermission()` 处理 entity 维度差异，不动。

## 测试策略

| 测试文件 | 类型 | 场景 |
|----------|------|------|
| `rate-limit.test.ts` | vitest | 4: 超限/窗口恢复/不同 key/Retry-After |
| `csrf.test.ts` | vitest | 3: 缺 header/不匹配/匹配通过 |
| 已有 route tests | vitest | 补充 CSRF mock 不破坏现有测试 |

## Implementation Divergence

### api-security-guard：叠加模式 vs 统一守卫

**OpenSpec delta spec** `api-security-guard/spec.md` 要求创建 `src/lib/security/api-guard.ts`，提供统一的 `requireAdminWriteGuard(request)` 函数，在单一函数内整合 auth → role → CSRF → rate-limit 校验链。

**实际实现**采用**叠加模式（Option B）**：不创建 `api-guard.ts`，每个 route handler 在现有 auth/role 检查之后显式调用 `requireCsrf()` + `rateLimiter.check()` 两个独立函数。

**原因**：
1. 不同 route handler 的 auth/role 检查逻辑不同（stores 仅 admin，articles 允许 admin+editor，upload 按 entity 维度区分），统一守卫反而需要额外的 role 参数传递
2. 叠加模式让每个 route 的安全行为完全透明、可独立审计，任何人对单个 route 的安全检查一目了然
3. 减少对现有 auth/role 代码的改动范围，降低引入回归风险
4. 安全效果等价：两种模式下的校验链完全一致（auth → role → CSRF → rate-limit）

**影响**：归档时 `api-security-guard/spec.md` 不合并到 main spec，`design.md` 中关于统一守卫的描述以本 Design Doc 的叠加模式为准。
