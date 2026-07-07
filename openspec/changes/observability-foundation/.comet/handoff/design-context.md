# Comet Design Handoff

- Change: observability-foundation
- Phase: design
- Mode: compact
- Context hash: dc984ebd8e75027b3135461637e4e4a345c07b73eab7c4d3832df5df84c9cba7

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/observability-foundation/proposal.md

- Source: openspec/changes/observability-foundation/proposal.md
- Lines: 1-34
- SHA256: 601d5ad1a0ac1c4bc5cef84e9b6f9927aeb154632c9a6cb0e45e71c7ca9a3403

```md
## Why

当前项目服务端错误仅依赖裸 `console.error` / `console.warn`，无统一 logger、无 requestId 追踪、无结构化字段、无 APM 集成。生产环境问题排查完全依赖用户反馈，无法按 route/user/requestId/status/duration 追踪错误链路。这是审计报告中 P0-3 级别的基础设施缺陷。

## What Changes

- 新增 `src/lib/logger.ts` — 基于 pino 的结构化 JSON logger，支持 level 控制、敏感字段脱敏、Error 对象序列化
- 新增 `src/lib/request-context.ts` — 从请求中提取 requestId/method/route/ip/userAgent 的统一 helper
- 新增 `src/lib/observability.ts` — 可插拔的 `captureException` 包装，Sentry DSN 配置时自动上报
- 替换 16 个 API route 文件中所有 `console.error`/`console.warn` 为结构化 logger 调用
- 为关键写 API（upload/stores/articles/analytics）增加 duration 计时日志
- 替换 `src/lib/admin-dashboard.ts` 中 6 处 `console.warn` 为 `logger.warn`
- 替换 `src/lib/analytics.ts` 中服务端 `console.warn` 为 `logger.warn`
- 4 个 error boundary 接入 `captureException` 上报
- 新增 Sentry 配置骨架（`sentry.server.config.ts`、`sentry.client.config.ts`），DSN 缺失时不影响构建
- 新建 `/admin/settings` 页面，展示可观测性状态模块

## Capabilities

### New Capabilities

- `server-observability`: 服务端可观测性基础设施 — 结构化日志输出、requestId 追踪、敏感字段脱敏、duration 计时、可选 Sentry APM 错误上报、error boundary 捕获集成

### Modified Capabilities

无。此为全新 infrastructure capability，不修改现有 spec。

## Impact

- 新增依赖：`pino`、`@sentry/nextjs`（可选）
- 修改文件：16 个 API route、`admin-dashboard.ts`、`analytics.ts`、4 个 error boundary
- 新增文件：`logger.ts`、`request-context.ts`、`observability.ts`、sentry configs、`instrumentation.ts`（如需）、`/admin/settings/page.tsx`
- 新增测试：`logger.test.ts`、`request-context.test.ts`、`observability.test.ts`
- API response shape 不变，业务逻辑不变
```

## openspec/changes/observability-foundation/design.md

- Source: openspec/changes/observability-foundation/design.md
- Lines: 1-109
- SHA256: e7edc7d8e5f4566418467e5a126ce472564b2c82dee61776202f3f9b58f0cc99

[TRUNCATED]

