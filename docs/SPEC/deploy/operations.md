# SPEC: 生产部署与运维

> 功能规格说明书 — 定义生产部署架构、检查清单、smoke test、回滚方案和监控告警。
> 对应 PRD：`docs/PRD/00_MASTER_PRD.md` §10 风险边界
> 实现状态：`⬜ 未开始`

---

## 1. 职责范围

定义蓝辉官网从本地开发到生产上线的完整部署流程。不包括 CI/CD 流水线搭建（属于 infra repo 范畴）。

## 1.1 Skill 路由

| Skill | 是否使用 | 用途 |
|---|---|---|------|
| `next-best-practices` | 否 | — |
| `react-best-practices` | 否 | — |
| `web-design-engineer` | 否 | — |
| `prisma-data-ops` | 否 | — |
| faker/MSW | 否 | — |

## 2. 部署架构

### 2.1 推荐方案：Caddy + Next.js standalone + PostgreSQL

```
Internet
  │
  ▼
Caddy (:80/:443)                    ← 自动 Let's Encrypt TLS，反向代理
  │
  ▼
Next.js standalone :3000            ← `npm run build` 产物，Docker 运行
  │
  ▼
PostgreSQL :5433                    ← 数据持久化
```

### 2.2 现有 Docker Compose 架构

项目已包含 `docker-compose.yml`，定义 4 个 service：

| Service | 镜像 | 端口 | 说明 |
|---------|------|------|------|
| `app` | `lanhui-website:latest` (runner) | 3000 | Next.js standalone 生产构建 |
| `dev` | `lanhui-website:dev` | 3001 (host) | 开发环境热重载 |
| `postgres` | `postgres:15-alpine` | 5433:5432 (host:container) | 数据库 |
| `nginx` | `nginx:alpine` | 80, 443 | 反向代理 |

注意：nginx 容器依赖挂载 `nginx.conf`，但仓库中该文件尚未创建。

### 2.3 推荐改进

将 nginx 替换为 Caddy（简化 TLS 证书管理），或至少创建 `nginx.conf` 以及 Certbot 集成。

## 3. 数据模型

### 3.1 环境变量（生产必填）

```bash
# === 数据库 ===
DATABASE_URL=postgresql://lanhui:<password>@postgres:5432/lanhui  # Docker 内部网络

# === NextAuth ===
NEXTAUTH_URL=https://lanhui.example.com                           # 生产域名
NEXTAUTH_SECRET=<openssl rand -base64 32>                          # 至少 32 字符

# === 应用 ===
NEXT_PUBLIC_API_BASE_URL=https://lanhui.example.com                # 生产 API 地址
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# === OSS（当前未使用，ali-oss 未接线）===
# ALIYUN_ACCESS_KEY_ID=
# ALIYUN_ACCESS_KEY_SECRET=
# ALIYUN_OSS_ENDPOINT=oss-cn-shanghai.aliyuncs.com
# ALIYUN_OSS_BUCKET=lanhui-website-prod
```

### 3.2 Zod 校验（启动时检查）

```typescript
// 建议加到 src/lib/env.ts，在 Next.js 配置中导入
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// process.env 校验失败 → 启动时立即报错，不静默运行
```

## 4. 部署前检查清单

在 `git push` 到生产分支前，逐项确认：

- [ ] **NEXTAUTH_SECRET** 已更换为非默认值（生产环境独立生成，不与开发/测试共享）
- [ ] **默认 admin 密码已修改**（`prisma/seed.ts` 中的 `admin123` 已在生产 DB 中更改）
- [ ] **ICP 备案号已填入**（`src/lib/brand.ts` 中 `icp` 字段，当前为占位文案）
- [ ] **SITE_URL 已设为生产域名**（`src/lib/schema.ts` / `src/lib/geo.ts` 中硬编码的 `lanhui.example.com`）
- [ ] **安全头已配置**（Caddyfile 或 nginx.conf 中 CSP / HSTS / X-Frame-Options / X-Content-Type-Options）
- [ ] **error.tsx / not-found.tsx 已就位**（每个路由组至少有一份 error boundary）
- [ ] **数据库备份 cron 已配置**（`pg_dump -U lanhui -h localhost lanhui > backup.sql`，每天一次）
- [ ] **`/api/health` 端点可用**（当前项目中不存在此端点，需新增）
- [ ] **联系信息非占位**（`src/lib/brand.ts` 中 phone/address/email 为真实信息）
- [ ] **next.config.ts 图片 remotePatterns** 已配置生产域名（如使用外部图床）

