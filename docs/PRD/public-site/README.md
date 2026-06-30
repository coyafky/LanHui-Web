# 公开站 PRD

> 公开面向 C 端用户的页面（车主 / 潜客 / 轻改爱好者）。SSG 优先，ISR 增量，无认证。

## Canonical PRD（合并后）

2026-06-20 实现版与 2026-06-21/22 规划版已合并为单份 canonical PRD。旧版本存档于 `archive/`。

### 合并后的 Canonical PRD

| Canonical PRD | 覆盖路由 | 版本 | 说明 |
|---|---|---|---|
| [`HOMEPAGE_PRD.md`](./HOMEPAGE_PRD.md) | `/` | v1 | 首页 Landing Page + 未来改进方向 |
| [`BRAND_PRD.md`](./BRAND_PRD.md) | `/brand`、`/brand/certifications`、`/brand/history` | v1 | 品牌战略聚焦 + 六项能力 + 资质 + 历程 |
| [`NEWS_PRD.md`](./NEWS_PRD.md) | `/news`、`/news/[slug]` | v1 | 内容中心 + 5 分类 + P0-7 修复 |
| [`AGENT_PUBLIC_PRD.md`](./AGENT_PUBLIC_PRD.md) | `/agent`、`/agent/[province]`、`/agent/[province]/[city]`、`/agent/store/[id]` | v1 | 门店网络 + 等级筛选体系 + P0-1 修复 |
| [`CONTACT_PRD.md`](./CONTACT_PRD.md) | `/contact` + 全站咨询入口 | v1 | 咨询承接 + 统一弹窗 |

### 新增独立 PRD（无旧版，无需合并）

| PRD | 说明 | 版本 |
|---|---|---|
| [`PAGE_PRD_SYSTEM_2026-06-29.md`](./PAGE_PRD_SYSTEM_2026-06-29.md) | 页面级 PRD 总览，统一首页、产品中心、服务线、品牌/车型、门店、资讯、联系、admin 的表达和验收口径 | v1 |
| [`PUBLIC_SITE_SYSTEM_PRD_2026-06-21.md`](./PUBLIC_SITE_SYSTEM_PRD_2026-06-21.md) | 公开站总 PRD，定义克制营销原则 | v0 |
| [`FRONTEND_PAGE_SYSTEM_PRD_2026-06-22.md`](./FRONTEND_PAGE_SYSTEM_PRD_2026-06-22.md) | 新版前端页面系统 PRD | v0.1 |
| [`PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md`](./PRODUCT_PAGE_SYSTEM_PRD_2026-06-22.md) | 产品中心与产品详情的统一模式 | v0.1 |
| [`VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md`](./VEHICLE_PROJECT_PAGE_PRD_2026-06-22.md) | 车型项目、专题和产品组合展示模式 | v0.1 |
| [`PRODUCT_INFORMATION_ARCHITECTURE_PRD_2026-06-22.md`](./PRODUCT_INFORMATION_ARCHITECTURE_PRD_2026-06-22.md) | 四品牌、四类轻改、洗美和三类膜系的产品信息架构 | v0.1 |
| [`BRAND_VEHICLE_PAGES_PRD_2026-06-22.md`](./BRAND_VEHICLE_PAGES_PRD_2026-06-22.md) | 极氪、小米、问界、理想每个页面的具体模块和内容 | v0.1 |
| [`LIGHT_MOD_PROJECT_PAGES_PRD_2026-06-22.md`](./LIGHT_MOD_PROJECT_PAGES_PRD_2026-06-22.md) | 电动踏板、轮毂、底盘护板、内饰改装页面 | v0.1 |
| [`FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md`](./FILM_PRODUCT_EXPERIENCE_PRD_2026-06-22.md) | 窗膜、改色膜和隐形车衣如何组织展示 | v0.1 |
| [`DETAILING_SERVICE_PAGE_PRD_2026-06-22.md`](./DETAILING_SERVICE_PAGE_PRD_2026-06-22.md) | 洗车、美容、漆面、内饰和膜面养护服务页 | v0.1 |
| [`FOOTER_SOCIAL_LINKS_PRD_2026-06-22.md`](./FOOTER_SOCIAL_LINKS_PRD_2026-06-22.md) | Footer 小红书、抖音、视频号官方入口 | v0.1 |
| [`FOOTER_SYSTEM_PRD_2026-06-22.md`](./FOOTER_SYSTEM_PRD_2026-06-22.md) | 全站 Footer 完整规格 | v0.1 |
| [`CONSULTATION_CHANNEL_SYSTEM_PRD_2026-06-22.md`](./CONSULTATION_CHANNEL_SYSTEM_PRD_2026-06-22.md) | 微信、企业微信、电话的全站咨询承接 | v0.1 |
| [`STORE_NETWORK_PRD_2026-06-21.md`](./STORE_NETWORK_PRD_2026-06-21.md) | 门店网络子 PRD（已合并到 canonical） | v0.2（待归档） |

