# 蓝辉轻改 LANHUI 官网 — 架构与操作执行文档

> 本文档聚焦**「蓝辉轻改 LANHUI」官网项目当前完整架构**,
> 覆盖前端页面、CMS 管理后台、Prisma + PostgreSQL 数据层、NextAuth 认证体系、
> 客户端埋点分析、Docker / Nginx 部署,并描述关键命令与操作的端到端调用链。
>
> 适用读者:接手维护的全栈工程师、运维、代码审计者。
>
> 最后更新: 2026-06-09 · 项目版本: v0.3.1 · Next.js 16.2.1 · React 19.2.4
>
> 与现有文档的关系:
> - `docs/CMS_OPERATIONS.md` — CMS 模块详细操作手册
> - `docs/ARCHITECTURE_IMAGE_STRATEGY.md` — 图像资源策略
> - **本文档** — 整合**当前**完整架构与执行链路
>
> ## 0. 架构图说明
>
> 历史生成图表目录已在 2026-06-26 文档清理中移除。后续如需架构图或时序图,
> 直接在本文使用 Mermaid 小图,或将一次性验证产物放入 `docs/test-reports/<YYYY-MM-DD>/`。

---

## 1. 一页纸总览

| 维度 | 当前实现 |
|------|----------|
| 业务定位 | 汽车轻改装 + 车身膜服务 (顺德大良店) |
| 框架 | Next.js 16.2.1 (App Router) |
| 运行时 | React 19.2.4 + TypeScript 5 strict |
| 样式 | Tailwind CSS v4 (oklch tokens) |
| 数据库 | PostgreSQL 15 (Prisma 7.8 ORM) |
| 认证 | NextAuth v5 beta (Credentials Provider + JWT) |
| 部署 | Docker standalone + Nginx 反向代理 |
| 用户可见路由 | 11 (含 SSG 动态) |
| 后台管理路由 | 4 (`/admin/*`) |
| API 路由 | 6 (`/api/*`) |
| 预渲染总页数 | 25+ |
| 真实门店 | 1 (顺德大良) |
| 客户端埋点 | ✅ (pageview / click / form_submit / reservation / store_view) |

---

## 2. 完整技术栈

| 类别 | 选型 | 版本 / 备注 |
|------|------|------------|
| **框架** | Next.js | 16.2.1 (App Router + Turbopack + standalone output) |
| **UI 运行时** | React | 19.2.4 |
| **语言** | TypeScript (strict) | 5.x |
| **样式** | Tailwind CSS v4 | `@theme` 内联在 `globals.css`,oklch 色彩 |
| **组件** | 自研 + shadcn 风格 | `cn()` 工具在 `src/lib/utils.ts` |
| **图标** | lucide-react | 1.6.0 |
| **数据库** | PostgreSQL | 15-alpine (Docker) |
| **ORM** | Prisma | 7.8.0 + `@prisma/adapter-pg` |
| **认证** | NextAuth | v5 beta.31 (Credentials + JWT) |
| **密码哈希** | bcryptjs | 3.0.3 |
| **校验** | Zod | 4.4.3 |
| **表单** | react-hook-form + @hookform/resolvers | 7.78.0 |
| **数据表格** | @tanstack/react-table | 8.21.3 |
| **图表** | recharts | 3.8.1 |
| **图床** | ali-oss | 6.23.0 (阿里云 OSS) |
| **UI 基元** | @base-ui/react | 1.3.0 |
| **动画** | tw-animate-css | 1.4.0 |
| **包管理** | npm | Node 24+ baseline |
| **构建** | Turbopack (默认) | 集成在 Next.js 16 |
| **部署** | Docker (multi-stage) + Nginx | 见 §11 |

---

## 3. 完整目录结构