## 5. 业务规则

| # | 规则 | 触发条件 | 系统行为 |
|---|------|---------|---------|
| BR1 | 启动时校验关键环境变量 | `NODE_ENV=production` | 缺少 DATABASE_URL / NEXTAUTH_SECRET 时立即退出，不静默运行 |
| BR2 | SSG build 不依赖数据库 | `npm run build` | `data.ts` 中所有数据函数在 API 不可用时 fallback 到静态数据 |
| BR3 | 图片上传存储本地 | `/api/upload` 被调用 | 写入 `public/images/stores/<id>.webp`（非 OSS） |
| BR4 | admin 写操作强制鉴权 | 任何 `/api/**` POST/PATCH/DELETE | `auth()` + role check + Zod validation |
| BR5 | 静态资源缓存 | 构建产物中 `public/` 文件 | Caddy/nginx 对 `/_next/static/` 和 `public/images/` 设置长期缓存头 |

## 6. Smoke Test 用例

部署后立即执行，不通过则回滚：

| # | 用例 | 预期 |
|---|------|------|
| S1 | `GET /` → 200 | 首页完整渲染，H1 可见，CTA 可点击 |
| S2 | `GET /product` → 200 | 产品中心渲染，品牌卡片可见 |
| S3 | `GET /product/xiaomi/su7` → 200 | 车型页完整渲染 |
| S4 | `GET /agent` → 200 | 门店列表渲染，门店卡片可见 |
| S5 | `GET /news` → 200 | 资讯列表渲染 |
| S6 | `GET /news/[任意slug]` → 200 | 资讯详情页渲染（非 404） |
| S7 | `GET /api/stores` → 200 | JSON 响应含 `{ success: true, data: [...] }` |
| S8 | `GET /api/articles` → 200 | JSON 响应含 `{ success: true, data: [...], pagination: {...} }` |
| S9 | `POST /api/auth/callback/credentials` → 302 | admin 登录成功 |
| S10 | `GET /admin` → 200（登录后） | CMS dashboard 渲染 |

## 7. 错误处理矩阵

| 场景 | HTTP | 用户可见 | 运维动作 |
|------|------|---------|---------|
| DB 连接断开 | 500 | "系统暂时不可用"（全局 error.tsx） | 检查 PostgreSQL 容器状态 |
| DB 迁移未应用 | 500 / P3005 | 同上 | 运行 `prisma migrate deploy` |
| NEXTAUTH_SECRET 过短 | 启动失败 | 容器 crash loop | 检查 .env，生成 32+ 字符密钥 |
| Build 无 Postgres | N/A | 公开站正常（SSG fallback），admin/API 不可用 | 预期行为，CI build 不依赖 DB |
| 磁盘空间满（图片上传） | 500 | 上传失败 | 清理 `public/images/` 或扩容 |
| Caddy TLS 证书过期 | N/A | 浏览器安全警告 | Caddy 自动续期（正常情况下不会） |

## 8. 回滚方案

### 8.1 Docker 镜像回滚

```bash
# 查看历史镜像 tag
docker images lanhui-website

# 回滚到上一个稳定版本
docker tag lanhui-website:last-stable lanhui-website:rollback
docker-compose down
docker-compose up -d
```

### 8.2 数据库回滚

```bash
# 恢复最近的 pg_dump 备份
docker exec -i lanhui-postgres psql -U lanhui -d lanhui < latest_backup.sql
```

### 8.3 回滚决策矩阵

