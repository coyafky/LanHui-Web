---
change: observability-foundation
design-doc: docs/superpowers/specs/2026-07-07-observability-foundation-design.md
base-ref: 84e21efede7f5e584eda97750797ee02826aed22
---

# observability-foundation — 实施计划

参考设计文档 `docs/superpowers/specs/2026-07-07-observability-foundation-design.md` 和 delta spec `openspec/changes/observability-foundation/specs/server-observability/spec.md`，将 `openspec/changes/observability-foundation/tasks.md` 中的 10 组任务拆解为 16 个可独立执行的子任务，按依赖顺序分为 8 个阶段。

---

## 阶段 0: 依赖安装（无前置依赖）

### 0.1 安装 pino + @sentry/nextjs

- **设计文档参考**: Logger 模块要求使用 pino；Sentry 配置章节要求 @sentry/nextjs
- **变更文件**:
  - `package.json` — 新增 `pino`、`@sentry/nextjs` 依赖
  - `package-lock.json` — 自动更新
- **代码变更量**: ~5 行（package.json 新增两行 dependencies）
- **验证标准**:
  - `npm install` 成功，无 peer dependency 冲突
  - `npm run typecheck` 通过

---

## 阶段 1: 核心 Logger 基础设施（依赖阶段 0）

### 1.1 创建结构化 Logger（tasks.md: 1.1 + 1.2 + 1.3）

- **设计文档参考**: `src/lib/logger.ts` 模块设计 — pino 单例、LOG_LEVEL 环境变量、`serializeError`、`sanitize`
- **变更文件**:
  - `src/lib/logger.ts` — **新建**，包含：
    - pino 实例（单例，level 由 `LOG_LEVEL` env 或 `NODE_ENV` 决定）
    - `serializeError(error)` — 提取 `name/message/stack/cause` + Prisma `code/meta`
    - `sanitize(obj)` — 递归移除敏感 key（`password/token/cookie/authorization/csrf/sessionToken`）
    - 导出 `logger.debug/info/warn/error(obj)`
- **代码变更量**: ~100 行（含类型定义 + 两个 helper + pino 实例化）
- **验证标准**:
  - `logger.info({ msg: "test" })` 输出 JSON 格式日志到 stdout
  - `LOG_LEVEL=debug` 环境变量可覆盖 level
  - `serializeError` 正确展开 Error 对象的 cause 链和 Prisma 特有字段
  - `sanitize` 递归移除嵌套对象中的敏感字段

### 1.2 Logger 单元测试（tasks.md: 1.4）

- **设计文档参考**: 测试策略 — `logger.test.ts` JSON 输出验证、Error 序列化、敏感字段脱敏
- **变更文件**:
  - `src/lib/logger.test.ts` — **新建**
- **测试用例**:
  - `logger.info/warn/error` 输出为合法 JSON
  - `logger.error({ error: new Error("test") })` 的 error 字段包含 `name/message/stack`
  - Error 对象含 `cause` 时，序列化结果包含 `cause` 字段
  - 脱敏函数移除 `password`、`token`、`cookie`、`authorization`、`csrf`、`sessionToken` 字段
  - 嵌套对象中的敏感字段同样被递归移除
  - 非敏感 key 不受影响
- **代码变更量**: ~120 行
- **验证标准**: `vitest run src/lib/logger.test.ts` 全部通过

---

## 阶段 2: Request Context 工具（依赖阶段 1）

### 2.1 创建 request-context（tasks.md: 2.1）

- **设计文档参考**: `src/lib/request-context.ts` — `getRequestContext(request, routeName?)` helper
- **变更文件**:
  - `src/lib/request-context.ts` — **新建**，包含：
    - `getRequestContext(request, routeName?)` — 提取 `requestId`（`x-request-id` > `x-vercel-id` > UUID v4）、`method`、`route`、`path`、`ip`、`userAgent`
    - 类型定义 `RequestContext`
- **代码变更量**: ~80 行
- **验证标准**:
  - 请求头含 `x-request-id: abc` 时，返回 `requestId: "abc"`
  - 无 `x-request-id` 和 `x-vercel-id` 时，生成有效 UUID v4
  - 仅含 `x-vercel-id` 时，回退使用该值
  - 返回对象包含 `method`、`route`、`path`、`ip`、`userAgent`

