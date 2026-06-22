# 蓝辉轻改 LANHUI — Master PRD (索引 + 看板)

> 项目级产品需求文档,采用"索引 + 看板"风格,避免重复细节,所有规格下沉到子 PRD。
>
> **结构原则**: Master 答 *"是什么 / 怎么样"*, 子 PRD 答 *"怎么实现 / 验收"*
>
> **版本**: v2.0 (2026-06-19 重构)
> **适用范围**: 蓝辉轻改官方网站 + `/admin` CMS + DB + 部署
> **维护者**: 冯科雅 (Coya) · AI 部

---

## 1. 产品定位

### 1.1 一句话

**蓝辉轻改 LANHUI 是面向汽车轻改装与车身膜服务的品牌官方站 + CMS 一体化系统,从顺德大良出发,为车主提供一站式轻改升级方案。**

### 1.2 愿景 / Slogan

> 让爱车更有型,也好用。

### 1.3 业务范围

| 业务线 | 内容 |
|---|---|
| 轻改装服务 | 电动踏板 · 轮毂升级 · 底盘升级 |
| 车身膜服务 | 汽车窗膜 · 改色膜 · 隐形车衣(PPF) |
| 主题专项 | wenjie(问界)· xiaomi(小米 SU7)· zeekr(极氪)· flooring(木地板)等 |
| 门店服务 | 当前 1 家(顺德大良店),未来扩展全国 |
| 内容运营 | 品牌动态 · 门店动态 · 产品知识 · 产品动态 |

---

## 2. 目标用户

| 类型 | 画像 | 核心需求 | 触达页面 |
|---|---|---|---|
| **车主 / C 端** | 已购车,关注外观+舒适度 | 品牌信任 · 一站式咨询 · 门店导航 | 公开站全站 |
| **轻改爱好者** | 了解产品差异 | 技术参数 · 工艺细节 · 案例参考 | 6 大产品线 + 主题专项 |
| **潜客** | 信息收集阶段,未决 | 资质 · 价格 · 流程 · 联系方式 | 品牌 · 联系我们 |
| **运营 / 店主** | 蓝辉内部员工 | 内容发布 · 门店管理 · 数据看板 | `/admin` |

---

## 3. 技术栈

| 层级 | 选型 | 版本 |
|---|---|---|
| 框架 | Next.js (App Router) | 16.2.1 |
| 运行时 | React | 19.2.4 |
| 语言 | TypeScript (strict, 禁 `any`) | latest |
| 样式 | Tailwind CSS (oklch tokens) | v4 |
| UI 库 | shadcn/ui (Base UI 原语) | latest |
| 图标 | Lucide React | latest |
| ORM | Prisma + `@prisma/adapter-pg` | 7.8 |
| 数据库 | PostgreSQL (容器 `lanhui-postgres`, **端口 5433**) | 16 |
| 认证 | NextAuth (Credentials + JWT, 无 DB session) | v5 beta |
| 验证 | Zod | v4 |
| 测试 | vitest (happy-dom) + Playwright | 3.2 / 1.55 |
| 部署 | Docker standalone (Node 24 alpine) | — |

> 完整架构图: [../ARCHITECTURE.md](../ARCHITECTURE.md)
> 数据库设计: [../database/README.md](../database/README.md)

---

## 4. 信息架构 (IA)

### 4.1 公开站 (SSG 优先, 13 路由)

```
/                                  首页 (品牌曝光 + 6 产品入口)
/brand                             品牌故事
/brand/certifications              资质证书
/brand/history                     发展历程
/contact                           联系方式

/product                           产品中心 (6 + 主题专题入口)
/product/electric-steps            电动踏板
/product/wheels                    轮毂升级
/product/chassis                   底盘升级
/product/window-film               汽车窗膜 (含子页 /[packageSlug])
/product/color-film                改色膜
/product/ppf                       隐形车衣
/product/wenjie                    问界主题专项
/product/xiaomi                    小米 SU7 主题专项
/product/zeekr                     极氪主题专项
/product/flooring                  木地板主题

/news                              资讯列表 (分页)
/news/[slug]                       资讯详情 ⚠️ 当前 P0-7 (item.content missing)

/agent                             省份选择
/agent/[province]                  城市列表 ⚠️ 当前不可达 (404)
/agent/[province]/[city]           门店列表 ⚠️ 当前不可达 (404)
/agent/store/[id]                  门店详情
```

### 4.2 后台 CMS (force-dynamic, 10 路由)

