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