### 2.2 request-context 单元测试（tasks.md: 2.2）

- **设计文档参考**: 测试策略 — `request-context.test.ts`
- **变更文件**:
  - `src/lib/request-context.test.ts` — **新建**
- **测试用例**:
  - 从 `x-request-id` header 读取 requestId
  - 无 header 时生成 UUID v4
  - 从 `x-vercel-id` 回退读取
  - 提取 method/path/ip/userAgent 元信息
- **代码变更量**: ~100 行
- **验证标准**: `vitest run src/lib/request-context.test.ts` 全部通过

---

## 阶段 3: Observability / APM 接口（依赖阶段 1）

### 3.1 创建 observability.ts（tasks.md: 3.1）

- **设计文档参考**: `src/lib/observability.ts` — `captureException(error, context?)` 包装
- **变更文件**:
  - `src/lib/observability.ts` — **新建**，包含：
    - `captureException(error, context?)` — `SENTRY_DSN` 未配置时仅 `logger.error`，已配置时调用 `Sentry.captureException`
    - 导入 `logger` 和可选 Sentry
- **代码变更量**: ~40 行
- **验证标准**:
  - 未设置 `SENTRY_DSN` 时调用 `captureException` 仅记录 `logger.error`，不抛异常
  - 设置了 `SENTRY_DSN` 时调用 `captureException` 同时触发 logger 和 Sentry

### 3.2 observability 单元测试（tasks.md: 3.2）

- **设计文档参考**: 测试策略 — `observability.test.ts`
- **变更文件**:
  - `src/lib/observability.test.ts` — **新建**
- **测试用例**:
  - `SENTRY_DSN` 未设置时，`captureException` 不抛错
  - `SENTRY_DSN` 未设置时，`logger.error` 被调用
  - context 参数正确传递到 logger
- **代码变更量**: ~50 行
- **验证标准**: `vitest run src/lib/observability.test.ts` 全部通过

### 3.3 Sentry SDK 配置 + next.config.ts 更新（tasks.md: 3.3 + 3.4）

- **设计文档参考**: `sentry.server.config.ts`、`sentry.client.config.ts`、`next.config.ts` 配置
- **变更文件**:
  - `sentry.server.config.ts` — **新建**，含 `Sentry.init({ dsn: process.env.SENTRY_DSN })`，DSN 缺失时不 init
  - `sentry.client.config.ts` — **新建**，同服务端模式
  - `src/instrumentation.ts` — **新建**（如 Sentry 推荐方式需要）
  - `next.config.ts` — **修改**：使用 `withSentryConfig(nextConfig)` 包裹，DSN 缺失时零配置运行
- **代码变更量**: ~60 行
- **验证标准**:
  - `SENTRY_DSN` 未配置时 `npm run build` 不受影响
  - `SENTRY_DSN` 配置后 Sentry SDK 正确初始化

---

## 阶段 4: 读接口 API Route 日志替换（依赖阶段 1 + 2）

### 4.1 替换 6 条读 API 的 console.error（tasks.md: 4.1-4.6）

- **设计文档参考**: 读接口迁移模式 — 使用 `getRequestContext` + `logger.error({ event: "api.error", ...ctx, error })`
- **变更文件**（每个文件变更 ~5-10 行）:
  - `src/app/api/analytics/stats/route.ts` — console.error → logger.error + context
  - `src/app/api/cities/route.ts` — console.error → logger.error + context
  - `src/app/api/provinces/route.ts` — console.error → logger.error + context
  - `src/app/api/regions/route.ts` — console.error → logger.error + context
  - `src/app/api/articles/categories/route.ts` — console.error → logger.error + context
  - `src/app/api/admin/csrf/route.ts` — console.error → logger.error + context
- **替换模式**:
  ```typescript
  // before:
  console.error("[GET /api/stores]", error);
  // after:
  const ctx = getRequestContext(request, "/api/stores");
  logger.error({ event: "api.error", ...ctx, error });
  ```
- **代码变更量**: ~60 行（每个文件 ~10 行）
- **验证标准**:
  - 所有 6 个 handler 中 `console.error` 被移除
  - 每个 catch 块包含 `logger.error({ event: "api.error", ...ctx, error })` 调用
  - `vitest run` 相关测试通过