```
lanhui-website/
├── prisma/
│   ├── schema.prisma                  # 5 个数据模型
│   ├── seed.ts                        # 初始数据(用户/省/市/店/文章)
│   └── migrations/                    # Prisma 迁移历史
├── public/                            # 静态资源
│   ├── images/{logo,home,brand,cert,store,products,film}/
│   └── seo/                           # favicon / OG image
├── scripts/
│   ├── create-admin.ts                # CLI: 创建管理员/编辑
│   ├── download-assets.mjs            # 静态资源批量下载
│   ├── sync-agent-rules.sh            # 同步 AGENTS.md 到多平台
│   └── sync-skills.mjs                # 同步 /clone-website skill
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # 根布局 + metadata + OrganizationSchema
│   │   ├── page.tsx                   # 首页
│   │   ├── globals.css                # 全局样式 + Tailwind v4 @theme
│   │   ├── sitemap.ts                 # 动态 sitemap.xml
│   │   ├── robots.ts                  # 动态 robots.txt
│   │   ├── product/                   # /product + 6 个子页 (SSG)
│   │   ├── agent/                     # 4 层门店路由
│   │   ├── brand/                     # /brand + 2 个子页
│   │   ├── news/                      # /news + /news/[slug] (SSG)
│   │   ├── contact/                   # /contact
│   │   ├── admin/                     # CMS 后台 (auth 保护)
│   │   │   ├── layout.tsx             # /admin/login 布局
│   │   │   ├── login/page.tsx         # 登录页
│   │   │   └── (dashboard)/           # 路由组(共享 layout + auth 守卫)
│   │   │       ├── layout.tsx         # auth 守卫 + Sidebar
│   │   │       ├── page.tsx           # 仪表盘
│   │   │       ├── stores/            # 门店管理
│   │   │       ├── articles/          # 文章管理
│   │   │       └── analytics/         # 数据统计
│   │   └── api/                       # 后端 API
│   │       ├── auth/[...nextauth]/    # NextAuth handler
│   │       ├── stores/{,[id]}/        # 门店 CRUD
│   │       ├── articles/{,[id]}/      # 文章 CRUD
│   │       ├── analytics/             # 埋点 (track + stats)
│   │       ├── provinces/             # 省份查询
│   │       └── cities/                # 城市查询
│   ├── components/
│   │   ├── Header.tsx                 # "use client" 顶部导航
│   │   ├── Footer.tsx                 # 底部信息
│   │   ├── Hero.tsx                   # 首页 hero
│   │   ├── WhyChooseUs.tsx            # 三特性
│   │   ├── CoreServices.tsx           # 3 服务卡片
│   │   ├── ProductsQuickEntry.tsx     # 6 产品入口
│   │   ├── ProductDetail.tsx          # 产品详情共享模板
│   │   ├── CertCard.tsx               # 证书卡片
│   │   ├── Logo.tsx                   # 品牌 logo
│   │   ├── InfoRow.tsx                # 信息行
│   │   ├── OptimizedImage.tsx         # 图片优化包装
│   │   ├── AnalyticsProvider.tsx      # "use client" 自动 pageview 追踪
│   │   ├── film/                      # 膜系产品子组件 (5 个)
│   │   ├── admin/                     # CMS 子组件
│   │   │   ├── Sidebar.tsx            # 侧边栏导航
│   │   │   ├── RegionSelector.tsx     # 省市级联
│   │   │   └── StoreForm.tsx          # 门店表单
│   │   └── ui/button.tsx              # shadcn 风格按钮
│   ├── lib/
│   │   ├── prisma.ts                  # PrismaClient 单例
│   │   ├── auth.ts                    # NextAuth 配置 (Credentials)
│   │   ├── schema.ts                  # JSON-LD OrganizationSchema
│   │   ├── analytics.ts               # "use client" 埋点 SDK
│   │   ├── store.ts                   # 门店数据访问
│   │   ├── products.ts                # 6 产品定义
│   │   ├── brand.ts                   # 品牌信息
│   │   ├── news.ts                    # 资讯数据
│   │   ├── certifications.ts          # 证书数据
│   │   ├── history.ts                 # 品牌历程
│   │   ├── china-regions.ts           # 中国行政区数据
│   │   ├── geo.ts                     # 地理工具
│   │   ├── images.ts                  # 图片路径工具
│   │   ├── data.ts                    # 统一数据聚合(含 API fallback)
│   │   ├── utils.ts                   # cn() 工具
│   │   └── validations/               # Zod schemas
│   │       ├── store.ts
│   │       └── article.ts
│   ├── types/
│   │   └── next-auth.d.ts             # NextAuth 类型扩展 (role)
│   └── hooks/                         # (空,占位)
├── docs/                              # 项目文档 (本文档所在)
├── nginx.conf                         # 反向代理 + 安全头 + gzip
├── docker-compose.yml                 # app / dev / postgres / nginx
├── Dockerfile                         # 3 阶段构建 (deps/builder/runner)
├── Dockerfile.dev                     # 开发模式
├── prisma.config.ts                   # Prisma 配置
├── next.config.ts                     # standalone output + 图片优化
├── tailwind.config (内联在 globals.css)
├── tsconfig.json                      # strict
├── eslint.config.mjs                  # Next.js ESLint preset
├── postcss.config.mjs                 # Tailwind v4 PostCSS 插件
├── components.json                    # shadcn 配置
├── package.json                       # 依赖 + scripts
├── .env.example                       # 环境变量模板
├── .env                               # 本地环境变量 (git ignore)
├── .nvmrc                             # Node 版本 (24)
├── AGENTS.md                          # AI 代理工作规范
├── CLAUDE.md                          # Claude Code 项目说明
├── GEMINI.md                          # Gemini CLI 项目说明
├── CHANGELOG.md                       # 版本变更
├── README.md                          # 快速开始
└── LICENSE                            # MIT
```

---

## 4. 数据库架构 (Prisma)

### 4.1 数据模型关系图

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Province   │◄──────┤     City     │◄──────┤    Store     │
│   (省)        │  1:N  │   (市)       │  1:N  │   (门店)      │
│              │       │              │       │              │
│ slug @id     │       │ slug @id     │       │ id @id       │
│ label        │       │ provinceSlug │       │ slug @unique │
│ description  │       │ label        │       │ name         │
│ imageUrl     │       │ description  │       │ provinceSlug │
│ order        │       │ imageUrl     │       │ provinceLabel│
│ isActive     │       │ order        │       │ citySlug     │
└──────┬───────┘       │ isActive     │       │ cityLabel    │
       │               └──────────────┘       │ address      │
       │ 1:N                                   │ phone        │
       │                                       │ businessHours│
       └───────────────────────────────────────│ imageUrl     │
                       (Province 与 Store      │ isActive     │
                        Restrict 关联,         └──────┬───────┘
                        防止省份被删)                │
                                                   │ 1:N
                                                   ▼
                                            ┌──────────────┐
┌──────────────┐       ┌──────────────┐     │AnalyticsEvent│
│     User     │◄──────┤   Article    │     │  (埋点事件)   │
│   (用户)      │  1:N  │   (文章)      │     │              │
│              │       │              │     │ id @id       │
│ id @id       │       │ id @id       │     │ type         │
│ email @unique│       │ slug @unique │     │ pathname     │
│ username     │       │ title        │     │ storeId?     │
│ password     │       │ content      │     │ metadata     │
│ role         │       │ status       │     │ userAgent    │
│ status       │       │ category     │     │ ip           │
└──────────────┘       │ viewCount    │     │ timestamp    │
                       │ isSticky     │     └──────────────┘
                       │ publishedAt  │
                       │ authorId     │
                       └──────────────┘
