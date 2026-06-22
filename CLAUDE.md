# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目：蓝辉轻改 LANHUI（品牌官网 + CMS 一体化）

- 业务：汽车轻改装 + 车身膜服务（顺德大良店）
- 全栈：公开站 + `/admin` 管理后台 + Prisma/Postgres + NextAuth + 阿里云 OSS + 客户端埋点
- 维护者：冯科雅（Coya）· AI 部 · 远程 https://github.com/coyafky/LanHui-Website.git
- README.md 是产品侧速查；docs/ARCHITECTURE.md 是工程侧完整图（路由 / 数据 / 部署 / 质量门禁）
- Next.js 16.2.1 + React 19.2.4 + TS strict + Tailwind v4 + Prisma 7.8（`adapter-pg`）+ NextAuth v5 beta

@AGENTS.md

## Commands 速查

| Command | 用途 |
|---------|------|
| `npm run dev` | dev server (Turbopack) → :3000 |
| `npm run check` | **CI 链**：lint + typecheck + verify:zeekr-images + build |
| `npm run test` / `test:watch` / `test:coverage` | vitest（happy-dom） |
| `npm run test:e2e` | Playwright |
| `npx vitest run src/lib/xxx.test.ts` | 单跑单文件 |
| `npx vitest run -t "name"` | 按用例名过滤 |
| `npx prisma migrate dev --name X` | 新建迁移 |
| `npx prisma db seed` | 重 seed（admin / 27 省 / 75 市） |
| `npx tsx scripts/create-admin.ts --username X --email Y --password Z --role admin` | CLI 建管理员 |

## Architecture 大图

### 路由三层
- **公开站**（`src/app/`）— SSG 优先；动态页 `/agent/[slug]/[city]`、`/agent/store/[id]`、`/news/[slug]` 用 `generateStaticParams` 枚举
- **CMS**（`src/app/admin/(dashboard)/*`）— `force-dynamic`，每次请求重渲染；layout.tsx 里 `auth()` 守卫
- **API**（`src/app/api/*`）— route handlers，统一响应 `{ success, data?, error?, details? }`；写操作必 `auth()` + role 校验 + Zod 二次校验

### 数据访问模式
- **静态数据**（品牌 / 产品 / 资讯 / 证书 / 历程）按关注点分文件：`src/lib/{brand,products,store,news,certifications,history,china-regions}.ts` 与 `<topic>-products.ts`
- **DB 数据** 走 `src/lib/prisma.ts` 单例（`PrismaPg` adapter）→ `src/lib/data.ts` 统一聚合（API 优先，失败 fallback 静态）
- 写操作走 API route，**不**在 RSC 里直接调 `prisma.*`

### 认证 / 角色
- NextAuth v5 beta + Credentials + JWT（无 DB session）
- 角色：`admin` / `editor`；类型扩展在 `src/types/next-auth.d.ts`
- 权限矩阵见 ARCHITECTURE.md §7.2

### 客户端埋点
- `src/components/AnalyticsProvider.tsx`（"use client"）监听路由 → 自动 pageview
- 手动 track 走 `src/lib/analytics.ts`（缓冲 5 条 / 10s flush，`sendBeacon` 优先）
- 服务端 `/api/analytics/track`：限流 60/min/IP、type 白名单

### 关键业务模式：主题页（已 wenjie / xiaomi / zeekr 验证）

每个产品专题（wenjie / xiaomi / zeekr / flooring 等）共用结构：
1. `src/lib/<topic>-products.ts` 静态数据 + **字面量类型**（图片宽 1448 / 高 1086 / 比例 4:3）防规格漂移
2. `src/components/<topic>/` 5 组件：AnchorNav / ProductCard（3 态 `imageStatus: matched|pending-review|missing`）/ ProductGrid / ProductTable / TopicBanner
3. `src/app/product/<topic>/page.tsx` RSC：Hero + 锚点导航 + N 车型 section + 服务流程 + CTA + JSON-LD ItemList
4. `src/app/product/page.tsx` 加 `<XxxTopicBanner />` 入口
5. CI 脚本（如 `scripts/verify-zeekr-images.mjs`）链入 `npm run check`