---

## 阶段 5: 写接口 API Route 日志替换 — Stores（依赖阶段 1 + 2）

### 5.1 替换 Stores 写接口（tasks.md: 5.1 + 5.2 + 5.3）

- **设计文档参考**: 写接口迁移模式 — 增加 duration 计时，成功记录 `api.request.completed`，失败记录 `api.request.failed`
- **变更文件**:
  - `src/app/api/stores/route.ts` — GET（读） + POST（写）
  - `src/app/api/stores/[id]/route.ts` — GET（读） + PUT/PATCH/DELETE（写）
  - `src/app/api/stores/[id]/[action]/route.ts` — POST（写）
- **变更内容**:
  - 读操作（GET）: 替换 `console.error` → `logger.error({ event: "api.error", ...ctx, error })`
  - 写操作（POST/PUT/PATCH/DELETE）: 添加 `start = Date.now()` → try/catch 中记录 `api.request.completed` / `api.request.failed` + `durationMs`
  - 各 handler 的 Prisma 专用错误分支（P2003/P2002）保持现有 return 逻辑不变，仅替换日志调用
- **代码变更量**: ~70 行（3 个文件，含 import 增加 + context 提取 + 日志替换）
- **验证标准**:
  - 所有 handler 中的 `console.error` 被移除
  - 写操作 handler 中包含 `api.request.completed` / `api.request.failed` 日志
  - 日志包含 `route`、`method`、`requestId`、`durationMs`、`userId` 等字段

---

## 阶段 6: 写接口 API Route 日志替换 — Articles（依赖阶段 1 + 2）

### 6.1 替换 Articles 写接口（tasks.md: 5.4 + 5.5 + 5.6）

- **变更文件**:
  - `src/app/api/articles/route.ts` — GET（读） + POST（写）
  - `src/app/api/articles/[id]/route.ts` — GET（读） + PUT/DELETE（写）
  - `src/app/api/articles/[id]/[action]/route.ts` — POST（写）
- **代码变更量**: ~50 行（3 个文件）
- **验证标准**: 同 5.1 — 所有 handler 移除 `console.error`，写操作包含 duration 日志

### 6.2 替换 Bulk + Upload + Analytics 写接口（tasks.md: 5.7 + 5.8 + 5.9）

- **变更文件**:
  - `src/app/api/articles/bulk/route.ts` — POST（写）
  - `src/app/api/upload/route.ts` — POST/DELETE（写）
  - `src/app/api/analytics/track/route.ts` — POST（写，含 `console.warn` 替换）
- **代码变更量**: ~55 行（3 个文件）
- **验证标准**:
  - analytics/track 中的 `console.warn` 替换为 `logger.warn`
  - 所有 handler 包含结构化日志 + durationMs
  - 构建通过

---

## 阶段 7: admin-dashboard / analytics 日志替换（依赖阶段 1）

### 7.1 admin-dashboard.ts 日志替换 + 测试更新（tasks.md: 6.1 + 6.2）

- **设计文档参考**: admin-dashboard 降级日志结构化 — `console.warn` → `logger.warn({ event: "admin-dashboard.fetch.failed", module, error })`
- **变更文件**:
  - `src/lib/admin-dashboard.ts` — **修改**：
    - 替换 6 处 `console.warn` → `logger.warn`（`logActivity`、`getStoreSummary`、`getTodoSummaryV2`、`getKpiSnapshotV2`、`getContentSummaryV2`、`getInterestSummaryV2`）
    - 更新每处 `typeof console !== "undefined"` 守卫（logger 在服务端始终可用）
  - `src/lib/admin-dashboard.test.ts` — **修改**：mock `@/lib/logger` 替代 mock `console.warn`
- **代码变更量**: ~35 行（替换 + import 变更 + test mock 更新）
- **验证标准**:
  - 所有 `console.warn` 替换为 `logger.warn`
  - 日志包含 `event: "admin-dashboard.fetch.failed"` 和 `module` 字段
  - `vitest run src/lib/admin-dashboard.test.ts` 全部通过

### 7.2 analytics.ts 服务端日志替换（tasks.md: 6.3）

