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
src/instrumentation.ts    ← Next.js instrumentation hook（如需要）

src/app/global-error.tsx               ← + captureException
src/app/admin/(dashboard)/error.tsx    ← + captureException
src/app/admin/(dashboard)/settings/page.tsx  ← NEW
```

## Risks / Trade-offs

- **[Risk]** pino 在 Edge Runtime 可能不完全兼容 → **Mitigation**: logger 仅在 Node.js runtime（API route、server components）中使用；Edge 路由（如有）用 `console` 回退
- **[Risk]** Sentry SDK 版本与 Next.js 16 兼容性 → **Mitigation**: 实现时查看 @sentry/nextjs 最新文档，DSN 检查确保零配置可用
- **[Risk]** admin-dashboard.test.ts 中 mock console.warn 的测试可能失败 → **Mitigation**: 同步更新测试 mock 为 logger.warn

## Migration Plan

1. 安装 `pino`、`@sentry/nextjs`
2. 创建 `logger.ts`、`request-context.ts`、`observability.ts`
3. 逐 API route 替换 `console.error` → `logger.error`（behind-the-scenes，不影响功能）
4. 更新 `admin-dashboard.ts`、`analytics.ts`
5. 创建 Sentry configs
6. 更新 error boundaries
7. 创建 Settings 页面
8. 编写测试
9. 运行 full build + test 验证

## Open Questions

- `@sentry/nextjs` 当前最新版本对 Next.js 16 的兼容性？需首次实现时查阅官方文档确认
- `instrumentation.ts` hook 是否需要？取决于 Sentry SDK 当前推荐方式
