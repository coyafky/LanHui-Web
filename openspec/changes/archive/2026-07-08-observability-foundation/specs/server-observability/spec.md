# Server Observability

服务端可观测性基础设施 — 结构化日志、requestId 追踪、敏感字段脱敏、duration 计时、可选 APM 错误上报。

## ADDED Requirements

### Requirement: 结构化 Logger

系统 MUST 提供基于 pino 的统一结构化 JSON logger。

#### Scenario: 服务端初始化 logger

- **GIVEN** 代码在服务端（Node.js）环境下执行
- **WHEN** `import { logger } from "@/lib/logger"` 被调用
- **THEN** 返回的 logger 实例输出 JSON 格式日志
- **AND** 支持 `debug`、`info`、`warn`、`error` 四个 level
- **AND** development 环境默认 `debug` level
- **AND** production 环境默认 `info` level
- **AND** `LOG_LEVEL` 环境变量可覆盖默认 level

#### Scenario: 日志包含结构化字段

- **GIVEN** logger 实例可用
- **WHEN** `logger.error({ event: "api.error", route, method, requestId, error })` 被调用
- **THEN** 输出的 JSON 包含 `event`、`route`、`method`、`requestId` 字段
- **AND** `error` 字段序列化为 `{ name, message, stack, cause?, code?, meta? }`

#### Scenario: 敏感字段脱敏

- **GIVEN** 日志对象包含敏感字段
- **WHEN** 日志被序列化输出
- **THEN** `password`、`token`、`cookie`、`authorization`、`csrf`、`sessionToken` 等字段不出现在日志中
- **AND** 嵌套对象中的敏感字段同样被递归移除

### Requirement: Request Context 提取

系统 MUST 提供统一的 request context 提取工具。

#### Scenario: 从请求头读取 requestId

- **GIVEN** 一个 `Request` 或 `NextRequest` 对象
- **WHEN** 请求头包含 `x-request-id: req-abc-123`
- **THEN** `getRequestContext(request)` 返回 `{ requestId: "req-abc-123" }`

#### Scenario: requestId 缺失时自动生成

- **GIVEN** 一个 `Request` 对象，无 `x-request-id` 和 `x-vercel-id` header
- **WHEN** `getRequestContext(request)` 被调用
- **THEN** 返回的 `requestId` 是一个有效的 UUID v4 字符串

#### Scenario: 从 Vercel ID 回退读取

- **GIVEN** 请求头包含 `x-vercel-id: vc-456`，但无 `x-request-id`
- **WHEN** `getRequestContext(request)` 被调用
- **THEN** 返回的 `requestId` 为 `"vc-456"`

#### Scenario: 提取请求元信息

- **GIVEN** 一个 `NextRequest` 对象，method 为 `POST`，pathname 为 `/api/stores`
- **WHEN** `getRequestContext(request, "/api/stores")` 被调用
- **THEN** 返回对象包含 `method: "POST"`、`route: "/api/stores"`、`path`、`ip`、`userAgent`

### Requirement: API Route 错误日志替换

系统 MUST 将 API route 中的裸 `console.error`/`console.warn` 替换为结构化 logger 调用。

#### Scenario: API 错误日志包含追踪信息

- **GIVEN** 一个 API route handler 中发生错误
- **WHEN** catch 块记录错误
- **THEN** 日志包含 `event: "api.error"`、`route`、`method`、`requestId`、`error`（序列化后的 Error）
- **AND** 不再使用 `console.error`

#### Scenario: 关键写 API 记录 duration

- **GIVEN** upload POST/DELETE、stores POST/PATCH/PUT/DELETE/action、articles POST/PUT/DELETE/bulk/action、analytics track API
- **WHEN** 请求处理完成
- **THEN** 成功时记录 `logger.info({ event: "api.request.completed", route, method, status, durationMs, requestId, userId })`
- **AND** 失败时记录 `logger.error({ event: "api.request.failed", route, method, status, durationMs, requestId, userId, error })`

### Requirement: APM 错误追踪接口

系统 MUST 提供可插拔的 APM 错误追踪接口。

#### Scenario: Sentry DSN 未配置时不影响运行

- **GIVEN** 环境变量 `SENTRY_DSN` 未设置
- **WHEN** `captureException(error, context)` 被调用
- **THEN** 仅调用 `logger.error` 记录错误
- **AND** 不抛异常、不影响业务流程
- **AND** `npm run build` 不因 Sentry 缺失而失败

#### Scenario: Sentry DSN 配置后自动上报

- **GIVEN** 环境变量 `SENTRY_DSN` 已配置
- **WHEN** `captureException(error, context)` 被调用
- **THEN** 错误通过 Sentry SDK 上报到对应 project

### Requirement: Error Boundary 接入上报

系统 MUST 在 error boundary 中接入 `captureException` 上报。

#### Scenario: Global error boundary 捕获异常

- **GIVEN** `global-error.tsx` 捕获到一个客户端 error
- **WHEN** error boundary 渲染
- **THEN** 调用 `captureException(error, { digest, boundary: "global" })`
- **AND** 用户看到友好错误页面
- **AND** development 环境保留 error message/digest 展示

#### Scenario: Admin error boundary 捕获异常

- **GIVEN** `admin/(dashboard)/error.tsx` 捕获到一个客户端 error
- **WHEN** error boundary 渲染
- **THEN** 调用 `captureException(error, { digest, boundary: "admin" })`

### Requirement: admin-dashboard 降级日志结构化

系统 MUST 将 `admin-dashboard.ts` 中 `console.warn` 替换为 `logger.warn`。

#### Scenario: Dashboard 数据获取失败时降级

- **GIVEN** `admin-dashboard.ts` 中某个数据查询失败
- **WHEN** catch 块捕获错误
- **THEN** 调用 `logger.warn({ event: "admin-dashboard.fetch.failed", module, error })`
- **AND** 不抛异常、返回空数组/0 值等降级结果
- **AND** dashboard 渲染结果不变

### Requirement: Analytics 日志结构化

系统 MUST 将服务端 analytics 相关 `console.warn` 替换为 `logger.warn`。

#### Scenario: Rate limit 命中

- **GIVEN** `/api/analytics/track` 中某个 IP 触发 rate limit
- **WHEN** 请求被拒绝
- **THEN** 调用 `logger.warn({ event: "analytics.rate_limited", requestId, ip })`

#### Scenario: Invalid event type

- **GIVEN** `/api/analytics/track` 收到非法 event type
- **WHEN** 请求被拒绝
- **THEN** 调用 `logger.warn({ event: "analytics.invalid_event", requestId, eventType })`

### Requirement: Settings 页面可观测性模块

系统 MUST 在 `/admin/settings` 页面展示可观测性状态。

#### Scenario: 展示日志状态

- **GIVEN** 用户已登录 admin
- **WHEN** 访问 `/admin/settings`
- **THEN** 页面展示"可观测性"模块
- **AND** 包含：结构化日志（已启用）、日志级别（读取 `LOG_LEVEL` 默认值）、requestId（已启用）、敏感字段脱敏（已启用）
- **AND** APM 状态根据 `SENTRY_DSN` 显示"已配置"或"未配置"
- **AND** 不显示 DSN 明文