- **设计文档参考**: Analytics 日志结构化 — `logger.warn({ event: "analytics.rate_limited", requestId, ip })`
- **变更文件**:
  - `src/app/api/analytics/track/route.ts` — 合并到 6.2 完成
  - `src/lib/analytics.ts` — **无变更**（该文件是 `'use client'` 浏览器端 SDK，不在可观测性范围）
- **代码变更量**: ~0 行（analytics.ts 为客户端 SDK，不需替换）
- **验证标准**: 确认 `src/lib/analytics.ts` 为 `'use client'` 模块，不参与服务端日志替换

---

## 阶段 8: Error Boundary 接入（依赖阶段 3）

### 8.1 更新 Error Boundary 接入 captureException（tasks.md: 7.1 + 7.2 + 7.3）

- **设计文档参考**: `global-error.tsx` 在 `useEffect` 中调用 `captureException(error, { digest, boundary: "global" })`
- **变更文件**:
  - `src/app/global-error.tsx` — **修改**：
    - 新增 `captureException` 调用，传递 `{ digest, boundary: "global" }`
    - 保留现有错误展示逻辑（development 显示 digest，production 显示友好页面）
  - `src/app/admin/(dashboard)/error.tsx` — **修改**：
    - 新增 `captureException` 调用，传递 `{ digest, boundary: "admin-dashboard" }`
  - `src/app/error.tsx` — **检查**：当前为 `ErrorFallback` 转发，在 `ErrorFallback` 组件层面增加 `captureException` 可避免逐个修改。**决定**：`ErrorFallback` 为共享组件，在其中加 `captureException` 会重复上报。在每个 `error.tsx` 中分别添加，保持边界明确。
- **关键设计决策**:
  - `error.tsx`（根）: 新增 `captureException(error, { digest, boundary: "root" })`
  - `admin/error.tsx`: 新增 `captureException(error, { digest, boundary: "admin" })`
- **代码变更量**: ~40 行（4 个 error boundary 文件各 ~10 行）
- **验证标准**:
  - `global-error.tsx` 在 `useEffect` 中调用 `captureException`
  - development 环境继续显示 error message/digest
  - production 环境只显示友好页面
  - `SENTRY_DSN` 未配置时不影响 error boundary 渲染

---

## 阶段 9: Settings 页面（依赖阶段 1）

### 9.1 创建 /admin/settings 页面（tasks.md: 8.1）

- **设计文档参考**: Settings 页面 — server component 读取环境变量展示可观测性状态
- **变更文件**:
  - `src/app/admin/(dashboard)/settings/page.tsx` — **新建**
- **页面内容**:
  - 结构化日志: 静态显示"已启用"
  - 日志级别: 读取 `process.env.LOG_LEVEL`，显示当前值（默认 `info`）
  - 敏感字段脱敏: 静态显示"已启用"
  - requestId 追踪: 静态显示"已启用"
  - APM 状态: `SENTRY_DSN` 存在时显示"已配置"，不存在时显示"未配置"（不显示 DSN 明文）
  - 使用管理后台现有 UI 组件保持风格一致
- **代码变更量**: ~100 行
- **验证标准**:
  - 访问 `/admin/settings` 显示可观测性模块
  - 日志级别显示正确的当前值
  - APM 状态根据 `SENTRY_DSN` 正确显示"已配置"/"未配置"
  - 页面一 HTML 中不包含 DSN 明文

---

## 阶段 10: API Route 测试更新（依赖阶段 4-6）

### 10.1 抽样更新 2-3 个 API route test（tasks.md: 9.1）

- **设计文档参考**: 测试策略 — API route tests 验证 catch 块调用 `logger.error`
- **变更文件**（抽样 2-3 个）:
  - `src/app/api/stores/route.test.ts` — mock `@/lib/logger`，验证 POST 失败时调用 `logger.error`
  - `src/app/api/articles/route.test.ts` — 同 stores 模式
  - 可选的第三个 route test
- **代码变更量**: ~50 行（2-3 个测试文件各 ~15-25 行 import mock + 断言）
- **验证标准**:
  - mock logger 后，写操作测试验证 `logger.error` 被调用
  - 所有现有测试保持绿色

---

