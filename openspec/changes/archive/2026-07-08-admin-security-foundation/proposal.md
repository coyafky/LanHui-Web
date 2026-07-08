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