```

### 4.2 关键约束

| 关系 | 行为 | 业务意义 |
|------|------|----------|
| `Province → City` | `onDelete: Cascade` | 删省 → 自动删市 |
| `Province → Store` | `onDelete: Restrict` | 删省前必须先删门店 |
| `City → Store` | `onDelete: Restrict` | 删市前必须先删门店 |
| `User → Article` | `onDelete: Restrict` | 不能删有文章的用户 |
| `Store → AnalyticsEvent` | `onDelete: SetNull` | 删门店 → 保留事件(只清 storeId) |

### 4.3 索引

- `Province`: `[isActive]`
- `City`: `[provinceSlug]`, `[isActive]`
- `Store`: `[provinceSlug]`, `[citySlug]`, `[isActive]`, `[slug]`
- `Article`: `[status]`, `[slug]`, `[category]`, `[publishedAt]`
- `AnalyticsEvent`: `[type]`, `[storeId]`, `[pathname]`, `[timestamp]`

### 4.4 角色与状态枚举

| 字段 | 取值 |
|------|------|
| `User.role` | `admin` / `editor` (默认 `editor`) |
| `User.status` | `active` / (其他) |
| `Article.status` | `draft` / `published` / (其他) |
| `* .isActive` | `true` / `false` (软删除) |

---

## 5. 路由系统 (完整)

### 5.1 路由总览

| 区域 | 路由 | 渲染方式 | 备注 |
|------|------|----------|------|
| **公开站** | `/` | SS | 首页 (4 段滚动) |
| | `/product` | SS | 6 卡片 |
| | `/product/{electric-steps,wheels,chassis,window-film,color-film,ppf}` | SS | ProductDetail 共享 |
| | `/agent` | SS | 省份入口 |
| | `/agent/[slug]` | SSG | 1 省 (广东) |
| | `/agent/[slug]/[city]` | SSG | 1 市 (佛山) |
| | `/agent/store/[id]` | SSG | 1 店 (顺德大良) |
| | `/brand` | SS | 品牌介绍 |
| | `/brand/certifications` | SS | 6 证书 |
| | `/brand/history` | SS | 5 段历程 |
| | `/news` | SS | 资讯列表 |
| | `/news/[slug]` | SSG | 详情 |
| | `/contact` | SS | 联系我们 |
| **SEO 动态** | `/sitemap.xml` | 动态 | sitemap.ts |
| | `/robots.txt` | 动态 | robots.ts |
| **CMS** | `/admin/login` | SS | 登录页 |
| | `/admin` (dashboard) | SSR | auth 守卫, 仪表盘 |
| | `/admin/stores` | SSR | 门店列表 |
| | `/admin/stores/new` | SSR | 新建表单 |
| | `/admin/stores/[id]` | SSR | 编辑表单 |
| | `/admin/articles` | SSR | 文章列表 |
| | `/admin/articles/new` | SSR | 新建 |
| | `/admin/articles/[id]` | SSR | 编辑 |
| | `/admin/analytics` | SSR | 统计 |
| **API** | `POST /api/auth/[...nextauth]` | — | NextAuth |
| | `GET/POST /api/stores` | — | 列表/创建 |
| | `GET/PUT/DELETE /api/stores/[id]` | — | CRUD |
| | `GET/POST /api/articles` | — | 列表/创建 |
| | `GET/PUT/DELETE /api/articles/[id]` | — | CRUD |
| | `POST /api/analytics/track` | — | 批量埋点 |
| | `GET /api/analytics/stats` | — | 统计聚合 |
| | `GET /api/provinces` | — | 省份查询 |
| | `GET /api/cities` | — | 城市查询 |

---

## 6. 数据访问层

### 6.1 `src/lib/prisma.ts` — PrismaClient 单例

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**设计要点**:
- 全局单例,避免 dev 模式 HMR 时连接泄漏
- 使用 `PrismaPg` 适配器直连 PostgreSQL
- 复用 `DATABASE_URL` 环境变量

### 6.2 `src/lib/data.ts` — 统一数据聚合 (API 优先 + 静态 fallback)

**关键函数**:
- `getProvinces()` / `getAllProvinceSlugs()` / `getCitiesByProvince(slug)` / `getAllCitySlugs(slug)`
- `getStores({province, city, search, page, limit, all})` / `getStoreById(id)` / `getRelatedStores(province, excludeId, limit)`
- `getAllStoreIds()` / `getAllArticleSlugs()` / `getArticleBySlug(slug)`

**模式** (例):
```typescript
export async function getStores(params: {...}) {
  try {
    const search = new URLSearchParams(params as Record<string, string>);
    const res = await fetch(`${API_BASE}/api/stores?${search}`, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch {
    return getStoresFromStatic(params);   // 静态数据 fallback
  }
}
```

### 6.3 静态数据文件 (按关注点分离)

| 文件 | 行数级 | 内容 |
|------|-------|------|
| `brand.ts` | ~20 | 品牌名/标语/联系方式占位 |
| `products.ts` | ~280 | 6 个产品方向 (light-mod / film) |
| `store.ts` | ~120 | 1 省 + 1 市 + 1 店 (顺德大良) |
| `news.ts` | ~50 | 3 条占位资讯 |
| `certifications.ts` | ~110 | 6 证书 |
| `history.ts` | ~50 | 5 段历程 |
| `china-regions.ts` | ~500 | 中国行政区数据 |

---

## 7. 认证与权限体系

### 7.1 NextAuth 配置 (`src/lib/auth.ts`)

- **Provider**: Credentials (用户名 / 邮箱 + 密码)
- **密码验证**: `bcrypt.compare` against DB `User.password` (10 rounds 哈希)
- **JWT 策略**: 全部会话存于 JWT,无 DB session
- **回调**:
  - `jwt({token, user})` — 登录时把 `role` 写入 token
  - `session({session, token})` — 把 `role` 暴露给 `session.user`
- **登录页**: `/admin/login`
- **未登录重定向**: 由 `src/app/admin/(dashboard)/layout.tsx` 实现

### 7.2 角色权限矩阵

| 资源 / 动作 | 公开 | editor | admin |
|------------|------|--------|-------|
| `GET /api/stores` | ✅ (仅 isActive) | ✅ | ✅ (`?all=true` 含未激活) |
| `POST /api/stores` | ❌ 401 | ❌ 403 | ✅ |
| `GET /api/articles` | ✅ (仅 published) | ✅ (含所有 status) | ✅ (含所有 status) |
| `POST /api/articles` | ❌ 401 | ✅ | ✅ |
| Admin 路由访问 | → 重定向到 `/admin/login` | ✅ | ✅ |

### 7.3 NextAuth 类型扩展

`src/types/next-auth.d.ts`:
```typescript
declare module "next-auth" {
  interface User { role: string; }
  interface Session {
    user: { id?: string; email?: string; name?: string; role: string; };
  }
}
declare module "next-auth/jwt" {
  interface JWT { role: string; }
}
```

---

## 8. 客户端埋点与分析系统

### 8.1 数据流

```
用户浏览器
   │
   │  路由变化 (usePathname)        ┌──────────────────────┐
   ├───────────────────────────────►│ AnalyticsProvider   │
   │  trackPageView()              │ (客户端组件)         │
   │                                └──────────┬───────────┘
   │                                           │ track({ type, pathname })
   │  点击按钮                              ┌────▼────────────┐
   ├───────────────────────────────────────►│ eventBuffer     │
   │  trackClick(target, metadata)         │ (最多 5 条)      │
   │                                        └────┬────────────┘
   │  表单提交                                    │ BUFFER_SIZE=5 或 10s
   ├────────────────────────────────────────────►│ flush()
   │  trackFormSubmit(formName)                  │
   │                                             │
   │  门店详情页打开                             │
   ├────────────────────────────────────────────►│  navigator.sendBeacon
   │  trackStoreView(storeId)                   │  /api/analytics/track
   │                                             │  (POST, JSON batch)
   │                                             ▼
   │                                       ┌──────────────────┐
   │                                       │ /api/analytics/  │
   │                                       │     track        │
   │                                       │ • 限流 60/min/IP │
   │                                       │ • 验证事件类型   │
   │                                       │ • 写 PostgreSQL  │
   │                                       └────────┬─────────┘
   │                                                │
   │                                                ▼
   │                                       ┌──────────────────┐
   │                                       │ AnalyticsEvent   │
   │                                       │ (Prisma model)   │
   │                                       └──────────────────┘
```

### 8.2 事件类型

| type | 触发场景 | 额外字段 |
|------|---------|---------|
| `pageview` | 路由变化 (跳过 `/admin/*`) | pathname |
| `click` | 关键按钮点击 | metadata.target |
| `form_submit` | 表单提交 | metadata.formName |
| `reservation` | 预约动作 | storeId + metadata |
| `store_view` | 门店详情页打开 | storeId |

### 8.3 客户端缓冲策略

- **触发 flush 条件**:
  1. 缓冲区达到 5 条
  2. 距离上次 flush 10 秒
  3. `beforeunload` 事件
  4. `visibilitychange === 'hidden'`
- **传输方式**: 优先 `navigator.sendBeacon` (异步、不阻塞),fallback `fetch + keepalive`

### 8.4 服务端防护

- **内存限流**: `Map<ip, {count, resetAt}>`,每 IP 每分钟 60 次
- **定期清理**: 每 2 分钟清过期 IP 记录
- **批量上限**: 单次请求最多 50 条事件
- **类型白名单**: 5 种合法 type

---

## 9. SEO 与可观测性

### 9.1 SEO 配置矩阵

| 项 | 实现 | 文件 |
|----|------|------|
| `<title>` / `<meta description>` | 根 metadata | `src/app/layout.tsx` |
| `<meta keywords>` | ✅ | 同上 |
| OpenGraph | title/description/locale/type | 同上 |
| `<html lang="zh-CN">` | ✅ | 同上 |
| `/sitemap.xml` | 动态生成,25+ URL | `src/app/sitemap.ts` |
| `/robots.txt` | 全站允许,屏蔽 `/api/` `/admin` | `src/app/robots.ts` |
| JSON-LD Organization | 内联 script | `src/lib/schema.ts` |
| Schema.org LocalBusiness | ❌ (待 Phase 2) | — |
| canonical URL | ❌ | — |
| Twitter Card | ❌ | — |
| favicon | ✅ | `src/app/favicon.ico` |
| apple-touch-icon | ❌ (待补) | `public/seo/` |
| OG image | ❌ (待补) | `public/seo/og-default.png` |

### 9.2 关键性能配置 (`next.config.ts`)

```typescript
{
  output: "standalone",                 // Docker 部署优化
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640,750,828,1080,1200,1920,2048,3840],
    imageSizes: [16,32,48,64,96,128,256,384],
    minimumCacheTTL: 2592000,         // 30 天
  },
}
```

---

## 10. 共享组件清单

| 组件 | "use client"? | 职责 |
|------|---------------|------|
| `Header.tsx` | ✅ | 5 项导航 + 产品下拉 + Esc/外部点击/标签可点 |
| `Footer.tsx` | ❌ | 4 列布局 + 备案号 |
| `Hero.tsx` | ❌ | 首页 hero,渐变背景 + 双 CTA |
| `WhyChooseUs.tsx` | ❌ | 3 特性卡片 |
| `CoreServices.tsx` | ❌ | 3 卡片 + 真实门店入口 |
| `ProductsQuickEntry.tsx` | ❌ | 6 卡片 |
| `ProductDetail.tsx` | ❌ | **6 产品详情共享模板 (DRY 关键)** |
| `CertCard.tsx` | ❌ | 证书卡片 |
| `Logo.tsx` | ❌ | 品牌 logo |
| `InfoRow.tsx` | ❌ | 信息行 |
| `OptimizedImage.tsx` | ❌ | 图片优化包装 |
| `AnalyticsProvider.tsx` | ✅ | 自动 pageview 追踪 |
| `film/*` (5 个) | ❌ | 膜系产品专用子组件 |
| `admin/Sidebar.tsx` | ❌ | 后台侧边栏 |
| `admin/RegionSelector.tsx` | ✅ | 省市级联 (受控) |
| `admin/StoreForm.tsx` | ✅ | 门店表单 (react-hook-form + zod) |
| `ui/button.tsx` | ❌ | shadcn 风格 |

---

## 11. 部署架构 (Docker / Nginx / Postgres)

### 11.1 容器拓扑

```
┌──────────────────────────────────────────────────────────────┐
│  HOST (80/443)                                                │
│  ┌──────────┐                                                 │
│  │  nginx   │ :80, :443 (gzip + cache + security headers)    │
│  │  (alpine)│                                                 │
│  └────┬─────┘                                                 │
│       │ proxy_pass http://app:3000                            │
│       ▼                                                       │
│  ┌──────────┐ :3000 (Next.js standalone)                      │
│  │   app    │──────►┌──────────────────┐                       │
│  │ (runner) │       │   postgres       │ :5432 (内部网络)       │
│  │          │       │ (15-alpine)      │                       │
│  └──────────┘       │ lanhui / password│                       │
│       ▲             │ pgdata (volume)  │                       │
│       │             └──────────────────┘                       │
│       │  dev 模式: lanhui-website-dev (port 3001)              │
│       │  ├ 挂载源码卷 (热更新)                                  │
│       │  └ 同样连 postgres                                      │
└──────────────────────────────────────────────────────────────┘
```

### 11.2 Nginx 关键配置 (`nginx.conf`)

| 路径 | 策略 |
|------|------|
| `/_next/static/*` | 缓存 365 天, immutable |
| `/images/*` | 缓存 30 天 |
| `/` | 透传 WebSocket Upgrade (HMR) |
| `~ /\.` | 拒绝所有隐藏文件 |
| 全局 | gzip level 6, X-Frame-Options, X-Content-Type-Options, XSS, Referrer-Policy |

### 11.3 Dockerfile 三阶段

| Stage | 用途 |
|-------|------|
| `dependencies` | 缓存 npm ci (--no-audit --no-fund) |
| `builder` | 完整 `npm run build`,生成 `.next/standalone` |
| `runner` | 仅复制 standalone + static,`USER node`,`EXPOSE 3000` |

**启动命令**: `node server.js` (Next.js standalone 输出)

### 11.4 docker-compose 服务

| 服务 | 端口 | 用途 |
|------|------|------|
| `app` | `${PORT:-3000}:3000` | 生产 Next.js |
| `dev` | `${DEV_PORT:-3001}:3000` | 开发模式(挂载源码) |
| `postgres` | `5433:5432` (主机) | 数据库 |
| `nginx` | `80:80` (`443:443` 占位) | 反向代理 |

---

## 12. 关键操作执行流程图

### 12.1 完整开发循环: `npm run dev`

```
用户执行 npm run dev
  │
  ▼
[package.json#scripts.dev] → next dev
  │
  ▼
Next.js 16 启动
  │
  ├─► 读取 next.config.ts (standalone + image 优化)
  ├─► 读取 tsconfig.json (paths: @/* → src/*)
  ├─► 加载 tailwind v4 (postcss.config.mjs → @tailwindcss/postcss)
  ├─► 扫描 src/app/**/page.tsx 构建路由树
  │
  ▼
Turbopack 编译 (按需)
  │
  ├─► 公共页面 /, /product, /agent, /brand, /news, /contact
  │   └─► SS 渲染 (无 params,直接渲染)
  │
  ├─► 动态页 /agent/[slug], /agent/[slug]/[city], /agent/store/[id]
  │   └─► 调用 generateStaticParams() 预渲染
  │       ├─► 读 src/lib/data.ts (API → fallback 静态)
  │       └─► 产出 SSG HTML 到 .next/server/app/
  │
  ├─► CMS 路由 /admin/(dashboard)/*
  │   └─► export const dynamic = "force-dynamic"
  │       └─► 每次请求重新查 DB
  │
  └─► 监听 :3000 (被占用顺延 :3001, :3002)
       └─► HMR 就绪
```

### 12.2 生产构建: `npm run build`

```
npm run build
  │
  ▼
[package.json#scripts.build] → next build
  │
  ▼
Phase 1: 编译与优化
  │
  ├─► TypeScript 编译 (tsc --noEmit 检查先行)
  ├─► ESLint (next/core-web-vitals preset)
  ├─► PostCSS 处理 globals.css (Tailwind v4)
  │
  ▼
Phase 2: 数据收集 (SSG generateStaticParams)
  │
  ├─► /agent/[slug]
  │   └─► 遍历 getAllProvinceSlugs()
  │       └─► [广东] → /agent/guangdong.html
  │
  ├─► /agent/[slug]/[city]
  │   └─► 遍历 (省 × 市) 组合
  │       └─► [广东,佛山] → /agent/guangdong/guangzhou.html
  │
  ├─► /agent/store/[id]
  │   └─► 遍历 getAllStoreIds()
  │       └─► [顺德大良店] → /agent/store/{id}.html
  │
  ├─► /news/[slug]
  │   └─► 遍历 getAllArticleSlugs()
  │       └─► 3 篇文章 → /news/{slug}.html
  │
  │   (产品子页通过 ProductDetail 共享组件静态生成 6 个)
  │
  ▼
Phase 3: 输出
  │
  ├─► .next/
  │   ├─► server/app/  (242 个 HTML)
  │   ├─► static/       (chunks + images)
  │   └─► standalone/   (Docker 部署用的 server.js + node_modules 子集)
  │
  ▼
完成 → 启动: node .next/standalone/server.js
```

### 12.3 用户访问首页: `GET /`

```
浏览器 → http://localhost:3000/
  │
  ▼
Nginx (生产)
  ├─► location / → proxy_pass http://app:3000
  └─► 安全头 + gzip
  │
  ▼
Next.js Server
  │
  ├─► 匹配路由: src/app/page.tsx
  │
  ▼
React Server Component 渲染
  │
  ├─► 根 layout: src/app/layout.tsx
  │   ├─► <html lang="zh-CN" className="dark">
  │   ├─► 内联 JSON-LD OrganizationSchema
  │   └─► <AnalyticsProvider>{children}</AnalyticsProvider>
  │
  ├─► 首页 page.tsx
  │   └─► <Header /> + <Hero /> + <WhyChooseUs /> + <CoreServices /> + <Footer />
  │
  └─► 渲染完成 → HTML 响应
  │
  ▼
浏览器接收
  │
  ├─► HTML 解析
  ├─► JS 下载 (Next.js chunks)
  ├─► React Hydration
  │   └─► Header 激活 ("use client")
  │       └─► usePathname() → 高亮导航
  │
  └─► AnalyticsProvider 激活
      └─► useEffect: trackPageView("/")
          └─► eventBuffer.push({type:"pageview",pathname:"/"})
              └─► 10s 后 flush
                  └─► navigator.sendBeacon("/api/analytics/track", ...)
                      └─► POST 到 /api/analytics/track
                          └─► 写入 AnalyticsEvent 表
```

### 12.4 用户访问门店详情: `GET /agent/store/{id}`

```
浏览器 → /agent/store/{id}
  │
  ▼
Next.js 匹配: src/app/agent/store/[id]/page.tsx
  │
  ▼
export default async function Page({ params }) {
  const { id } = await params;
  const result = await getStoreById(id);    // src/lib/data.ts
  if (!result) notFound();                  // → 404.tsx
  ...
}
  │
  ▼
getStoreById(id)
  │
  ├─► try: fetch http://localhost:3000/api/stores/{id}?all=true (内部)
  │       │
  │       └─► /api/stores/[id] (GET)
  │           └─► auth() 检查
  │           └─► prisma.store.findUnique({ where: { id } })
  │           └─► 返回 JSON
  │
  └─► catch: 调 getStoreByIdFromStatic(id)   (TS 静态数据)
  │
  ▼
渲染: 面包屑 + H1 + 主图 + 4 缩略图 + 地址/电话/营业时间 + 双 CTA + 关联门店
  │
  └─► Client: trackStoreView(id)   ←── 关键埋点
      └─► storeId 关联事件
```

### 12.5 管理员登录: `POST /api/auth/callback/credentials`

```
管理员浏览器 → /admin/login (输入用户名 + 密码)
  │
  ▼
<form action={signIn("credentials", { username, password, redirectTo: "/admin" })}>
  │
  ▼
NextAuth 客户端 → POST /api/auth/callback/credentials
  │
  ▼
src/app/api/auth/[...nextauth]/route.ts
  │
  ▼
NextAuth({...}) 配置 (src/lib/auth.ts)
  │
  ▼
CredentialsProvider.authorize(credentials)
  │
  ├─► prisma.user.findFirst({
  │     where: {
  │       OR: [{username}, {email}],
  │       status: "active"
  │     }
  │   })
  │
  ├─► bcrypt.compare(plain, user.password)
  │
  └─► return { id, email, name, role } | null
  │
  ▼
jwt 回调: token.role = user.role
  │
  ▼
session 回调: session.user.role = token.role
  │
  ▼
Set-Cookie: next-auth.session-token=JWT
  │
  ▼
浏览器跳转 /admin
  │
  ▼
/admin 路由 → src/app/admin/(dashboard)/layout.tsx
  │
  ├─► const session = await auth()   // 从 cookie 还原 session
  │
  ├─► if (!session?.user) redirect("/admin/login")
  │
  └─► 渲染 <Sidebar userName={session.user.name} /> + <main>{children}</main>
```

### 12.6 管理员创建门店: `POST /api/stores`

```
后台 /admin/stores/new → 提交表单
  │
  ▼
StoreForm.tsx (client, react-hook-form + zod resolver)
  │
  ├─► 客户端 Zod 校验 (StoreCreateSchema)
  │
  └─► fetch("/api/stores", { method: "POST", body: JSON.stringify(data) })
  │
  ▼
src/app/api/stores/route.ts (POST)
  │
  ├─► const session = await auth()
  │
  ├─► if (!session) return 401 未认证
  │
  ├─► if (session.user.role !== "admin") return 403 权限不足
  │
  ├─► 服务端 Zod 二次校验 (StoreCreateSchema.safeParse(body))
  │       └─► 失败 → 400 + details
  │
  └─► prisma.store.create({ data: parsed.data })
      │
      └─► 201 + data
  │
  ▼
StoreForm: router.refresh() + 跳转 /admin/stores
```

### 12.7 客户端埋点上报: `track()` → DB

```
用户操作 → track*(...)  (src/lib/analytics.ts, "use client")
  │
  ▼
eventBuffer.push(event)
  │
  ├─► 缓冲达到 5 条 → flush() 立即触发
  └─► 否则 scheduleFlush() → 10s 后触发
  │
  ▼
flush()  (navigator.sendBeacon 或 fetch keepalive)
  │
  ▼
POST /api/analytics/track
  Body: { events: [{type, pathname, storeId?, metadata?}, ...] }
  │
  ▼
src/app/api/analytics/track/route.ts (POST)
  │
  ├─► 从 headers 提取 userAgent, ip (x-forwarded-for)
  │
  ├─► checkRateLimit(ip): 60 req/min/IP
  │       └─► 超限 → 429
  │
  ├─► 验证 body.events (array, ≤ 50 条)
  │
  ├─► 白名单过滤 (5 种合法 type)
  │
  └─► prisma.analyticsEvent.createMany({ data: records })
  │
  ▼
DB INSERT 完成
  │
  └─► 200 { success: true, count }
```

### 12.8 Docker 一键启动: `docker compose up -d`

```
docker compose up -d
  │
  ▼
[1] 启动 postgres (depends_on: 无)
  │
  └─► postgres:15-alpine
      ├─► POSTGRES_DB=lanhui
      ├─► POSTGRES_USER=lanhui
      ├─► POSTGRES_PASSWORD=lanhui_password
      ├─► 挂载卷 pgdata:/var/lib/postgresql/data
      └─► healthcheck: pg_isready -U lanhui (5s 间隔)
  │
  ▼ (待 postgres healthy)
[2] 启动 app (depends_on: postgres healthy)
  │
  └─► lanhui-website:latest (从 Dockerfile target=runner)
      ├─► ENV DATABASE_URL=postgresql://lanhui:...@postgres:5432/lanhui
      ├─► ENV NEXTAUTH_SECRET=...
      ├─► EXPOSE 3000
      ├─► CMD node server.js
      └─► healthcheck: wget -qO- http://localhost:3000/
  │
  ▼ (待 app 启动)
[3] 启动 nginx (depends_on: app)
  │
  └─► nginx:alpine
      ├─► 挂载 ./nginx.conf
      ├─► 暴露 80 (443 备用)
      └─► healthcheck: wget -qO- http://localhost:80/
  │
  ▼
完成
  │
  ├─► 访问 http://localhost (走 Nginx)
  └─► 直接访问 http://localhost:3000 (走 app)
```

### 12.9 创建管理员: `npx tsx scripts/create-admin.ts`

```
npx tsx scripts/create-admin.ts --username admin2 --email admin2@lanhui.com --password newpass123 --role admin
  │
  ▼
parseArgs(): 解析 --username, --email, --password, --role, --name
  │
  ├─► 必填校验 → 缺一则 process.exit(1) + 使用说明
  ├─► role 校验: 必须是 admin / editor
  └─► password 长度 ≥ 6
  │
  ▼
createPrismaClient(): new PrismaClient({ adapter: new PrismaPg({ url: DATABASE_URL }) })
  │
  ▼
prisma.user.findFirst({ where: { OR: [{username}, {email}] } })
  │
  ├─► 已存在 → process.exit(1) + 错误信息
  │
  └─► 不存在 → bcrypt.hash(password, 10)
  │
  ▼
prisma.user.create({
  data: { username, email, password: hashed, name, role, status: "active" }
})
  │
  └─► console.log: ID / 用户名 / 邮箱 / 显示名 / 角色 / 状态
```

### 12.10 sitemap.xml 生成: `GET /sitemap.xml`

```
Next.js: GET /sitemap.xml → src/app/sitemap.ts
  │
  ▼
export default async function sitemap(): Promise<MetadataRoute.Sitemap>
  │
  ├─► staticRoutes: 8 个 (首页/产品/门店/品牌/资讯/联系)
  │
  ├─► productRoutes: getAllProductSlugs() → 6 个产品详情
  │
  ├─► provinceRoutes: getAllProvinceSlugs() → 省数
  │   └─► try API → catch fallback (data.ts)
  │
  ├─► cityRoutes: 遍历省 × getAllCitySlugs(省) → 市数
  │
  ├─► storeRoutes: getAllStoreIds() → 店数
  │
  ├─► newsRoutes: getAllArticleSlugs() → 文章数
  │
  └─► 合并: [...static, ...product, ...province, ...city, ...store, ...news]
      │
      └─► 25+ URL 输出
```

---

## 13. 质量门禁

| 命令 | 状态 | 用途 |
|------|------|------|
| `npm run lint` | ✅ 0 error | ESLint (next preset) |
| `npm run typecheck` | ✅ 0 error | `tsc --noEmit` strict |
| `npm run build` | ✅ | Next.js 构建 + SSG |
| `npm run check` | ✅ | lint + typecheck + build (CI 用) |
| `npm run dev` | ✅ | 开发服务器 (HMR) |
| `npx prisma migrate dev` | — | 迁移 + 生成 client |
| `npx prisma generate` | — | 重新生成 client |
| `npx prisma db seed` | — | 种子数据 (prisma/seed.ts) |
| `npx tsx scripts/create-admin.ts` | — | 创建管理员/编辑 |

---

## 14. 环境变量

`.env` (本地) / `.env.example` (模板) / docker-compose.yml (生产):

```bash
DATABASE_URL=postgresql://lanhui:password@localhost:5432/lanhui   # 必填
NEXTAUTH_URL=http://localhost:3000                                  # NextAuth
NEXTAUTH_SECRET=your-secret-here-change-in-production              # 32+ 字符
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000                     # 客户端 API
ALIYUN_ACCESS_KEY_ID=                                                # 阿里云 OSS
ALIYUN_ACCESS_KEY_SECRET=
ALIYUN_OSS_ENDPOINT=oss-cn-shanghai.aliyuncs.com
ALIYUN_OSS_BUCKET=lanhui-website-prod
```

---

## 15. 常用文件位置速查

| 想改什么 | 去看哪个文件 |
|---------|-------------|
| 站点 metadata / OG | `src/app/layout.tsx` |
| 品牌名 / 标语 / 备案 | `src/lib/brand.ts` |
| 6 个产品文案 | `src/lib/products.ts` |
| 门店数据 (静态) | `src/lib/store.ts` |
| 门店数据 (DB) | `src/app/api/stores/**` |
| 品牌资讯 | `src/lib/news.ts` |
| 资质证书 | `src/lib/certifications.ts` |
| 品牌历程 | `src/lib/history.ts` |
| Header + 下拉 | `src/components/Header.tsx` |
| Footer + 备案 | `src/components/Footer.tsx` |
| 首页 4 段 | `src/app/page.tsx` |
| 6 个产品详情 | `src/components/ProductDetail.tsx` |
| 门店 4 层路由 | `src/app/agent/**/page.tsx` |
| 后台登录 | `src/app/admin/login/page.tsx` |
| 后台 layout + auth 守卫 | `src/app/admin/(dashboard)/layout.tsx` |
| 仪表盘统计 | `src/app/admin/(dashboard)/page.tsx` |
| 后台侧边栏 | `src/components/admin/Sidebar.tsx` |
| 后台门店表单 | `src/components/admin/StoreForm.tsx` |
| 客户端埋点 SDK | `src/lib/analytics.ts` |
| 自动 pageview 追踪 | `src/components/AnalyticsProvider.tsx` |
| 认证配置 | `src/lib/auth.ts` |
| Prisma 客户端 | `src/lib/prisma.ts` |
| 数据模型 | `prisma/schema.prisma` |
| 路由数据聚合 (API+fallback) | `src/lib/data.ts` |
| Zod 校验 | `src/lib/validations/{store,article}.ts` |
| sitemap | `src/app/sitemap.ts` |
| robots | `src/app/robots.ts` |
| JSON-LD Schema | `src/lib/schema.ts` |
| 全站样式 | `src/app/globals.css` |
| Next.js 配置 | `next.config.ts` |
| Docker 镜像 | `Dockerfile` + `Dockerfile.dev` |
| 容器编排 | `docker-compose.yml` |
| 反向代理 | `nginx.conf` |

---

## 16. 维护者 Checklist

### 新增路由时
- [ ] 是否在 `Header.tsx` 的 `NAV_ITEMS`?
- [ ] 是否在 `Footer.tsx` 的 `QUICK_LINKS`?
- [ ] 是否有 `metadata` (title + description)?
- [ ] 是否加入 `sitemap.ts` 的路由?
- [ ] 是否经过 `npm run check`?

### 新增数据库字段时
- [ ] 改 `prisma/schema.prisma`
- [ ] `npx prisma migrate dev --name <name>`
- [ ] 同步更新 `src/lib/validations/*.ts` (Zod)
- [ ] 同步更新 API route 的 Zod 校验
- [ ] 重新 `npm run build`

### 新增 API 时
- [ ] 是否做 `auth()` 校验?
- [ ] 是否做角色校验 (`admin` / `editor`)?
- [ ] 是否用 Zod 校验 body?
- [ ] 错误处理是否统一 (500 + 日志)?
- [ ] 列表接口是否分页 (`page`, `limit`)?
- [ ] 是否考虑 `?all=true` 软删除可见性?

### 部署前
- [ ] `.env` 中 `NEXTAUTH_SECRET` 是否 ≥ 32 字符?
- [ ] `DATABASE_URL` 是否指向生产 postgres?
- [ ] 是否 `npm run check` 通过?
- [ ] docker-compose 健康检查是否正常?
- [ ] Nginx 配置是否启用安全头?

---

## 17. 术语表

| 术语 | 含义 |
|------|------|
| **SSG** | Static Site Generation, 构建时生成 HTML |
| **SS** | Static, 不依赖 params 的静态页 |
| **SSR** | Server-Side Render, 每次请求渲染 (这里指 `force-dynamic` 模式) |
| **RSC** | React Server Component (Next.js App Router 默认) |
| **PPF** | Paint Protection Film, 漆面保护膜 (隐形车衣) |
| **TPU** | Thermoplastic Polyurethane, PPF 原料 |
| **SSG params** | `generateStaticParams()` 在 build 时枚举动态参数 |
| **ICP** | 互联网内容提供商 (中国网站备案) |
| **CUID** | Collision-resistant Unique ID, Prisma 默认主键 |
| **adapter-pg** | Prisma 7+ 的 PostgreSQL 适配器,直连 `pg` 驱动 |
| **CMS** | Content Management System, 这里指 `/admin/*` 管理后台 |
| **JWT session** | NextAuth v5 默认会话策略,无 DB session 表 |
| **sendBeacon** | 浏览器 API,异步 POST 不阻塞页面卸载 |
| **flush** | 客户端埋点缓冲 → 批量上报的触发动作 |
| **Standalone output** | Next.js 构建模式,产出最小化 `server.js` + 必要 node_modules |
| **route group** | `(folder)` 目录,不参与 URL,仅用于共享 layout/loader |
| **dynamic = "force-dynamic"** | 显式声明该路由每次请求重新渲染,禁用 SSG 缓存 |

---

## 18. 与源项目 (膜小二复刻) 的差异

| 维度 | 当前 (蓝辉轻改) | 源项目 (膜小二) |
|------|----------------|----------------|
| 性质 | 全新品牌官网 | 像素级复刻 |
| 数据来源 | Prisma + PostgreSQL (动态) | 静态 TS 文件 |
| 路由数 | 11 用户 + 4 后台 + 6 API | 13 用户 |
| 预渲染页 | 25+ (可扩展) | 242 |
| 产品方向 | 6 (含 3 轻改) | 3 (仅膜系) |
| 后台 CMS | ✅ 完整 (auth + CRUD + 统计) | ❌ |
| 客户端埋点 | ✅ (5 事件类型 + 缓冲 + 限流) | ❌ |
| 认证 | ✅ NextAuth v5 + JWT | ❌ |
| 部署 | Docker + Nginx + Postgres | Vercel |
| SEO | metadata + OG + sitemap + robots + JSON-LD | metadata only |
| 真实门店 | 1 (顺德大良) | 150+ |

---

**最后更新**: 2026-06-09 · **维护者**: Claude · **对应 Git commit**: `0c69628`