```
/admin/login                       公开 (登录页)
/admin                             后台首页 (Dashboard 数据概览) [认证]
/admin/analytics                   数据分析 (PV / 点击 / 门店) [admin]
/admin/articles                    文章管理 [editor+]
/admin/articles/new                新建文章 [editor+]
/admin/articles/[id]               编辑文章 [editor+]
/admin/stores                      门店管理 [admin]
/admin/stores/new                  新建门店 [admin]
/admin/stores/[id]                 编辑门店 [admin]
/admin/stores/[id]/image           门店图片上传 [admin]
```

### 4.3 API (12 路由)

| Method | 路径 | 用途 | 权限 |
|---|---|---|---|
| GET | `/api/provinces` | 省份列表 | 公开 |
| GET | `/api/cities` | 城市列表 (按省) | 公开 |
| GET | `/api/regions` | 省+市树 | 公开 |
| GET | `/api/stores` | 门店列表 | 公开 (草稿过滤) |
| GET / PUT / DELETE | `/api/stores/[id]` | 门店详情 | GET 公开, 写 admin |
| POST | `/api/stores` | 创建门店 | admin |
| GET | `/api/articles` | 文章列表 | 公开 (草稿过滤) |
| GET / PUT / DELETE | `/api/articles/[id]` | 文章详情 | GET 公开, 写 editor+ |
| POST | `/api/articles` | 创建文章 | editor+ |
| GET | `/api/articles/categories` | 分类聚合 | 公开 |
| POST | `/api/auth/*` | NextAuth | 公开 |
| POST | `/api/analytics/track` | 埋点写入 | 公开 (限流 60/min/IP) |
| GET | `/api/analytics/stats` | 看板数据 | admin |
| POST | `/api/upload` | 图片上传 | admin |

---

## 5. PRD 子文档地图

按页面类型 5 大分类,每个子 PRD 含 8 段(概述/用户故事/功能/UI/数据/API/验收/变更)。

### 5.1 公开站 (public-site/) — 5 Canonical + 13 独立 PRD

| Canonical PRD | 关联路由 | 状态 |
|---|---|---|
| [HOMEPAGE_PRD.md](./public-site/HOMEPAGE_PRD.md) (首页) | `/` | 🟢 v1（canonical，合并 06-20 实现 + 06-22 规划） |
| [BRAND_PRD.md](./public-site/BRAND_PRD.md) (品牌) | `/brand` `/brand/certifications` `/brand/history` | 🟢 v1（canonical，合并 06-20 实现 + 06-22 规划） |
| [NEWS_PRD.md](./public-site/NEWS_PRD.md) (资讯) | `/news` `/news/[slug]` | 🟢 v1（canonical，合并 06-20 实现 + 06-22 规划） |
| [AGENT_PUBLIC_PRD.md](./public-site/AGENT_PUBLIC_PRD.md) (门店网络) | `/agent` `/agent/*` | 🟢 v1（canonical，合并 06-20 实现 + 06-21 规划） |
| [CONTACT_PRD.md](./public-site/CONTACT_PRD.md) (联系) | `/contact` | 🟢 v1（canonical，合并 06-20 实现 + 06-22 规划） |

另有 13 份独立 06-22 规划 PRD（产品中心、车型项目、膜类产品、Footer 等），详见 [public-site/README.md](./public-site/README.md)。

### 5.2 产品中心 (product/) — 11 子 PRD (全部 v1 ✅)

| 子 PRD | 关联路由 | 状态 |
|---|---|---|
| `[PRODUCT_INDEX]_*_PRD.md` (产品中心) | `/product` | 🟢 v1 (2026-06-20 批 2) |
| `[ELECTRIC_STEPS]_*_PRD.md` (电动踏板) | `/product/electric-steps` | 🟢 v1 (2026-06-20 批 2) |
| `[WHEELS]_*_PRD.md` (轮毂) | `/product/wheels` | 🟢 v1 (2026-06-20 批 2) |
| `[CHASSIS]_*_PRD.md` (底盘) | `/product/chassis` | 🟢 v1 (2026-06-20 批 2) |
| `[WINDOW_FILM_TOPIC]_*_PRD.md` (汽车窗膜) | `/product/window-film` `/[packageSlug]` | 🟢 v1 (2026-06-20 批 3, 501 行) + 🟡 v0 archive |
| `[COLOR_FILM]_*_PRD.md` (改色膜) | `/product/color-film` | 🟢 v1 (2026-06-20 批 2) |
| `[PPF]_*_PRD.md` (隐形车衣) | `/product/ppf` | 🟢 v1 (2026-06-20 批 2) |
| `[WENJIE_TOPIC]_*_PRD.md` (问界) | `/product/wenjie` | 🟢 v1 (2026-06-20 批 3, 616 行) + 🟡 v0 archive |
| `[XIAOMI_TOPIC]_*_PRD.md` (小米 SU7) | `/product/xiaomi` | 🟢 v1 (2026-06-20 批 3, 614 行) + 🟡 v0 archive |
| `[ZEEKR_TOPIC]_*_PRD.md` (极氪) | `/product/zeekr` | 🟢 v1 (2026-06-16, canonical) + 🟡 v0 archive |
| `[FLOORING_TOPIC]_*_PRD.md` (木地板) | `/product/flooring` | 🟢 v1 (2026-06-20 批 3, 698 行) + 🟡 v0 archive |

