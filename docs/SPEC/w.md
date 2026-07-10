下面是 **P1-5 无健康检查端点** 的完整修复提示词：

```markdown
# 修复 P1-5：新增健康检查端点 `/api/healthz` 与 `/api/health`

## 问题背景

当前项目没有健康检查端点：

- 没有 `/api/health`
- 没有 `/api/healthz`
- 负载均衡器、Docker healthcheck、容器编排平台无法判断应用是否可用
- standalone 部署模式下，服务进程异常或依赖异常时缺少标准探针

项目当前是 Next.js App Router，API 位于：

```text
src/app/api/**/route.ts
```

项目已有：

- `src/lib/prisma.ts`：Prisma singleton
- `src/lib/logger.ts`：结构化日志
- API 响应通常使用 `{ success, data?, error? }`

## 修复目标

新增两个健康检查端点：

### 1. `/api/healthz`

用于 **liveness probe**。

特点：

- 不访问数据库
- 只证明 Next.js 进程仍能响应 HTTP 请求
- 应尽可能轻量
- 成功返回 `200`

### 2. `/api/health`

用于 **readiness probe**。

特点：

- 检查应用是否已经准备好接流量
- 检查数据库连接
- 数据库正常返回 `200`
- 数据库异常或超时返回 `503`

## 新增文件

### `src/app/api/healthz/route.ts`

实现轻量存活检查。

要求：

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

返回示例：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "lanhui-website",
    "timestamp": "2026-07-08T00:00:00.000Z",
    "uptime": 123.45
  }
}
```

响应头：

```http
Cache-Control: no-store
```

注意：

- 不要查数据库
- 不要暴露 env、secret、DATABASE_URL
- 不要要求登录
- 不要写入 analytics

### `src/app/api/health/route.ts`

实现就绪检查。

要求：

- 使用 `prisma.$queryRaw` 执行轻量查询，例如：

```ts
await prisma.$queryRaw`SELECT 1`;
```

- 加超时保护，建议 1500ms：

```ts
Promise.race([
  prisma.$queryRaw`SELECT 1`,
  timeoutPromise,
]);
```

- DB 正常时返回 `200`
- DB 失败或超时时返回 `503`
- 失败时用 `logger.warn` 或 `logger.error` 记录结构化日志
- 返回体不要包含完整错误堆栈，只返回安全状态信息

成功返回示例：

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "checks": {
      "app": "ok",
      "database": "ok"
    },
    "timestamp": "2026-07-08T00:00:00.000Z"
  }
}
```

失败返回示例：

```json
{
  "success": false,
  "error": "Service unavailable",
  "data": {
    "status": "unhealthy",
    "checks": {
      "app": "ok",
      "database": "unavailable"
    },
    "timestamp": "2026-07-08T00:00:00.000Z"
  }
}
```

## 测试要求

新增：

```text
src/app/api/healthz/route.test.ts
src/app/api/health/route.test.ts
```

测试内容：

### `/api/healthz`

- GET 返回 200
- `success === true`
- `data.status === "ok"`
- 响应头包含 `Cache-Control: no-store`
- 响应体不包含敏感字段，例如：
  - `DATABASE_URL`
  - `NEXTAUTH_SECRET`
  - `SENTRY_DSN`

### `/api/health`

mock `@/lib/prisma`：

1. DB 正常：
   - `$queryRaw` resolve
   - 返回 200
   - `checks.database === "ok"`

2. DB 抛错：
   - `$queryRaw` reject
   - 返回 503
   - `checks.database === "unavailable"`
   - logger 被调用

3. DB 超时：
   - `$queryRaw` 长时间 pending
   - 返回 503
   - 不让测试卡住

## 部署配置

检查项目是否存在：

```text
docker-compose.yml
compose.yml
Dockerfile
docs/SPEC/deploy/operations.md
docs/ARCHITECTURE.md
```

如果存在 Docker Compose，请把 app healthcheck 改成：

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:3000/api/healthz"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 30s
```

如果已有 restart policy，请保持；如果没有，请建议使用：

```yaml
restart: unless-stopped
```

注意：

- 容器 liveness 用 `/api/healthz`
- 负载均衡 readiness 可以用 `/api/health`
- 不要让频繁 healthcheck 每次都打数据库，除非它明确是 readiness probe

## 防回归脚本

新增：

```text
scripts/check-health-endpoints.mjs
```

检查：

- `src/app/api/healthz/route.ts` 存在
- `src/app/api/health/route.ts` 存在
- 两个 route 都包含 `Cache-Control: no-store`
- `/api/healthz` 不 import `@/lib/prisma`
- `/api/health` 使用数据库检查

在 `package.json` 增加：

```json
{
  "scripts": {
    "check:health": "node scripts/check-health-endpoints.mjs"
  }
}
```

## 约束条件

- 不引入新依赖
- 不暴露敏感环境变量
- 不要求登录
- 不做写操作
- 不记录 analytics
- 不要在 `/api/healthz` 中访问数据库
- TypeScript strict，禁止 `any`
- 遵循项目现有 API 响应风格

## 验收标准

完成后需要满足：

- [ ] `GET /api/healthz` 返回 200
- [ ] `GET /api/health` 在 DB 正常时返回 200
- [ ] `GET /api/health` 在 DB 异常或超时时返回 503
- [ ] 响应头包含 `Cache-Control: no-store`
- [ ] 响应体不包含 secret / env / stack trace
- [ ] 有测试覆盖正常、失败、超时
- [ ] 有防回归脚本
- [ ] 运行并汇报：

```bash
npx vitest run src/app/api/healthz/route.test.ts src/app/api/health/route.test.ts
npm run lint
npm run typecheck
npm run build
npm run check:health
```

如果 `typecheck` 命中项目已知测试文件历史错误，请说明不是本次修改引入，并确认业务代码无新增类型错误。

## 交付说明

最终回复请说明：

- 新增了哪些端点
- `/api/healthz` 和 `/api/health` 的区别
- Docker / 部署文档是否已更新
- 数据库异常时返回什么状态码
- 验证命令结果
```

这里建议做两个端点：`healthz` 保证探针轻量，`health` 负责依赖就绪。这样容器不会因为数据库短暂抖动被反复重启，负载均衡又能判断是否应该接流量。