```md
## Context

当前项目 16 个 API route 文件共 24 处 `console.error`，`admin-dashboard.ts` 6 处 `console.warn`，`analytics.ts` 1 处 `console.warn`。无统一 logger、无 requestId、无结构化字段、无 APM 集成。错误排查完全依赖日志字符串匹配和用户反馈。

## Goals / Non-Goals

**Goals:**
- 统一服务端 logger：基于 pino 输出 JSON 结构化日志
- requestId 全链路追踪：从 `x-request-id` / `x-vercel-id` 读取或自动生成 UUID
- 敏感字段脱敏：password/token/cookie/authorization 等不出现在日志中
- 关键 API duration 计时
- 可选 Sentry APM：DSN 配置后自动上报，未配置不影响运行
- Error boundary 接入 `captureException`
- admin-dashboard 降级日志结构化
- 新建 `/admin/settings` 页面展示可观测性状态

**Non-Goals:**
- 不替换 `scripts/` 下的 `console.log`
- 不改 API response shape
- 不改业务逻辑
- 不要求本地必须配置 Sentry
- 不治理客户端 `console.warn`（仅限 development 保留）
- 不做无关 UI 重构

## Decisions

### Decision 1: pino 作为 logger 引擎

**选择：** pino

**替代方案：**
- winston：功能更强但体积大，JSON 输出性能不如 pino
- 自建 JSON.stringify 包装：不必要，pino 已是最佳实践
- console.log 包装：无结构化 level 控制，无序列化能力

**理由：** pino 是 Node.js 生态最快的 JSON logger，Next.js/Vercel 生态广泛使用，支持 browser/edge bundling 友好配置。

### Decision 2: 不记录 request body，只记录元信息

**选择：** 日志仅包含 route/method/requestId/durationMs/status/ip/userAgent，不记录 request body

**理由：**
- 避免日志泄露密码、token、上传文件内容
- body 内容通过 developer tools / 调试环境获取
- 请求元信息已足够追踪问题

### Decision 3: Sentry 可选集成，非阻塞

**选择：** 实现 `captureException` 包装函数，用 `SENTRY_DSN` 环境变量判断是否启用

**理由：**
- 零配置本地开发不受影响
- 生产环境通过设置 `SENTRY_DSN` 即刻启用
- 不破坏现有 error boundary 行为

### Decision 4: 不创建 OpenTelemetry 集成

**选择：** 第一阶段只做 pino + captureException 包装，不集成 OpenTelemetry SDK

**理由：** OTel 集成复杂度高（span processor、exporter、resource 配置），当前项目规模不需要分布式追踪。后续需要时可在 logger 基础上扩展。

### Decision 5: Settings 页面新建

**选择：** 新建 `/admin/settings` page.tsx

**理由：** Sidebar 已有 `/admin/settings` 链接但页面 404。新建页面同时解决侧边栏死链接问题，并在页面内放置可观测性状态模块。

## Architecture

```
src/lib/
  logger.ts           ← pino 实例 + 序列化 helper
  request-context.ts  ← getRequestContext(request, routeName?)
  observability.ts    ← captureException(error, context?)

src/app/api/**/route.ts    ← 替换 console.error → logger.error
src/lib/admin-dashboard.ts  ← 替换 console.warn → logger.warn
src/lib/analytics.ts        ← 替换 console.warn → logger.warn

sentry.config.ts          ← Sentry 配置（DSN 检查）
```

Full source: openspec/changes/observability-foundation/design.md

## openspec/changes/observability-foundation/tasks.md

- Source: openspec/changes/observability-foundation/tasks.md
- Lines: 1-65
- SHA256: 47f7799fb84f44867c02f4dfa030cc6d1832eb179793221020a8897f6d7b7ad2

```md
## 1. Logger 核心基础设施

- [ ] 1.1 安装 pino 依赖，新增 `src/lib/logger.ts`：创建 pino 实例，支持 LOG_LEVEL 环境变量覆盖，development 默认 debug、production 默认 info
- [ ] 1.2 实现 `serializeError` helper：序列化 Error 对象为 `{ name, message, stack, cause?, code?, meta? }`
- [ ] 1.3 实现敏感字段脱敏逻辑：递归移除 password/token/cookie/authorization/csrf/sessionToken 等字段
- [ ] 1.4 新增 `src/lib/logger.test.ts`：测试结构化输出、Error 序列化、敏感字段脱敏

## 2. Request Context 工具

- [ ] 2.1 新增 `src/lib/request-context.ts`：`getRequestContext(request, routeName?)` helper，提取 requestId（x-request-id → x-vercel-id → UUID）、method、route、path、ip、userAgent
- [ ] 2.2 新增 `src/lib/request-context.test.ts`：测试 header 读取、header 缺失时生成 UUID

## 3. Observability / APM 接口

- [ ] 3.1 新增 `src/lib/observability.ts`：`captureException(error, context?)` 包装，SENTRY_DSN 未配置时仅 logger.error，已配置时上报 Sentry
- [ ] 3.2 新增 `src/lib/observability.test.ts`：测试 Sentry 未配置时不抛错、logger 被调用
- [ ] 3.3 安装 @sentry/nextjs，新增 `sentry.server.config.ts`、`sentry.client.config.ts`，DSN 缺失时零配置运行
- [ ] 3.4 按 Sentry 当前推荐方式更新 `next.config.ts` 和 `src/instrumentation.ts`（如需要）

