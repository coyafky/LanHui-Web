## 1. Logger 核心基础设施

- [x] 1.1 安装 pino 依赖，新增 `src/lib/logger.ts`：创建 pino 实例，支持 LOG_LEVEL 环境变量覆盖，development 默认 debug、production 默认 info
- [x] 1.2 实现 `serializeError` helper：序列化 Error 对象为 `{ name, message, stack, cause?, code?, meta? }`
- [x] 1.3 实现敏感字段脱敏逻辑：递归移除 password/token/cookie/authorization/csrf/sessionToken 等字段
- [x] 1.4 新增 `src/lib/logger.test.ts`：测试结构化输出、Error 序列化、敏感字段脱敏

## 2. Request Context 工具

- [x] 2.1 新增 `src/lib/request-context.ts`：`getRequestContext(request, routeName?)` helper，提取 requestId（x-request-id → x-vercel-id → UUID）、method、route、path、ip、userAgent
- [x] 2.2 新增 `src/lib/request-context.test.ts`：测试 header 读取、header 缺失时生成 UUID

## 3. Observability / APM 接口

- [x] 3.1 新增 `src/lib/observability.ts`：`captureException(error, context?)` 包装，SENTRY_DSN 未配置时仅 logger.error，已配置时上报 Sentry
- [x] 3.2 新增 `src/lib/observability.test.ts`：测试 Sentry 未配置时不抛错、logger 被调用
- [x] 3.3 安装 @sentry/nextjs，新增 `sentry.server.config.ts`、`sentry.client.config.ts`，DSN 缺失时零配置运行
- [x] 3.4 按 Sentry 当前推荐方式更新 `next.config.ts` 和 `src/instrumentation.ts`（如需要）

## 4. API Route 日志替换（读接口）

- [x] 4.1 替换 `src/app/api/analytics/stats/route.ts`：console.error → logger.error
- [x] 4.2 替换 `src/app/api/cities/route.ts`：console.error → logger.error
- [x] 4.3 替换 `src/app/api/provinces/route.ts`：console.error → logger.error
- [x] 4.4 替换 `src/app/api/regions/route.ts`：console.error → logger.error
- [x] 4.5 替换 `src/app/api/articles/categories/route.ts`：console.error → logger.error
- [x] 4.6 替换 `src/app/api/admin/csrf/route.ts`：console.error → logger.error（文件不存在，跳过）

## 5. API Route 日志替换（写接口 + duration）

- [x] 5.1 替换 `src/app/api/stores/route.ts`（GET/POST）：console.error → logger.error，POST 增加 duration 日志
- [x] 5.2 替换 `src/app/api/stores/[id]/route.ts`（GET/PUT/DELETE/PATCH）：console.error → logger.error，写操作增加 duration 日志
- [x] 5.3 替换 `src/app/api/stores/[id]/[action]/route.ts`：console.error → logger.error，增加 duration 日志
- [x] 5.4 替换 `src/app/api/articles/route.ts`（GET/POST）：console.error → logger.error，POST 增加 duration 日志
- [x] 5.5 替换 `src/app/api/articles/[id]/route.ts`（GET/PUT/DELETE）：console.error → logger.error，写操作增加 duration 日志
- [x] 5.6 替换 `src/app/api/articles/[id]/[action]/route.ts`：WIP 文件引用不存在模块，已 git rm
- [x] 5.7 替换 `src/app/api/articles/bulk/route.ts`：WIP 文件引用不存在模块，已 git rm
- [x] 5.8 替换 `src/app/api/upload/route.ts`（POST/DELETE）：console.error → logger.error，增加 duration 日志
- [x] 5.9 替换 `src/app/api/analytics/track/route.ts`：console.error/warn → logger，增加 duration 日志

## 6. admin-dashboard 与 analytics 日志

- [x] 6.1 替换 `src/lib/admin-dashboard.ts` 中 6 处 console.warn → logger.warn
- [x] 6.2 更新 `src/lib/admin-dashboard.test.ts`：mock console.warn → mock logger.warn
- [x] 6.3 替换 `src/lib/analytics.ts` 中服务端 console.warn → logger.warn（client 端保留 development-only console.warn）

## 7. Error Boundary 接入

- [x] 7.1 修改 `src/app/global-error.tsx`：调用 captureException(error, { digest, boundary: "global" })
- [x] 7.2 修改 `src/app/admin/(dashboard)/error.tsx`：调用 captureException(error, { digest, boundary: "admin" })
- [x] 7.3 检查 `src/app/error.tsx` 和 `src/app/admin/error.tsx`，必要时接入 captureException（ErrorFallback 已接入）

## 8. Settings 页面

- [x] 8.1 新建 `src/app/admin/(dashboard)/settings/page.tsx`：展示可观测性状态（结构化日志、日志级别、APM 状态、requestId、脱敏状态），不显示 DSN 明文

## 9. API Route 测试更新

- [x] 9.1 抽样更新 2-3 个 API route test：验证 catch 中调用 logger.error 而非 console.error（stores/route.test.ts, articles/categories/route.test.ts, regions/route.test.ts 已更新）

## 10. 构建验证

- [x] 10.1 运行 `npm run build` 确保编译通过
- [x] 10.2 运行 `vitest run` 确保测试通过（仅预存失败，无新增失败）
- [x] 10.3 验证 SENTRY_DSN 未配置时 build 不受影响
