# Comet Design Handoff

- Change: admin-security-foundation
- Phase: design
- Mode: compact
- Context hash: 9908f41d091609cdf3858924908cc487802fdbdc2e20f349892123f4dc4c36a9

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/admin-security-foundation/proposal.md

- Source: openspec/changes/admin-security-foundation/proposal.md
- Lines: 1-33
- SHA256: 2a0a7e30ac158aeca999ffeb1a0521f1c890705754663f195da19b8a8b81c8cd

```md
## Why

管理后台所有写 API（POST/PUT/PATCH/DELETE）当前仅依赖 cookie session 认证，缺少速率限制和 CSRF 保护。这意味着已登录用户可被 CSRF 攻击利用，且恶意或失控请求可无限消耗服务器资源。需要建立统一的安全基础设施层，为后续上传强化和设置页面提供安全基础。

## What Changes

- 新增 `src/lib/security/rate-limit.ts`：基于内存 Map 的速率限制模块，支持按 IP/userId/route 等 key 限流，窗口期内超限返回 429 + `Retry-After`
- 新增 `src/lib/security/csrf.ts`：双重提交令牌模式，生成/校验 CSRF token（cookie + header 比对）
- 新增 `src/lib/security/api-guard.ts`：统一管理写 API 守卫函数，整合 auth → role → CSRF → rate-limit 校验链
- 新增 `src/app/api/admin/csrf/route.ts`：GET 端点，已登录用户获取 CSRF token
- 修改所有管理后台写 API route handlers：接入统一守卫，按顺序执行认证/授权/CSRF/限流
- 公开 `POST /api/analytics/track` 不受 CSRF 限制，保留现有 IP 限流策略

## Capabilities

### New Capabilities

- `api-rate-limiting`: 管理后台写 API 速率限制——基于内存 Map，按 userId/route/IP 维度限流，超限返回 429 + Retry-After，窗口过期自动清理
- `csrf-protection`: 管理后台写 API CSRF 保护——双重提交令牌（cookie + x-csrf-token header），通过 GET /api/admin/csrf 获取 token
- `api-security-guard`: 统一 API 安全守卫——整合 auth() session 校验、role 权限校验、CSRF 校验、速率限制，提供 `requireAdminWriteGuard()` 等便捷函数

### Modified Capabilities

<!-- 本次不修改已有 spec，仅为新增能力 -->

## Impact

- 新增文件：`src/lib/security/rate-limit.ts`、`src/lib/security/csrf.ts`、`src/lib/security/api-guard.ts`、`src/app/api/admin/csrf/route.ts`
- 修改文件：所有管理后台写 API route handlers（约 8 个文件）
- 不引入新依赖
- 不影响公开站前端访问逻辑
- 不破坏 NextAuth 登录流程
- 不修改已有 spec
```

## openspec/changes/admin-security-foundation/design.md

- Source: openspec/changes/admin-security-foundation/design.md
- Lines: 1-71
- SHA256: a26e67d4c41b8361f3f49261fa64f3935da59adfa28b378a9f1737a4ef9515e2