## 4. API Route 日志替换（读接口）

- [ ] 4.1 替换 `src/app/api/analytics/stats/route.ts`：console.error → logger.error
- [ ] 4.2 替换 `src/app/api/cities/route.ts`：console.error → logger.error
- [ ] 4.3 替换 `src/app/api/provinces/route.ts`：console.error → logger.error
- [ ] 4.4 替换 `src/app/api/regions/route.ts`：console.error → logger.error
- [ ] 4.5 替换 `src/app/api/articles/categories/route.ts`：console.error → logger.error
- [ ] 4.6 替换 `src/app/api/admin/csrf/route.ts`：console.error → logger.error

## 5. API Route 日志替换（写接口 + duration）

- [ ] 5.1 替换 `src/app/api/stores/route.ts`（GET/POST）：console.error → logger.error，POST 增加 duration 日志
- [ ] 5.2 替换 `src/app/api/stores/[id]/route.ts`（GET/PUT/DELETE/PATCH）：console.error → logger.error，写操作增加 duration 日志
- [ ] 5.3 替换 `src/app/api/stores/[id]/[action]/route.ts`：console.error → logger.error，增加 duration 日志
- [ ] 5.4 替换 `src/app/api/articles/route.ts`（GET/POST）：console.error → logger.error，POST 增加 duration 日志
- [ ] 5.5 替换 `src/app/api/articles/[id]/route.ts`（GET/PUT/DELETE）：console.error → logger.error，写操作增加 duration 日志
- [ ] 5.6 替换 `src/app/api/articles/[id]/[action]/route.ts`：console.error → logger.error，增加 duration 日志
- [ ] 5.7 替换 `src/app/api/articles/bulk/route.ts`：console.error → logger.error，增加 duration 日志
- [ ] 5.8 替换 `src/app/api/upload/route.ts`（POST/DELETE）：console.error → logger.error，增加 duration 日志
- [ ] 5.9 替换 `src/app/api/analytics/track/route.ts`：console.error/warn → logger，增加 duration 日志

## 6. admin-dashboard 与 analytics 日志

- [ ] 6.1 替换 `src/lib/admin-dashboard.ts` 中 6 处 console.warn → logger.warn
- [ ] 6.2 更新 `src/lib/admin-dashboard.test.ts`：mock console.warn → mock logger.warn
- [ ] 6.3 替换 `src/lib/analytics.ts` 中服务端 console.warn → logger.warn

## 7. Error Boundary 接入

- [ ] 7.1 修改 `src/app/global-error.tsx`：调用 captureException(error, { digest, boundary: "global" })
- [ ] 7.2 修改 `src/app/admin/(dashboard)/error.tsx`：调用 captureException(error, { digest, boundary: "admin" })
- [ ] 7.3 检查 `src/app/error.tsx` 和 `src/app/admin/error.tsx`，必要时接入 captureException

## 8. Settings 页面

- [ ] 8.1 新建 `src/app/admin/(dashboard)/settings/page.tsx`：展示可观测性状态（结构化日志、日志级别、APM 状态、requestId、脱敏状态），不显示 DSN 明文

## 9. API Route 测试更新

- [ ] 9.1 抽样更新 2-3 个 API route test：验证 catch 中调用 logger.error 而非 console.error

## 10. 构建验证

- [ ] 10.1 运行 `npm run build` 确保编译通过
- [ ] 10.2 运行 `vitest run` 确保测试通过（仅预存失败，无新增失败）
- [ ] 10.3 验证 SENTRY_DSN 未配置时 build 不受影响
```

## openspec/changes/observability-foundation/specs/server-observability/spec.md

- Source: openspec/changes/observability-foundation/specs/server-observability/spec.md
- Lines: 1-156
- SHA256: 73da4553e7e5dcaecd56627b6fea5f15f1c058bf26904ecf56c0bea46f73759d

[TRUNCATED]

```md
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

```

Full source: openspec/changes/observability-foundation/specs/server-observability/spec.md