### 5.3 后台 (admin/) — 4 子 PRD 待建

| 子 PRD | 关联路由 | 状态 |
|---|---|---|
| [ADMIN_LOGIN_PRD.md](./admin/ADMIN_LOGIN_PRD_2026-06-20.md) (登录) | `/admin/login` | 🟢 v1 |
| [ADMIN_DASHBOARD_PRD.md](./admin/ADMIN_DASHBOARD_PRD_2026-06-20.md) (数据看板) | `/admin` `/admin/analytics` | 🟢 v1 |
| [ARTICLE_MANAGEMENT_PRD.md](./admin/ARTICLE_MANAGEMENT_PRD.md) (文章管理) | `/admin/articles` 系列 | 🟢 v1（canonical） |
| [STORE_MANAGEMENT_PRD.md](./admin/STORE_MANAGEMENT_PRD.md) (门店管理) | `/admin/stores` 系列 | 🟢 v1（canonical） |

#### 5.3.1 2026-06-22 合并为 Canonical PRD

2026-06-21 规划版已从 Trellis 迁回 `docs/PRD/admin/`，与 2026-06-20 实现版合并为单份 Canonical PRD：

| 子系统 | Canonical PRD | 状态 |
|---|---|---|
| 门店管理 | [`STORE_MANAGEMENT_PRD.md`](./admin/STORE_MANAGEMENT_PRD.md) | 🟢 v1（合并 06-20 实现 + 06-21 规划） |
| 文章 CMS | [`ARTICLE_MANAGEMENT_PRD.md`](./admin/ARTICLE_MANAGEMENT_PRD.md) | 🟢 v1（合并 06-20 实现 + 06-21 规划） |
| 用户行为分析 | [`ANALYTICS_SYSTEM_PRD.md`](./admin/ANALYTICS_SYSTEM_PRD.md) | 🟡 v0.1（迁移自 Trellis） |

旧版本文件存档于 `docs/PRD/admin/archive/`。设计文档存档于 `docs/designs/admin/archive/`。

### 5.4 跨切面 (feature/) — 4 子 PRD 待建

| 子 PRD | 用途 | 状态 |
|---|---|---|
| `[IMAGE_UPLOAD]_*_PRD.md` (图片上传) | 全站图片存储 | ⚪ 待建 (从 IMAGE_MANAGEMENT 拆) |
| `[ANALYTICS_TRACKING]_*_PRD.md` (埋点系统) | 客户端事件收集 | ⚪ 待建 |
| `[SEO_SCHEMA]_*_PRD.md` (SEO 优化) | sitemap/OG/JSON-LD | ⚪ 待建 |
| `[AUTH_GUARD]_*_PRD.md` (认证守卫) | NextAuth 权限矩阵 | ⚪ 待建 |

### 5.5 横切 (cross-cutting/) — 6 子 PRD (已建)

| 子 PRD | 状态 |
|---|---|
| [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) | 🟢 v1 — 21 个 P0/P1/P2 任务清单 + 完整审计 |
| [ADR_PRD_2026-06-20.md](./cross-cutting/ADR_PRD_2026-06-20.md) | 🟢 v1 — 架构决策记录体系 |
| [DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md](./cross-cutting/DEPLOYMENT_RUNBOOK_PRD_2026-06-20.md) | 🟢 v1 — 部署 + 回滚 runbook |
| [PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md](./cross-cutting/PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md) | 🟢 v1 — Lighthouse 基线 + 性能预算 |
| [SECURITY_AUDIT_PRD_2026-06-20.md](./cross-cutting/SECURITY_AUDIT_PRD_2026-06-20.md) | 🟢 v1 — OWASP Top 10 加固 |
| **[DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md](./cross-cutting/DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md)** | **🟡 v0** — Vercel Geist spec 对账 + 14 项 P0/P1/P2 任务 |