```md
## Context

当前管理后台所有写 API 仅通过 `auth()` 和 role 检查保护，存在两个安全缺口：
1. 无速率限制——恶意或失控请求可无限消耗资源
2. 无 CSRF 保护——依赖 cookie session 但未验证请求来源

WeChat 生态内管理后台虽不面向公网，但安全基础设施的缺失仍是风险。PRD `ADMIN_PROBLEM2.md` 明确要求补齐这两项，本次 change 聚焦安全基础设施层。

## Goals / Non-Goals

**Goals:**
- 新增内存级速率限制模块，支持按 userId/route/IP 限流，超限返回 429
- 新增双重提交令牌 CSRF 保护，cookie + header 比对
- 新增统一 API 守卫函数，整合 auth → role → CSRF → rate-limit
- 将守卫接入所有管理后台写 API route handlers
- 不引入新依赖

**Non-Goals:**
- 不改造上传模块（留给 Change 2）
- 不创建 `/admin/settings` 页面（留给 Change 3）
- 不修改公开 `POST /api/analytics/track`
- 不改 NextAuth 登录流程
- 不做 Redis/外部存储（保留接口即可）

## Decisions

### 1. 速率限制：内存 Map + 滑动窗口

**选择**：`Map<string, { count, resetAt }>` + 固定窗口

**替代方案**：
- Token Bucket：更平滑但实现复杂，对管理后台场景过度
- Sliding Window Log：精度更高但内存开销大

**理由**：管理后台非高并发场景，固定窗口够用。保留 `RateLimiter` 接口，未来可替换 Redis 实现。

### 2. CSRF：双重提交令牌（Double Submit Cookie）

**选择**：服务端生成 token → 设 cookie `lanhui_csrf` + 通过 `/api/admin/csrf` JSON 返回 → 客户端读取后放入 `x-csrf-token` header → 服务端比对

**替代方案**：
- Synchronizer Token Pattern（服务端存储）：需要持久化，增加复杂度
- SameSite Cookie 仅依赖：部分旧浏览器不支持 Strict

**理由**：双重提交不要求服务端存储，实现简单。cookie httpOnly + token 通过 JSON 返回，兼顾安全与前端可用性。

### 3. API Guard：顺序校验链，早返回

**选择**：`auth → role → CSRF → rate-limit`，任一步失败立即返回错误响应

**理由**：避免不必要的校验开销。CSRF 在 rate-limit 之前执行，防止攻击者通过耗尽限流配额来探测 CSRF。

### 4. 不创建中间件，使用显式函数调用

**选择**：在每个 route handler 中显式调用 `await requireAdminWriteGuard(request)`

**替代方案**：Next.js middleware (`middleware.ts`) 统一拦截

**理由**：
- middleware 运行在 Edge Runtime，无法访问 `auth()`（需要 Node.js crypto）
- 显式调用让每个 route 的安全行为可见、可审计
- 不同 route 可能需要不同限流策略（如 upload 更严格）

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 内存 Map 在服务重启后丢失计数 | 可接受——管理后台低频使用，重启后重新计数影响小 |
| 多实例部署时内存 Map 不共享 | 当前单实例部署，架构预留 `RateLimiter` 接口 |
| CSRF token 在 httpOnly cookie 中，前端 JS 不可读 | token 通过 `/api/admin/csrf` JSON 响应返回，前端缓存使用 |
| 已有测试可能因新增 CSRF 校验失败 | Change 2 中通过 admin-fetch 统一处理，各 route 测试需更新 mock |
```

## openspec/changes/admin-security-foundation/tasks.md

- Source: openspec/changes/admin-security-foundation/tasks.md
- Lines: 1-26
- SHA256: 05dd6c4cc6c88e2640ea6e81143231f89efde93604edefc2197854f9e0d10ce6

```md
## 1. 安全基础设施模块

- [ ] 1.1 新增 `src/lib/security/rate-limit.ts`：`RateLimiter` 类，基于 Map 的固定窗口限流，支持 `check(key, max, windowMs)` → `{ ok, retryAfter, limit, remaining, resetAt }`，每次 check 时清理过期记录
- [ ] 1.2 新增 `src/lib/security/csrf.ts`：`generateCsrfToken()` 和 `requireCsrf(request)` 函数，双重提交令牌模式，token 使用 `crypto.randomUUID()`
- [ ] 1.3 新增 `src/lib/security/api-guard.ts`：`requireAdminWriteGuard(request, options?)` 函数，按 auth → role → CSRF → rate-limit 顺序校验

## 2. CSRF Token 端点

- [ ] 2.1 新增 `src/app/api/admin/csrf/route.ts`：`GET` 端点，已登录用户获取 CSRF token，设置 `lanhui_csrf` cookie + JSON 返回 token

## 3. API 路由接入安全守卫

- [ ] 3.1 接入 `src/app/api/articles/route.ts`：POST 加入 `requireAdminWriteGuard`
- [ ] 3.2 接入 `src/app/api/articles/[id]/route.ts`：PUT/DELETE 加入守卫
- [ ] 3.3 接入 `src/app/api/articles/[id]/[action]/route.ts`：POST 加入守卫
- [ ] 3.4 接入 `src/app/api/articles/bulk/route.ts`：POST 加入守卫
- [ ] 3.5 接入 `src/app/api/stores/route.ts`：POST 加入守卫
- [ ] 3.6 接入 `src/app/api/stores/[id]/route.ts`：PUT/PATCH/DELETE 加入守卫
- [ ] 3.7 接入 `src/app/api/stores/[id]/[action]/route.ts`：POST 加入守卫
- [ ] 3.8 接入 `src/app/api/upload/route.ts`：POST/DELETE 加入守卫（上传限流用更严格策略）

## 4. 测试

- [ ] 4.1 新增 `src/lib/security/rate-limit.test.ts`：窗口内超限、窗口过期恢复、不同 key 互不影响、retryAfter 正确计算
- [ ] 4.2 新增 `src/lib/security/csrf.test.ts`：缺 header 返回 403、token 不匹配返回 403、token 匹配通过
- [ ] 4.3 更新已有 API route 测试：为写操作补充合法 CSRF header/cookie mock，确保安全校验通过
```