| 条件 | 动作 |
|------|------|
| Smoke test 任一失败 | 立即回滚（不回滚则用户可见 500/404） |
| 非关键页面显示异常但不影响核心路径 | 热修复（不触发全站回滚） |
| DB migration 失败 | 回滚镜像 + 恢复 DB 备份 |
| 安全漏洞（如未鉴权 admin 路径可公开访问） | 立即回滚 + 安全审计 |
| 性能下降 > 50% | 评估后决定（回滚或扩容） |

## 9. 监控告警

### 9.1 健康检查

```bash
# 当前 docker-compose.yml 中 app 和 dev service 已有 healthcheck
# Caddy/nginx: wget -qO- http://localhost:3000/ || exit 1
# 建议新增专用 /api/health 端点，返回 DB 连接状态
```

推荐 `/api/health` 端点实现：

```typescript
// src/app/api/health/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", db: "connected" }, { status: 200 });
  } catch {
    return Response.json({ status: "degraded", db: "disconnected" }, { status: 503 });
  }
}
```

### 9.2 告警阈值

| 指标 | 阈值 | 告警级别 |
|------|------|---------|
| Uptime | 连续 2 次健康检查失败（5 分钟间隔） | Critical |
| Error rate (5xx) | > 5% 请求 | Warning |
| DB connection | pool size > 80% | Warning |
| Disk usage | > 80% | Warning |
| Memory | > 90% | Critical |

### 9.3 日志

- Next.js 应用日志：`docker logs lanhui-website`
- PostgreSQL 日志：`docker logs lanhui-postgres`
- Caddy/nginx 访问日志：`docker logs lanhui-nginx`
- 建议配置 `docker compose logs` 集中收集（或接入外部日志服务）

## 10. 测试用例清单

| AC-ID | 场景 | 输入 | 预期 | 类型 |
|-------|------|------|------|------|
| DEPLOY-AC-01 | 首次部署 | `docker-compose up -d` | 所有 4 个容器健康运行 | happy |
| DEPLOY-AC-02 | Smoke test 全部通过 | 执行 §6 全部 10 项 | 全部 200 / 预期行为 | happy |
| DEPLOY-AC-03 | 缺 NEXTAUTH_SECRET | 启动时缺环境变量 | 容器立即退出，日志显示错误原因 | error |
| DEPLOY-AC-04 | DB 不可用 | PostgreSQL 容器关闭 | 公开站正常（SSG fallback），admin/API 返回错误 | edge |
| DEPLOY-AC-05 | 图片上传磁盘满 | 磁盘使用 > 95% | 上传失败，返回 500，不损坏已有文件 | error |
| DEPLOY-AC-06 | 回滚到上一版本 | 镜像回滚 + DB 恢复 | 服务恢复正常，数据与回滚前一致 | edge |
| DEPLOY-AC-07 | Caddy TLS 自动续期 | 证书距过期 < 30 天 | Caddy 自动续期，无需手动干预 | edge |

## 11. 已知问题

- [ ] `/api/health` 端点尚未实现
- [ ] `nginx.conf` 尚未创建（docker-compose 中 nginx 容器启动会失败）
- [ ] OSS 未接线（`ali-oss` 为 installed-but-unused 依赖）
- [ ] `src/lib/brand.ts` 中联系信息为占位文案，上线前必须替换
- [ ] `src/lib/schema.ts` / `src/lib/geo.ts` 中 `SITE_URL = "https://lanhui.example.com"` 非环境变量驱动
- [ ] 无 staging 环境（建议上线前至少部署一次 staging 并跑完整 smoke test）

## 12. 验收条件

- [ ] AC1: `docker-compose up -d` 所有容器健康运行
- [ ] AC2: Smoke test 全部 10 项通过
- [ ] AC3: 部署前检查清单全部 ✅
- [ ] AC4: `/api/health` 返回 DB 连接状态
- [ ] AC5: `npm run build` 在无 Postgres 环境成功（CI 已验证）

## 13. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-07-07 | Claude Code | 创建上线 SPEC | 完成 | 实际执行部署前检查清单 + 创建 /api/health |

---

> 最后更新: 2026-07-07