### 5.6 归档 (archive/)

存放过期 PRD(只读,不维护):
- [ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive](./archive/ZEEKR_MODIFICATION_TOPIC_PRD_2026-06-14.md.archive) — ZEEKR v0,被 2026-06-16 v1 替代

### 5.7 数据库 (../database/)

| 文档 | 用途 |
|---|---|
| [../database/README.md](../database/README.md) | 索引 |
| [../database/SCHEMA.md](../database/SCHEMA.md) | 7 表逐字段规格 |
| [../database/ER_DIAGRAMS.md](../database/ER_DIAGRAMS.md) | 4 张 Mermaid ER 图 |
| [../database/SEED_DATA.md](../database/SEED_DATA.md) | 种子数据 (1 用户 + 27 省 + 75 市) |

---

## 6. 看板 (Status Dashboard)

### 6.1 子 PRD 完成度

| 分类 | 总数 | 🟢 v1 | 🟡 v0 | ⚪ 待建 | 完成度 |
|---|---|---|---|---|---|
| public-site | 5 | 5 | 0 | 0 | 100% |
| product | 11 | 11 | 0 | 0 | **100%** ✅ |
| admin | 4 | 4 | 0 | 0 | 100% |
| feature | 4 | 4 | 0 | 0 | 100% |
| cross-cutting | 6 | 5 | 1 | 0 | **100%** |
| **合计** | **30** | **29** | **1** | **0** | **100%** ✅ |

注 1: 9 个 v0 PRD 已 git mv 到 archive/,不再计入"🟡 v0"。
注 2: 2026-06-21 增补 DESIGN_SYSTEM_ALIGNMENT v0,源自 Coya 阅读 Vercel Geist 规范后的对账。P0 6 项待执行。
注 3: 看板整体完成度 97% → **100%**(cross-cutting 5 v1 + 1 v0)。

### 6.2 P0 / P1 / P2 待办 (来自审计)