## openspec/changes/admin-security-foundation/specs/api-rate-limiting/spec.md

- Source: openspec/changes/admin-security-foundation/specs/api-rate-limiting/spec.md
- Lines: 1-60
- SHA256: c3af90c2c09f53a2332004673914ac85855910343db0a0573ce41ca0433c4959

```md
# api-rate-limiting

管理后台写 API 速率限制能力。

## ADDED Requirements

### Requirement: 内存速率限制器

系统 SHALL 提供一个基于内存 Map 的速率限制模块 `src/lib/security/rate-limit.ts`，用于限制管理后台写 API 的请求频率。

#### Scenario: 窗口内正常请求通过

- **GIVEN** 用户 A 的 `POST /api/stores` 限制为 60 次/分钟
- **WHEN** 用户 A 在第 59 次请求时
- **THEN** 限流器返回 `{ ok: true, remaining: 1 }`

#### Scenario: 窗口内超限被拒绝

- **GIVEN** 用户 A 的 `POST /api/stores` 限制为 60 次/分钟
- **WHEN** 用户 A 在第 61 次请求时
- **THEN** 限流器返回 `{ ok: false, retryAfter: <秒数>, limit: 60, remaining: 0 }`
- **AND** API 返回 429 状态码
- **AND** 响应头包含 `Retry-After: <秒数>`

#### Scenario: 窗口过期后恢复

- **GIVEN** 用户 A 在 1 分钟前已达到限制
- **WHEN** 窗口过期后再次请求
- **THEN** 限流器返回 `{ ok: true, remaining: 59 }`

#### Scenario: 不同 key 互不影响

- **GIVEN** 用户 A 已达到 `POST /api/stores` 的 60 次/分钟限制
- **WHEN** 用户 B 请求同一端点
- **THEN** 用户 B 不受影响，正常通过

#### Scenario: 过期记录自动清理

- **GIVEN** 内存 Map 中存在 1000 条过期记录
- **WHEN** 每次调用限流器 `check()` 时
- **THEN** 过期记录被清理，内存不会无限增长

### Requirement: 限流维度

限流器 SHALL 支持以下 key 维度：

- `ip`：按 IP 地址限制
- `userId`：按用户 ID 限制
- `ip:userId`：按 IP + 用户 ID 组合限制
- `route:userId`：按路由 + 用户 ID 组合限制

### Requirement: 默认限流策略

系统 SHALL 应用以下默认限流策略：

| 目标 | 限制 |
|------|------|
| 普通管理写 API | 60 次/分钟/user |
| 上传 API (`POST /api/upload`) | 10 次/分钟/user + 30 次/天/user |
| 未登录请求（公开 track） | 60 次/分钟/IP |
```

## openspec/changes/admin-security-foundation/specs/api-security-guard/spec.md

- Source: openspec/changes/admin-security-foundation/specs/api-security-guard/spec.md
- Lines: 1-57
- SHA256: c79cde65a42f74f3f087e09969c835d8099a427a7a69d5d39d1aca0be2800263