## 阶段 11: 构建验证（依赖全部阶段）

### 11.1 全量构建验证（tasks.md: 10.1 + 10.2 + 10.3）

- **验证命令**:
  ```bash
  # 类型检查
  npx tsc --noEmit

  # 全量测试
  vitest run

  # 构建（SENTRY_DSN 未配置）
  SENTRY_DSN= npm run build

  # 构建（SENTRY_DSN 配置）
  SENTRY_DSN=https://key@o0.ingest.sentry.io/project0 npm run build
  ```
- **验证标准**:
  - `tsc --noEmit` 无类型错误
  - `vitest run` 全部通过（仅预存失败，无新增失败）
  - `SENTRY_DSN` 未配置时 `npm run build` 不受影响
  - `SENTRY_DSN` 配置后构建依然通过

---

## 总 16 个子任务汇总

| 阶段 | 子任务 | 代码量 | tasks.md 映射 | 关键文件数 |
|------|--------|--------|--------------|-----------|
| 0 | 依赖安装 | ~5 行 | 1.1, 3.3 | 1 |
| 1 | logger.ts | ~100 行 | 1.1+1.2+1.3 | 1 |
| 1 | logger.test.ts | ~120 行 | 1.4 | 1 |
| 2 | request-context.ts | ~80 行 | 2.1 | 1 |
| 2 | request-context.test.ts | ~100 行 | 2.2 | 1 |
| 3 | observability.ts | ~40 行 | 3.1 | 1 |
| 3 | observability.test.ts | ~50 行 | 3.2 | 1 |
| 3 | Sentry 配置 | ~60 行 | 3.3+3.4 | 4 |
| 4 | 读 API 替换(6条) | ~60 行 | 4.1-4.6 | 6 |
| 5 | Stores 写 API 替换 | ~70 行 | 5.1-5.3 | 3 |
| 6 | Articles 写 API 替换 | ~50 行 | 5.4-5.6 | 3 |
| 6 | Bulk+Upload+Analytics | ~55 行 | 5.7-5.9 | 3 |
| 7 | admin-dashboard 日志 | ~35 行 | 6.1+6.2 | 2 |
| 8 | Error Boundary 4 文件 | ~40 行 | 7.1-7.3 | 4 |
| 9 | Settings 页面 | ~100 行 | 8.1 | 1 |
| 10 | API route 测试更新 | ~50 行 | 9.1 | 3 |
| 11 | 构建验证 | 0 行 | 10.1-10.3 | 0 |

总代码变更量: ~1015 行（含测试代码 ~320 行）

---

## 依赖顺序图

```
阶段 0 (依赖安装)
  └──→ 阶段 1 (logger.ts + test)
         ├──→ 阶段 2 (request-context.ts + test)
         ├──→ 阶段 3 (observability + Sentry)
         │      └──→ 阶段 8 (Error Boundary)
         ├──→ 阶段 7 (admin-dashboard 日志)
         ├──→ 阶段 9 (Settings 页面)
         ├──→ 阶段 4 (读 API 替换) ──→
         └──→ 阶段 5+6 (写 API 替换) ──→ 阶段 10 (API test) ──→ 阶段 11 (构建验证)
```

---

## 风险与注意事项

1. **Prisma 错误检测兼容性**: 现有的 Prisma P2002/P2003 错误分支使用了 `(error as { code?: string }).code` 类型断言。替换日志时不要破坏这些分支的结构。
2. **`typeof console !== "undefined"` 守卫**: admin-dashboard.ts 中多处使用了此守卫。logger 在服务端始终可用，可以直接移除守卫但要确保不引入服务端不可用 `logger` 的路径。
3. **Sentry 零配置构建**: 确保 `sentry.server.config.ts` 和 `sentry.client.config.ts` 中 `Sentry.init` 只在 `SENTRY_DSN` 存在时调用，否则构建工具可能报错。
4. **`'use client'` analytics.ts**: `src/lib/analytics.ts` 是客户端 SDK，不在本变更服务端可观测性的范围内，不需要修改。
5. **next.config.ts 变更顺序**: 本变更需要在现有 `next.config.ts` 基础上叠加 `withSentryConfig`。注意与并行变更（如 admin-security-foundation）的冲突处理。