## 范围

| 路由 | Canonical PRD | 状态 |
|---|---|---|
| `/` | [`HOMEPAGE_PRD.md`](./HOMEPAGE_PRD.md) | 🟢 v1 实现 / 🟡 v0.1 规划 |
| `/brand` 系列 | [`BRAND_PRD.md`](./BRAND_PRD.md) | 🟢 v1 实现 / 🟡 v0.1 规划 |
| `/news` 系列 | [`NEWS_PRD.md`](./NEWS_PRD.md) | 🟢 v1 实现（P0-7 待修）/ 🟡 v0.1 规划 |
| `/agent` 系列 | [`AGENT_PUBLIC_PRD.md`](./AGENT_PUBLIC_PRD.md) | 🟢 v1 实现 / 🟡 v0.2 规划 |
| `/contact` | [`CONTACT_PRD.md`](./CONTACT_PRD.md) | 🟢 v1 实现 / 🟡 v0.1 规划 |

## 完成度

**5 份 Canonical PRD + 13 份独立 PRD，18 份总 PRD 覆盖全部公开站路由。**

## 命名规范

Canonical PRD（无日期后缀，持续更新）：
- `HOMEPAGE_PRD.md`
- `BRAND_PRD.md`
- `NEWS_PRD.md`
- `AGENT_PUBLIC_PRD.md`
- `CONTACT_PRD.md`

新增规划 PRD（单版本，保留日期）：
- `<FEATURE>_PRD_2026-06-22.md`

## 核心原则

1. **SSG 优先** — 静态内容走 `generateStaticParams` + ISR
2. **可访问性** — 语义化 HTML + 键盘导航 + ARIA
3. **SEO** — 独立 meta + JSON-LD（Article / Organization / LocalBusiness）
4. **响应式** — mobile-first，三视口测试
5. **埋点** — 关键 CTA / 转化路径有 `track()` 调用

## 归档（`archive/`）

| 文件 | 说明 |
|---|---|
| `HOMEPAGE_PRD_2026-06-20.md` | 首页 v1 实现版（已合并到 canonical） |
| `LANDING_PAGE_PRD_2026-06-22.md` | 首页 v0.1 规划版（已合并到 canonical） |
| `BRAND_PRD_2026-06-20.md` | 品牌 v1 实现版（已合并到 canonical） |
| `BRAND_CENTER_PRD_2026-06-22.md` | 品牌 v0.1 规划版（已合并到 canonical） |
| `NEWS_PRD_2026-06-20.md` | 资讯 v1 实现版（已合并到 canonical） |
| `CONTENT_BLOG_PRD_2026-06-22.md` | 内容中心 v0.1 规划版（已合并到 canonical） |
| `AGENT_PUBLIC_PRD_2026-06-20.md` | 门店 v1 实现版（已合并到 canonical） |
| `CONTACT_PRD_2026-06-20.md` | 联系页 v1 实现版（已合并到 canonical） |

## 关联

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.1 路由总览
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — Store / Article 模型
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §P0-1 §P0-7](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) — 当前阻断 bug
- [../feature/SEO_SCHEMA_PRD_2026-06-20.md](../feature/SEO_SCHEMA_PRD_2026-06-20.md) — SEO 规范
- [../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md](../feature/ANALYTICS_TRACKING_PRD_2026-06-20.md) — 埋点规范