```md
# api-security-guard

统一 API 安全守卫能力——整合认证、授权、CSRF、速率限制校验链。

## ADDED Requirements

### Requirement: 管理写 API 统一守卫

系统 SHALL 提供 `requireAdminWriteGuard(request)` 函数，按以下顺序执行校验链：

1. `auth()` session 校验 → 未登录返回 401
2. role 权限校验 → 非 admin/editor 返回 403
3. `requireCsrf()` CSRF 校验 → token 不匹配返回 403
4. `rateLimit.check()` 速率限制 → 超限返回 429 + `Retry-After`

#### Scenario: 合法请求通过完整校验链

- **GIVEN** 用户已登录为 admin，携带合法 CSRF token，未超限
- **WHEN** 调用 `requireAdminWriteGuard(request)`
- **THEN** 返回 `{ ok: true, userId: "<id>" }`

#### Scenario: 未登录返回 401

- **GIVEN** 用户未登录
- **WHEN** 调用 `requireAdminWriteGuard(request)`
- **THEN** 返回 `{ ok: false, response: Response(401) }`

#### Scenario: 非管理员返回 403

- **GIVEN** 用户已登录但 role 不是 admin 或 editor
- **WHEN** 调用 `requireAdminWriteGuard(request)`
- **THEN** 返回 `{ ok: false, response: Response(403) }`

#### Scenario: 超限返回 429

- **GIVEN** 用户已登录为 admin，CSRF 通过，但已超过速率限制
- **WHEN** 调用 `requireAdminWriteGuard(request)`
- **THEN** 返回 `{ ok: false, response: Response(429) }`
- **AND** 响应头包含 `Retry-After`

### Requirement: 不破坏现有 role 规则

守卫 SHALL 保持现有 admin/editor 权限模型不变：
- admin：门店、文章、上传、系统设置
- editor：文章相关、文章图片上传

#### Scenario: editor 可访问文章写 API

- **GIVEN** 用户为 editor 角色
- **WHEN** 调用 `POST /api/articles` 经过守卫
- **THEN** 权限校验通过

#### Scenario: editor 不可访问门店写 API

- **GIVEN** 用户为 editor 角色
- **WHEN** 调用 `POST /api/stores` 经过守卫
- **THEN** 权限校验返回 403
```

## openspec/changes/admin-security-foundation/specs/csrf-protection/spec.md

- Source: openspec/changes/admin-security-foundation/specs/csrf-protection/spec.md
- Lines: 1-61
- SHA256: f738cbc0df12cba2dae2b94e14d731732360f80b7f37e4e9959f39207d4fb718

```md
# csrf-protection

管理后台写 API CSRF 保护能力。

## ADDED Requirements

### Requirement: CSRF Token 获取端点

系统 SHALL 提供 `GET /api/admin/csrf` 端点，已登录用户可通过该端点获取 CSRF token。

#### Scenario: 已登录用户获取 token

- **GIVEN** 用户已通过 NextAuth 登录
- **WHEN** 用户请求 `GET /api/admin/csrf`
- **THEN** 返回 `{ success: true, data: { token: "<随机token>" } }`
- **AND** 响应 Set-Cookie 包含 `lanhui_csrf=<token>`，属性为 `sameSite: "lax"`, `path: "/"`, `httpOnly: true`

#### Scenario: 未登录用户获取 token 被拒绝

- **GIVEN** 用户未登录
- **WHEN** 用户请求 `GET /api/admin/csrf`
- **THEN** 返回 401
- **AND** 响应 `{ success: false, error: "未登录" }`

### Requirement: CSRF 校验函数

系统 SHALL 提供 `requireCsrf(request)` 函数，校验管理后台写 API 的 CSRF token。

#### Scenario: 缺少 x-csrf-token header 返回 403

- **GIVEN** 用户已登录但请求未携带 `x-csrf-token` header
- **WHEN** 调用 `requireCsrf(request)` 校验
- **THEN** 返回 `{ ok: false, response: Response(403) }`
- **AND** response body 为 `{ success: false, error: "CSRF 校验失败，请刷新页面后重试" }`

#### Scenario: token 与 cookie 不匹配返回 403

- **GIVEN** cookie `lanhui_csrf=A`，header `x-csrf-token: B`
- **WHEN** 调用 `requireCsrf(request)` 校验
- **THEN** 返回 `{ ok: false, response: Response(403) }`

#### Scenario: token 匹配时通过校验

- **GIVEN** cookie `lanhui_csrf=X`，header `x-csrf-token: X`
- **WHEN** 调用 `requireCsrf(request)` 校验
- **THEN** 返回 `{ ok: true }`

#### Scenario: 未登录用户先返回 401（非 403）

- **GIVEN** 用户未登录，请求无 session
- **WHEN** API guard 先校验 auth，再校验 CSRF
- **THEN** 返回 401（不是 403）
- **AND** 不会执行到 CSRF 校验步骤

### Requirement: CSRF Token 随机性

系统 SHALL 使用 `crypto.randomUUID()` 或等强度的随机源生成 CSRF token。

### Requirement: CSRF 仅保护管理写 API

系统 SHALL 仅对管理后台 `POST/PUT/PATCH/DELETE` 请求执行 CSRF 校验。公开端点（如 `POST /api/analytics/track`）不受 CSRF 保护。
```

