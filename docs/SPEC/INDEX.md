# SPEC 索引 & 实现状态看板

> PRD → SPEC → Status 三层体系。
> PRD 定义需求（要做什么），SPEC 定义合约（怎么做/长什么样），Status 跟踪进度（做到哪了）。

---

## 目录

- [体系说明](#体系说明)
- [全局状态总览](#全局状态总览)
- [一、公开站（Public Site）](#一公开站public-site)
- [二、管理后台（Admin）](#二管理后台admin)
- [三、API](#三api)
- [四、公共组件](#四公共组件)
- [五、数据模型](#五数据模型)

---

## 体系说明

### SPEC 文档结构

```
docs/SPEC/
├── INDEX.md              # ← 你现在在这里：索引 + 状态看板
├── _TEMPLATE.md          # SPEC 模板
├── data-model.md              # 全局数据模型参考
├── public-site/               # 公开站各模块 SPEC
│   ├── home.md
│   ├── brand.md
│   ├── product-center.md
│   ├── product-topics.md
│   ├── product-film.md
│   ├── product-accessories.md
│   ├── news.md
│   ├── agent-store.md
│   └── contact.md
├── admin/                # 管理后台各模块 SPEC
│   ├── login.md
│   ├── dashboard.md
│   ├── stores.md
│   ├── articles.md
│   └── analytics.md
├── api/                  # API 各模块 SPEC
│   ├── auth.md
│   ├── stores.md
│   ├── articles.md
│   ├── regions.md
│   ├── upload.md
│   └── analytics.md
└── components/           # 公共组件 SPEC
    ├── ui.md
    ├── shared.md
    └── topic-pattern.md
```

### 状态图例

| 标记 | 含义 |
|------|------|
| ✅ **完成** | 功能完整实现，无已知阻塞性问题 |
| 🔧 **部分完成** | 核心功能可用，但存在已知缺失或待优化项 |
| ⬜ **未开始** | 有 PRD 但尚未实现 |
| ❌ **有问题** | 已实现但存在需要修复的 bug |
| 📄 **有 PRD** | 该模块有对应的 PRD 文档 |
| 📄 **有 SPEC** | 该模块有 SPEC 文档 |

---

## 全局状态总览

| 区域 | 模块数 | ✅ 完成 | 🔧 部分 | ⬜ 未开始 | ❌ 有问题 |
|------|--------|---------|---------|-----------|----------|
| 公开站 | 9 | 2 | 6 | 0 | 1 |
| 管理后台 | 5 | 1 | 4 | 0 | 0 |
| API | 6 | 3 | 3 | 0 | 0 |
| 公共组件 | 3 | 3 | 0 | 0 | 0 |
| 数据模型 | 1 | 0 | 1 | 0 | 0 |
| **合计** | **24** | **9** | **14** | **0** | **1** |

---

## 一、公开站（Public Site）

### 1.1 首页 Homepage

| 项目 | 内容 |
|------|------|
| **路由** | `/` |
| **PRD** | 📄 `docs/PRD/public-site/HOMEPAGE_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/public-site/home.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | Hero, Header, CoreServices, ProductsQuickEntry, WhyChooseUs, Footer |
| **备注** | Hero 含企业微信弹窗 CTA。全站布局在 root layout.tsx。22 日规划提出首页重新设计方向（车型入口+信任闭环）。 |

### 1.2 品牌中心 Brand Center

| 项目 | 内容 |
|------|------|
| **路由** | `/brand`, `/brand/certifications`, `/brand/history` |
| **PRD** | 📄 `docs/PRD/public-site/BRAND_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/public-site/brand.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | CertCard, HistoryPage |
| **备注** | 证书图未 lazy load 导致 LCP 6.0s（P1-2）。品牌故事页有待补充。22 日规划提出品牌战略聚焦+六项能力证据体系。 |

### 1.3 产品中心 Product Center

| 项目 | 内容 |
|------|------|
| **路由** | `/product` |
| **PRD** | 📄 `docs/PRD/public-site/PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md` |
| **SPEC** | `docs/SPEC/public-site/product-center.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | ProductCenter, FlooringTopicBanner, WenjieTopicBanner, XiaomiTopicBanner, ZeekrTopicBanner |
| **备注** | LCP 6.5s（P1-5），4 大主题图未设 priority。地板横幅含中文路径。 |

### 1.4 产品专题 Product Topics

| 项目 | 内容 |
|------|------|
| **路由** | `/product/wenjie`, `/product/xiaomi`, `/product/zeekr`, `/product/flooring` |
| **PRD** | 📄 `docs/PRD/product/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md`, `XIAOMI_...`, `ZEEKR_...`, `FLOORING_...` |
| **SPEC** | `docs/SPEC/public-site/product-topics.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | `*/{AnchorNav,ProductCard,ProductGrid,ProductTable,TopicBanner}` |
| **备注** | Wenjie 全部 pending（P1-4，44 款图未补）。Zeekr 为 canonical 示例（21/23 matched）。Flooring perf 59/61 最差（P1-1）。 |

### 1.5 膜类产品 Product Film

| 项目 | 内容 |
|------|------|
| **路由** | `/product/window-film`, `/product/window-film/[packageSlug]`, `/product/ppf`, `/product/color-film` |
| **PRD** | 📄 `docs/PRD/public-site/FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md` |
| **SPEC** | `docs/SPEC/public-site/product-film.md` |
| **状态** | ✅ **完成** |
| **关键组件** | ProductDetail, FilmPageHero, SpecsTable, StarRating, ServiceProcessSection, WindowFilmPackageCard/Detail, WindowFilmGuide/ParameterExplainer/ScenarioGrid |
| **备注** | 窗膜 7 套餐+导购+参数解释，PPF/改色膜共用 ProductDetail 布局。 |

### 1.6 配件类产品 Product Accessories

| 项目 | 内容 |
|------|------|
| **路由** | `/product/wheels`, `/product/chassis`, `/product/electric-steps` |
| **PRD** | `docs/PRD/public-site/VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md` |
| **SPEC** | `docs/SPEC/public-site/product-accessories.md` |
| **状态** | ✅ **完成** |
| **关键组件** | ProductDetail（复用膜类布局） |
| **备注** | 三个配件页复用 ProductDetail 组件，靠 slug 条件分支渲染不同内容。 |

### 1.7 资讯中心 News

| 项目 | 内容 |
|------|------|
| **路由** | `/news`, `/news/[slug]` |
| **PRD** | 📄 `docs/PRD/public-site/NEWS_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/public-site/news.md` |
| **状态** | ❌ **有问题** |
| **关键组件** | ArticleContent, ArticleEditor |
| **备注** | `/news/[slug]` 引用 `item.content` 但 `NewsItem` 类型无此字段（pre-existing bug）。DB 8 条已发布文章详情页全不可达（P0-7）。22 日规划提出 5 分类内容中心+阅读优先排版。 |

### 1.8 门店网络 Agent/Store

| 项目 | 内容 |
|------|------|
| **路由** | `/agent`, `/agent/[slug]`, `/agent/[slug]/[city]`, `/agent/store/[id]` |
| **PRD** | 📄 `docs/PRD/public-site/AGENT_PUBLIC_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/public-site/agent-store.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | StoreCard, StoreLevelBadge, sortStoresByLevel, StoreForm |
| **备注** | 22 测试门店数据污染（P0-6），公开站展示含草稿。perf 64/75（P1-3，27+ 卡片慢）。21 日规划提出等级筛选+排序+移动端 Sheet。 |

### 1.9 联系页面 Contact

| 项目 | 内容 |
|------|------|
| **路由** | `/contact` |
| **PRD** | 📄 `docs/PRD/public-site/CONTACT_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/public-site/contact.md` |
| **状态** | 🔧 **部分完成** |
| **备注** | 路由存在，但为静态占位页，功能待完善。22 日规划提出全站统一咨询弹窗+渠道选择引擎。 |

---

## 二、管理后台（Admin）

### 2.1 登录 Login

| 项目 | 内容 |
|------|------|
| **路由** | `/admin/login` |
| **PRD** | 📄 `docs/PRD/admin/README.md` |
| **SPEC** | `docs/SPEC/admin/login.md` |
| **状态** | ✅ **完成** |
| **关键组件** | AdminLoginPage |
| **备注** | Client Component，Credentials 登录。layout 两层：admin/layout.tsx（pass-through）+ (dashboard)/layout.tsx（auth 守卫）。 |

### 2.2 仪表盘 Dashboard

| 项目 | 内容 |
|------|------|
| **路由** | `/admin` |
| **PRD** | 📄 `docs/PRD/admin/README.md` |
| **SPEC** | `docs/SPEC/admin/dashboard.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | DashboardKpiCards, DashboardContentHealth, DashboardQuickActions, DashboardRecentActivity, DashboardStoreNetwork, DashboardTrendChart |
| **备注** | force-dynamic。缺少 loading/error 边界。热门门店 Top 10 为空（P1-13，store_view 埋点缺失）。所有作者="系统管理员"。 |

### 2.3 门店管理 Stores

| 项目 | 内容 |
|------|------|
| **路由** | `/admin/stores`, `/admin/stores/new`, `/admin/stores/[id]`, `/admin/stores/[id]/image` |
| **PRD** | 📄 `docs/PRD/admin/STORE_MANAGEMENT_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/admin/stores.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | StoreForm, RegionSelector, EntityImageUploader, Sidebar |
| **备注** | TanStack Table + 筛选/分组/搜索/分页。等级筛选+分组+Badge。图片上传（本地存储 webp q80）。canonical PRD 定义 4 状态机+迁移方案。 |

### 2.4 文章管理 Articles

| 项目 | 内容 |
|------|------|
| **路由** | `/admin/articles`, `/admin/articles/new`, `/admin/articles/[id]` |
| **PRD** | 📄 `docs/PRD/admin/ARTICLE_MANAGEMENT_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/admin/articles.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | ArticleEditor |
| **备注** | Markdown 编辑器+预览分屏。缺少 `/news/[slug]` 消费端的 content 字段兼容（见 1.7）。canonical PRD 定义 4 状态机（含 withdrawn）+极简发布原则。 |

### 2.5 行为分析 Analytics

| 项目 | 内容 |
|------|------|
| **路由** | `/admin/analytics` |
| **PRD** | 📄 `docs/PRD/admin/ANALYTICS_SYSTEM_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/admin/analytics.md` |
| **状态** | 🔧 **部分完成** |
| **关键组件** | 分析页面（内联 Recharts） |
| **备注** | force-dynamic。当前统计总事件（非仅 page_view），缺独立语义事件（product_view/topic_view/article_view）。无咨询渠道分布和数据健康模块。store_view 埋点缺失（P1-13）。 |

---

## 三、API

### 3.1 认证 Auth

| 项目 | 内容 |
|------|------|
| **路由** | `POST /api/auth/[...nextauth]` |
| **PRD** | `docs/PRD/api/` |
| **SPEC** | `docs/SPEC/api/auth.md` |
| **状态** | ✅ **完成** |
| **备注** | NextAuth v5 beta + Credentials + JWT。无 DB session。角色 admin/editor。JWT 含 stale token 迁移。 |

### 3.2 门店 API

| 项目 | 内容 |
|------|------|
| **路由** | `GET/POST /api/stores`, `GET/PUT/DELETE/PATCH /api/stores/[id]` |
| **PRD** | `docs/PRD/api/` |
| **SPEC** | `docs/SPEC/api/stores.md` |
| **状态** | ✅ **完成** |
| **备注** | Zod 校验 + slug 自动生成 + 省市 DB 覆盖。Prisma 7 Driver Adapter 错误形态（P2022）。 |

### 3.3 文章 API

| 项目 | 内容 |
|------|------|
| **路由** | `GET/POST /api/articles`, `GET/PUT/DELETE /api/articles/[id]`, `GET /api/articles/categories` |
| **PRD** | `docs/PRD/api/` |
| **SPEC** | `docs/SPEC/api/articles.md` |
| **状态** | 🔧 **部分完成** |
| **备注** | 公开只返回 published。slug 自动生成唯一性。categories 从 DB 实际数据聚合。 |

### 3.4 地理区域 API

| 项目 | 内容 |
|------|------|
| **路由** | `GET /api/provinces`, `GET /api/cities`, `GET /api/regions` |
| **PRD** | `docs/PRD/api/` |
| **SPEC** | `docs/SPEC/api/regions.md` |
| **状态** | ✅ **完成** |
| **备注** | 省市树结构，含门店计数。支持 `?province=slug` 过滤。 |

### 3.5 文件上传 API

| 项目 | 内容 |
|------|------|
| **路由** | `POST/DELETE /api/upload` |
| **PRD** | 📄 `docs/PRD/admin/STORE_MANAGEMENT_PRD.md`（canonical） |
| **SPEC** | `docs/SPEC/api/upload.md` |
| **状态** | 🔧 **部分完成** |
| **备注** | 本地存储（非 OSS），sharp 转 webp q80。当前只支持 entity=store。 |

### 3.6 埋点分析 API

| 项目 | 内容 |
|------|------|
| **路由** | `POST /api/analytics/track`, `GET /api/analytics/stats` |
| **PRD** | `docs/PRD/api/` |
| **SPEC** | `docs/SPEC/api/analytics.md` |
| **状态** | 🔧 **部分完成** |
| **备注** | track 限流 60/min/IP，type 白名单。stats 支持日期范围+分组。埋点严重失衡：695 PV vs ~5 click（P1-12）。 |

---

## 四、公共组件

### 4.1 基础 UI 组件

| 项目 | 内容 |
|------|------|
| **文件** | `src/components/ui/{badge,button,card,carousel,table}.tsx` |
| **SPEC** | `docs/SPEC/components/ui.md` |
| **状态** | ✅ **完成** |
| **备注** | shadcn/ui Base UI 实现。badge 5 variant，button 用 CVA，card 7 子组件，carousel 基于 Embla。 |

### 4.2 跨页共享组件

| 项目 | 内容 |
|------|------|
| **文件** | Header, Footer, Logo, OptimizedImage, WeChatConsultModal, AnalyticsProvider, PhoneCta, ProductGalleryCarousel |
| **SPEC** | `docs/SPEC/components/shared.md` |
| **状态** | ✅ **完成** |
| **备注** | Header 粘性+滚动收缩+移动端滑面板。WeChat 弹窗用 emitter 模式。Analytics 自动 pageview。 |

### 4.3 专题页面组件模式

| 项目 | 内容 |
|------|------|
| **文件** | `src/components/{wenjie,xiaomi,zeekr}/*`, `src/components/product/*`, `src/components/window-film/*` |
| **SPEC** | `docs/SPEC/components/topic-pattern.md` |
| **状态** | ✅ **完成** |
| **备注** | 5 组件模式：AnchorNav / ProductCard(3态) / ProductGrid / ProductTable / TopicBanner。4:3 图片容器。 |

---

## 五、数据模型

### 5.1 全局数据模型

| 项目 | 内容 |
|------|------|
| **文件** | `docs/SPEC/data-model.md` |
| **状态** | 🔧 **部分完成** |
| **备注** | 涵盖 7 个 Prisma 表、6 个静态数据类型、API 响应格式、2 个状态机。需跟踪 schema 变更保持同步。 |

---

## 附录：A. 已知问题汇总

| ID | 模块 | 问题 | 优先级 | 来源 |
|----|------|------|--------|------|
| P0-1 | 公开站 | 5 路由 404（news/[slug] + collect-routes bug） | P0 | 审计 2026-06-19 |
| P0-6 | 公开站-门店 | 22 条测试店污染，公开站展示草稿 | P0 | 审计 2026-06-19 |
| P0-7 | 公开站-资讯 | news/[slug] 404，NewsItem 缺 content 字段 | P0 | 审计 2026-06-19 |
| P1-1 | 公开站-地板 | perf 59/61，LCP 6.6s | P1 | 审计 2026-06-19 |
| P1-2 | 公开站-品牌 | perf 63/77，证书图未 lazy | P1 | 审计 2026-06-19 |
| P1-3 | 公开站-门店列表 | perf 64/75，27+ 卡片慢 | P1 | 审计 2026-06-19 |
| P1-4 | 公开站-问界 | 44 款图全 pending | P1 | 审计 2026-06-19 |
| P1-5 | 公开站-产品中心 | LCP 6.5s，大图未 priority | P1 | 审计 2026-06-19 |
| P1-12 | 全站 | 埋点失衡 695 PV vs ~5 click | P1 | 审计 2026-06-19 |
| P1-13 | Admin | 热门门店 Top 10 空 | P1 | 审计 2026-06-19 |
| - | Admin | 所有作者="系统管理员" | P2 | 审计 2026-06-19 |
| - | 全站 | 缺 loading/error/not-found 边界 | P2 | 审计 2026-06-19 |

## 附录：B. PRD 文档索引

| PRD | 路径 | 模块 |
|-----|------|------|
| HOMEPAGE_PRD | `docs/PRD/public-site/HOMEPAGE_PRD.md` | 首页（canonical） |
| BRAND_PRD | `docs/PRD/public-site/BRAND_PRD.md` | 品牌中心（canonical） |
| NEWS_PRD | `docs/PRD/public-site/NEWS_PRD.md` | 资讯中心（canonical） |
| AGENT_PUBLIC_PRD | `docs/PRD/public-site/AGENT_PUBLIC_PRD.md` | 门店网络（canonical） |
| CONTACT_PRD | `docs/PRD/public-site/CONTACT_PRD.md` | 联系页面（canonical） |
| PRODUCT_PAGE_SYSTEM_PRD | `docs/PRD/public-site/PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md` | 产品中心 |
| VEHICLE_PROJECT_PAGE_PRD | `docs/PRD/public-site/VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md` | 配件产品 |
| FILM_PRODUCT_EXPERIENCE_PRD | `docs/PRD/public-site/FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md` | 膜类产品 |
| CONSULTATION_CHANNEL_SYSTEM_PRD | `docs/PRD/public-site/CONSULTATION_CHANNEL_SYSTEM_PRD_2026-06-22.md` | 咨询承接（规划） |
| BRAND_VEHICLE_PAGES_PRD | `docs/PRD/public-site/BRAND_VEHICLE_PAGES_PRD_2026-06-22.md` | 品牌车型页（规划） |
| DETAILING_SERVICE_PAGE_PRD | `docs/PRD/public-site/DETAILING_SERVICE_PAGE_PRD_2026-06-22.md` | 精洗服务页（规划） |
| FOOTER_SOCIAL_LINKS_PRD | `docs/PRD/public-site/FOOTER_SOCIAL_LINKS_PRD_2026-06-22.md` | Footer 社交媒体（规划） |
| FOOTER_SYSTEM_PRD | `docs/PRD/public-site/FOOTER_SYSTEM_PRD_2026-06-22.md` | Footer 系统（规划） |
| FRONTEND_PAGE_SYSTEM_PRD | `docs/PRD/public-site/FRONTEND_PAGE_SYSTEM_PRD_2026-06-22.md` | 前端页面体系（规划） |
| LIGHT_MOD_PROJECT_PAGES_PRD | `docs/PRD/public-site/LIGHT_MOD_PROJECT_PAGES_PRD_2026-06-22.md` | 轻改项目页（规划） |
| PRODUCT_INFORMATION_ARCHITECTURE_PRD | `docs/PRD/public-site/PRODUCT_INFORMATION_ARCHITECTURE_PRD_2026-06-22.md` | 产品信息架构（规划） |
| PUBLIC_SITE_SYSTEM_PRD | `docs/PRD/public-site/PUBLIC_SITE_SYSTEM_PRD_2026-06-21.md` | 公开站体系（规划） |
| STORE_NETWORK_PRD | `docs/PRD/public-site/STORE_NETWORK_PRD_2026-06-21.md` | 门店网络体系（规划） |
| WENJIE_MODIFICATION_TOPIC_PRD | `docs/PRD/product/WENJIE_MODIFICATION_TOPIC_PRD_2026-06-13.md` | 问界专题 |
| XIAOMI_MODIFICATION_TOPIC_PRD | `docs/PRD/product/XIAOMI_MODIFICATION_TOPIC_PRD_2026-06-12.md` | 小米专题 |
| ZEEKR_MODIFICATION_TOPIC_PRD | `docs/PRD/product/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-16.md` | 极氪专题 |
| FLOORING_MODIFICATION_CATEGORY_PRD | `docs/PRD/product/FLOORING_MODIFICATION_CATEGORY_PRD_2026-06-13.md` | 地板专题 |
| STORE_MANAGEMENT_PRD | `docs/PRD/admin/STORE_MANAGEMENT_PRD.md` | 后台-门店（canonical） |
| ARTICLE_MANAGEMENT_PRD | `docs/PRD/admin/ARTICLE_MANAGEMENT_PRD.md` | 后台-文章（canonical） |
| ANALYTICS_SYSTEM_PRD | `docs/PRD/admin/ANALYTICS_SYSTEM_PRD.md` | 后台-分析（canonical） |
| CONSULTATION_CHANNEL_ADMIN_PRD | `docs/PRD/admin/CONSULTATION_CHANNEL_ADMIN_PRD_2026-06-22.md` | 后台-咨询渠道（规划） |
| CONSULTATION_CHANNEL_ROUTES_PRD | `docs/PRD/api/CONSULTATION_CHANNEL_ROUTES_PRD_2026-06-22.md` | 咨询渠道 API（规划） |
| CONSULTATION_CHANNEL_SCHEMA_PRD | `docs/PRD/database/CONSULTATION_CHANNEL_SCHEMA_PRD_2026-06-22.md` | 咨询渠道 DB（规划） |
| DESIGN_SYSTEM_ALIGNMENT_PRD | `docs/PRD/cross-cutting/DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md` | 设计系统 |
| AUDIT_AND_REGRESSION_PRD | `docs/PRD/cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md` | 审计回归 |
| PERFORMANCE_OPTIMIZATION_PRD | `docs/PRD/cross-cutting/PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md` | 性能优化 |
| SECURITY_AUDIT_PRD | `docs/PRD/cross-cutting/SECURITY_AUDIT_PRD_2026-06-20.md` | 安全审计 |
| ADR_PRD | `docs/PRD/cross-cutting/ADR_PRD_2026-06-20.md` | 架构决策 |
| DEPLOYMENT_RUNBOOK_PRD | `docs/PRD/cross-cutting/DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md` | 部署手册 |

---

> 最后更新: 2026-06-23
> 维护: 每次上线/发版后更新本看板的实现状态
