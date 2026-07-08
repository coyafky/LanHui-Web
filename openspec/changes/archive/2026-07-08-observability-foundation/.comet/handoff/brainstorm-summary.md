# Brainstorm Summary

- Change: observability-foundation
- Date: 2026-07-07

## 确认的技术方案

- **Logger 引擎**: pino（Node.js 最快 JSON logger），`LOG_LEVEL` 环境变量控制级别
- **Request Context**: `getRequestContext(request, routeName?)` — requestId 从 `x-request-id` → `x-vercel-id` → `crypto.randomUUID()`
- **APM 方案**: `@sentry/nextjs`（方案 A），`withSentryConfig` 包裹 next.config.ts，DSN 未配置时零影响
- **敏感字段脱敏**: 递归移除 `password/token/cookie/authorization/csrf/sessionToken`
- **API 迁移**: 两阶段 — 读接口替换 console.error，写接口加 duration 计时
- **Error Boundary**: `useEffect` 中调用 `captureException(error, { digest, boundary })`
- **admin-dashboard**: console.warn → logger.warn，保持降级不抛错
- **Settings 页面**: 新建 `/admin/settings`，读取环境变量展示可观测性状态

## 关键取舍与风险

- 选用 pino（轻量快速）而非 winston（功能更全但体积大）
- Sentry 可选集成：通过 DSN 环境变量判断，不强制要求
- 不集成 OpenTelemetry：第一阶段不做分布式追踪
- 不记录 request body：只记元信息，避免日志泄露敏感数据
- [Risk] Sentry SDK 与 Next.js 16 兼容性 → 实现时查官方文档确认
- [Risk] pino Edge Runtime 兼容 → 仅在 Node.js runtime 使用

## 测试策略

- logger.test.ts: 结构化输出 + Error 序列化 + 敏感字段脱敏
- request-context.test.ts: header 读取 + UUID 自动生成
- observability.test.ts: DSN 未配置时不抛错
- admin-dashboard.test.ts: mock logger.warn 替代 mock console.warn
- API route tests 抽样 2-3 个验证 catch 中调用 logger.error

## Spec Patch

无
