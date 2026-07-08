# csrf-protection Specification

## Purpose
TBD - created by archiving change admin-security-foundation. Update Purpose after archive.
## Requirements
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

