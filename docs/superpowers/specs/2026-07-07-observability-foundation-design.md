---
comet_change: observability-foundation
role: technical-design
canonical_spec: openspec
---

# 服务端可观测性基础设施 — 技术设计

## 架构总览

```
                        ┌──────────────────────────┐
                        │   src/lib/logger.ts      │
                        │   (pino 实例 + 序列化)     │
                        └──────────┬───────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                     │
     ┌────────┴────────┐  ┌───────┴────────┐  ┌────────┴────────┐
     │ request-context │  │ observability  │  │ error boundary  │
     │ (requestId等)   │  │ (captureExcpt) │  │ (上报 hook)     │
     └─────────────────┘  └───────┬────────┘  └─────────────────┘
                                  │
                         ┌────────┴────────┐
                         │  @sentry/nextjs │
                         │  (DSN 可选)     │
                         └─────────────────┘
```

## 模块设计

### `src/lib/logger.ts`

- pino 实例，单例
- level：`LOG_LEVEL` env → `NODE_ENV === "production" ? "info" : "debug"`
- `serializeError(error)`：提取 `name/message/stack/cause` + Prisma `code/meta`
- `sanitize(obj)`：递归移除敏感 key（`password/token/cookie/authorization/csrf/sessionToken`）
- 导出 `logger.debug/info/warn/error(obj)`

### `src/lib/request-context.ts`

```typescript
function getRequestContext(request: Request | NextRequest, routeName?: string) {
  return { requestId, method, route, path, ip, userAgent };
}
```

### `src/lib/observability.ts`

```typescript
function captureException(error: unknown, context?: Record<string, unknown>) {
  logger.error({ event: "exception.capture", error, meta: context });
  // SENTRY_DSN 存在时调用 Sentry.captureException
}
```

### Sentry 配置

- `sentry.server.config.ts`：`Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })`
- `sentry.client.config.ts`：`Sentry.init({ dsn: process.env.SENTRY_DSN })`
- `next.config.ts`：`withSentryConfig(nextConfig)`
- 所有 Sentry init 需判断 `SENTRY_DSN` 是否存在

## API Route 迁移模式

### 读接口 (GET)

```typescript
// before: console.error("[GET /api/stores]", error);
// after:
catch (error) {
  const ctx = getRequestContext(request, "/api/stores");
  logger.error({ event: "api.error", ...ctx, error });
}
```

### 写接口 (POST/PUT/PATCH/DELETE)

```typescript
const start = Date.now();
try {
  // ... handler logic
  const ctx = getRequestContext(request, "/api/stores");
  logger.info({
    event: "api.request.completed",
    ...ctx,
    status: 200,
    durationMs: Date.now() - start,
    userId: session?.user?.id,
  });
} catch (error) {
  const ctx = getRequestContext(request, "/api/stores");
  logger.error({
    event: "api.request.failed",
    ...ctx,
    status: error.status ?? 500,
    durationMs: Date.now() - start,
    userId: session?.user?.id,
    error,
  });
}
```

## Error Boundary 集成

```typescript
// global-error.tsx
useEffect(() => {
  captureException(error, { digest, boundary: "global" });
}, [error]);
```

development 环境保留 error message/digest 展示，production 只显示友好页面。

## Settings 页面

`/admin/settings` — server component 读取环境变量：
- `process.env.LOG_LEVEL` → 展示日志级别
- `process.env.SENTRY_DSN ? "已配置" : "未配置"` → 展示 APM 状态
- 不展示 DSN 明文
- 其他状态（结构化日志、requestId、脱敏）静态显示"已启用"

## 测试策略

| 文件 | 测试内容 |
|------|---------|
| `logger.test.ts` | JSON 输出验证、Error 序列化、敏感字段脱敏 |
| `request-context.test.ts` | header 读取 requestId、缺失时 UUID 生成、元信息提取 |
| `observability.test.ts` | DSN 未配置时不抛错、logger.error 被调用 |
| `admin-dashboard.test.ts` | mock `logger.warn` 替代 `console.warn` |
| API route tests | 抽样 2-3 验证 catch 块调用 `logger.error` |