主题配色：xiaomi=orange, wenjie=cyan, zeekr=orange, flooring=amber。
图片容器统一：`aspect-[4/3] + object-contain + Next/Image sizes`。

## ⚠️ 环境陷阱（踩过的坑，必读）

1. **PostgreSQL 端口是 5433**（非默认 5432）：`.env` 用 `postgresql://lanhui:lanhui_password@localhost:5433/lanhui`；容器名 `lanhui-postgres`
2. **`DATABASE_URL` 不在 shell env**：`npx prisma ...` 前必须 `set -a && source .env && set +a`，否则静默失败
3. **macOS APFS 大小写不敏感**：`zeekr/` 和 `ZEEKR/` 是同一目录（`stat -f "%d:%i"` 同 inode）；改名用 `mv A _tmp && mv _tmp B` 强制 case change
4. **DB 用 `prisma db push` bootstrap，不是迁移**：`_prisma_migrations` 表不存在 → `migrate deploy` 报 P3005。新增字段官方做法：
   - `docker exec lanhui-postgres psql -U lanhui -d lanhui` 直接 `ALTER TABLE ADD COLUMN IF NOT EXISTS`
   - 手动建 `_prisma_migrations` 表（列：`id, checksum, finished_at, migration_name, **logs (复数)**, rolled_back_at, started_at, applied_steps_count`）
   - 插入所有 prior migrations + 新 migration 行
   - 跑 `npx prisma migrate status` 验证；之后再 `npx tsx prisma/seed.ts` 回填 code/type 列
5. **Prisma 7 + Driver Adapter 错误形态**：`P2022` (ColumnNotFound) 与 `P2002` 都返回 `{ code, meta: { modelName, driverAdapterError: { cause } } }`，不是 legacy `meta.target`

## 已知遗留问题（不要作为新 bug 报告）

- `npm run build` 失败：`src/app/news/[slug]/page.tsx:94` 引用 `item.content`，但 `NewsItem` 类型无此字段（commit 0b8f38c）
- `npx tsc --noEmit` 15 个错位于 pre-existing 文件（`api/analytics/stats/route.test.ts`、`news/[slug]/page.tsx`、`lib/analytics.test.ts`、`lib/image.test.ts`）
- `npm run lint` 1227 错误来自 `.claude/worktrees/agent-a3994bc6/.next/`（误提交）+ `.claude/plugins/` 脚本
- 未追踪基线文件 `src/components/ArticleContent.tsx`、`src/lib/image.ts` 是构建必需

## AI 工作流约定

- `/prompt-boost` 自然语言 → 结构化 spec
- `/dispatch` 架构师 → 实现者 → 测试 → 部署 流水线（worktree 隔离并行）
- `/build` `/test` `/review` `/ship` 增量任务
- **worktree 模式**：`git worktree add .claude/worktrees/agent-<id> -b worktree-agent-<id> master`，coder 在自己 worktree commit，orchestrator 用 `--no-ff` merge
- 修改 `AGENTS.md` 后必须 `bash scripts/sync-agent-rules.sh` 同步多平台
- 修改 `.claude/skills/clone-website/SKILL.md` 后必须 `node scripts/sync-skills.mjs` 同步

## 代码风格

- TypeScript strict，`any` 禁用
- 命名导出、PascalCase 组件、camelCase 工具
- Tailwind utility only，无内联 style；2-space 缩进
- 共享状态用 module-level emitter + client hook（如 `src/lib/wechat-modal.ts`）
- 测试模式：`vi.hoisted` + `vi.mock('@/lib/prisma')` + `vi.resetModules` + 动态 `await import('./route')`