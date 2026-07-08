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