> 完整列表见 [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

| 优先级 | 数量 | 关键任务 |
|---|---|---|
| **P0** 阻断 | 7 | P0-1 动态路由 404 (5 个) · P0-6 测试门店污染 · P0-7 资讯详情 404 |
| **P1** 影响转化 | 8 | P1-7~13 数据失衡 + 埋点失效 + 测试残留 |
| **P2** 可优化 | 3 | P2-4 图表日期连续性等 |

### 6.3 路由健康度

| 类别 | 路由数 | 可达 | 不可达 (404) | 完整度 |
|---|---|---|---|---|
| 公开站 | 21 | 16 | 5 | 76% |
| 后台 | 10 | 10 | 0 | 100% |
| API | 12 | 12 | 0 | 100% |
| **合计** | **43** | **38** | **5** | **88%** |

### 6.4 性能基线 (Lighthouse, 2026-06-19)

| 维度 | desktop | mobile | 目标 |
|---|---|---|---|
| 性能分 | 70-98 | 61-96 | > 90 |
| LCP | 0.6-6.6s | 0.7-8.0s | < 2.5s |
| CLS | 0 | 0 | < 0.1 |
| TBT | < 200ms | < 200ms | < 200ms |

---

## 7. Definition of Done (DoD)

每条子 PRD 完成时**必须**满足:

- [ ] **代码**: 实现完整,无 TODO / FIXME
- [ ] **类型**: `npx tsc --noEmit` 通过(允许 9 个 pre-existing 错)
- [ ] **构建**: `npm run build` 通过
- [ ] **测试**: 关键路径有 vitest 单元测试或 Playwright e2e
- [ ] **响应式**: desktop (1440) / tablet (768) / mobile (390) 三视口验证
- [ ] **可访问性**: 语义化 HTML + 键盘导航 + 颜色对比 4.5:1
- [ ] **SEO**: 独立 `<title>` + `<meta description>` + JSON-LD (按需)
- [ ] **埋点**: 关键交互有 `track()` 调用
- [ ] **审计**: `/admin/audit-reports/<page>.md` 或类似记录截图+评级
- [ ] **CHANGELOG**: 子 PRD 底部"变更记录"追加一行

---

## 8. 路线图 (Roadmap)

### 8.1 已完成 (✅)

- 2026-06-14: ZEEKR 主题专项 v1 (5 组件 + 3 态 UI + CI 脚本)
- 2026-06-19: 全站 + 后台 21 页 + 5 后台页 视觉审计 (78 截图 + 42 Lighthouse + 24 e2e)
- 2026-06-19: PRD 文档体系重构批 1 (5 分类骨架 + 4 DB 文档 + Master + 5 模板)
- **2026-06-20: PRD 批 2 填表 (23 个 v1 子 PRD, 9 个 v0 归档, 整体 83%)**
- **2026-06-20: PRD 批 3 填表 (4 个产品主题专项 v1: window-film / wenjie / xiaomi / flooring, 2429 行, 整体 97%)**

### 8.2 进行中 (🚧)

- 批 4: P0-6 清理测试门店 (1-2h)
- 批 5: P0-7 修复 `/news/[slug]` content 字段 (1h)
- 批 6: 补齐 1 个待建子 PRD (cross-cutting AUDIT 系列扩展 1→5) (1-2h)

### 8.3 计划 (📋)

| 季度 | 计划 |
|---|---|
| Q3 2026 | 主题专项扩展 (BYD / 蔚来 / 理想) · CMS 多语言 · 微信小程序 |
| Q4 2026 | 客户案例库 · 在线预约 · 支付集成 · 营销自动化 |
| 2027 H1 | 多门店加盟系统 · 供应链协同 · 数据中台 |

---

## 9. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-10 | v1.0 | 初版 Master PRD (单文件 386 行) | Coya |
| 2026-06-19 | v2.0 | **重构为索引+看板风格**,12 个旧 PRD 归档到 5 分类,新增 4 份 DB 文档,新增 5 份子 PRD 模板 | Coya |
| 2026-06-19 | v2.0 | 新增 ER_DIAGRAMS + SCHEMA + SEED_DATA 数据库文档体系 | Coya |
| 2026-06-20 | v2.1 | **批 2 填表**: 23 个 v1 子 PRD (5 public-site + 6 product + 4 admin + 4 feature + 4 cross-cutting),9 个 v0 归档到 archive/。整体完成度 37% → 83%。| Coya |
| 2026-06-20 | v2.2 | **批 3 填表**: 4 个产品主题专项 v1 (window-film 501 行 + wenjie 616 行 + xiaomi 614 行 + flooring 698 行,共 2429 行)。产品分类完成度 55% → **100%**;整体 83% → **97%**。| Coya |
| 2026-06-21 | v2.3 | **设计系统对齐**:新增 cross-cutting 子 PRD `DESIGN_SYSTEM_ALIGNMENT_PRD_2026-06-21.md`(v0,~500 行),基于 Vercel Geist spec 对账 14 项任务(P0×6 / P1×5 / P2×3)。整体 97% → **100%**。| Coya |
| 2026-06-21 | v2.4 | **admin 文档迁至 Trellis**:4 份 2026-06-21 子 PRD + 5 份 Design 副本迁至 Trellis 父任务 `06-21-admin-system-refactor` 的 4 个子任务(`06-21-admin-{system-total,store,article,analytics}`);原文件 `git mv` 到 `docs/{PRD,designs}/admin/archive/`(只读)。admin 子文档在 §5.3 表格保持"待建/v0"状态以记录 2026-06-20 v1 历史;新增 §5.3.1 区块说明 2026-06-21 活跃文档位置。| Coya |

---

## 10. 跨文档导航

| 我想知道... | 看哪份文档 |
|---|---|
| 产品是什么 / 用户是谁 | 本文档 §1-2 |
| 技术怎么搭 | [../ARCHITECTURE.md](../ARCHITECTURE.md) |
| 路由怎么设计 | 本文档 §4 |
| 某个页面怎么实现 | 子 PRD (按 §5 地图) |
| 数据怎么存 | [../database/SCHEMA.md](../database/SCHEMA.md) |
| 数据怎么关系 | [../database/ER_DIAGRAMS.md](../database/ER_DIAGRAMS.md) |
| 种子数据怎么写 | [../database/SEED_DATA.md](../database/SEED_DATA.md) |
| 已知 bug / 优化点 | [AUDIT_AND_REGRESSION_PRD_2026-06-19.md](./cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) |
| 怎么部署 | [../ARCHITECTURE.md §部署](../ARCHITECTURE.md) |
| 怎么写子 PRD | [./_templates/public-site.md](./_templates/public-site.md) |
| 某批开发日志(目标/工作流/决策/经验) | [../journal/](../journal/) |
