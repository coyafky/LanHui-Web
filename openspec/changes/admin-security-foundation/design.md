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
