# ADMIN_DASHBOARD_PRD_2026-06-20.md

> **页面**: `/admin`(仪表盘) + `/admin/analytics`(深度数据分析)
> **类型**: 后台 CMS 数据展示(`force-dynamic` + `auth()` 守卫)
> **优先级**: P0(admin 唯一运营入口)
> **Owner**: 冯科雅 (Coya)
> **版本**: v1
> **最后更新**: 2026-06-20

> **合并说明**: v1 将 `/admin`(Dashboard 概览)与 `/admin/analytics`(深度图表)合并到同一 PRD。两个页面共享数据源(`/api/analytics/stats` + `getDashboardSummary()`),共享图表组件(`recharts`),共享权限(admin-only / editor 只读 dashboard,无 analytics)。

---

## 1. 概述

### 1.1 目标

后台 Dashboard 是 admin / editor 登录后的第一个页面,提供**当日运营概览 + 数据深度分析**两大能力:

- `/admin` —— 一屏看到 4 大 KPI(总 PV / 总事件 / 门店访问 / 预约)+ 内容健康度 + 门店网络 + 趋势图 + 最近活动 + 快捷入口(RSC 直接 `auth()` 守卫)
- `/admin/analytics` —— 选择 7/30/90 天范围,看 4 张深度图表(每日 PV 趋势 / 事件类型分布 / 热门页面 Top 10 / 热门门店 Top 10)

### 1.2 权限

- **可见角色**:
  - `/admin`: admin + editor
  - `/admin/analytics`: admin only
- **写权限**: 无(纯读)

### 1.3 范围

- ✅ 包含:
  - Dashboard 4 KPI + 内容健康度卡片 + 门店网络卡片 + 趋势图 + 最近活动 + 快捷入口
  - Analytics 4 KPI + 4 张 recharts 图表 + 7/30/90 天切换器
  - `getDashboardSummary()` 服务端聚合(RSC 友好)
  - `/api/analytics/stats` 深度查询(支持 groupBy day/week/month)
  - 修复 P1-12(全站 click 埋点失效)+ P1-13(store_view 缺失)+ P1-7(文章分类草稿过滤)+ P2-4(折线图日期连续性)
- ❌ 不包含:
  - 数据导出(CSV / Excel)—— v2 候选
  - 自定义时间范围(startDate / endDate picker)—— v2 候选
  - 实时数据刷新(WebSocket / SSE)—— v2 候选
  - 漏斗 / 留存 / 同环比分析 —— v2 候选
  - 第三方 BI 集成(Metabase / Superset)—— 远期

---

## 2. 用户故事

| # | 角色 | 场景 | 期望 | 优先级 |
|---|---|---|---|---|
| US-1 | admin | 早上 9 点上班 | 打开 `/admin` 看 4 KPI + 内容健康度 + 门店网络 | P0 |
| US-2 | admin | 看本月趋势 | 点击 `/admin/analytics`,切换 30 天范围,看折线图 | P0 |
| US-3 | editor | 看自己发布的文章效果 | 在 `/admin` 最近活动里看到自己发布/编辑的文章 | P1 |
| US-4 | admin | 排查"为什么热门门店 Top 10 是空" | `/admin/analytics` 看到 topStores 提示「暂无门店访问数据,请检查 store_view 埋点」 | P0 |
| US-5 | admin | 7 天 vs 30 天对比 | 切换时间范围,KPI / 图表实时刷新 | P0 |
| US-6 | editor | 想看深度数据 | 访问 `/admin/analytics` → 重定向 `/admin`(editor 无权) | P0 |
| US-7 | admin | 折线图跳日 | X 轴显示连续日期(无数据天补 0,而不是跳过) | P1 |

---

## 3. 功能清单

| # | 功能 | 路由 | 优先级 | 状态 | 实现位置 |
|---|---|---|---|---|---|
| F1 | Dashboard 4 KPI 卡(总 PV / 总事件 / 门店访问 / 预约) | `/admin` | P0 | ✅ | `DashboardKpiCards.tsx` |
| F2 | 内容健康度卡片(已发布文章 / 草稿 / 占比) | `/admin` | P0 | ✅ | `DashboardContentHealth.tsx` |
| F3 | 门店网络卡片(总门店 / 营业中 / 停用) | `/admin` | P0 | ✅ | `DashboardStoreNetwork.tsx` |
| F4 | 最近活动(ActivityLog 最近 10 条) | `/admin` | P1 | ✅ | `DashboardRecentActivity.tsx` |
| F5 | 趋势图(7 天 PV 折线) | `/admin` | P0 | ✅ | `DashboardTrendChart.tsx` |
| F6 | 快捷入口(写文章 / 新建门店 / 上传图片) | `/admin` | P1 | ✅ | `DashboardQuickActions.tsx` |
| F7 | Welcome header(用户名 + 日期) | `/admin` | P2 | ✅ | 内联在 `page.tsx` |
| F8 | Analytics 7/30/90 天切换器 | `/admin/analytics` | P0 | ✅ | 3 个 button |
| F9 | Analytics 4 KPI(同 F1,服务端独立查) | `/admin/analytics` | P0 | ✅ | recharts 复用 |
| F10 | Analytics 每日 PV 趋势(折线) | `/admin/analytics` | P0 | ✅ | recharts LineChart |
| F11 | Analytics 事件类型分布(柱状) | `/admin/analytics` | P0 | ✅ | recharts BarChart |
| F12 | Analytics 热门页面 Top 10(横向条形) | `/admin/analytics` | P0 | ✅ | recharts BarChart layout=vertical |
| F13 | Analytics 热门门店 Top 10(横向条形) | `/admin/analytics` | P0 | ⚠️ 数据空(P1-13) | recharts BarChart |
| F14 | Analytics loading 骨架屏 | `/admin/analytics` | P1 | ✅ | `Skeleton / CardSkeleton / ChartSkeleton` |
| F15 | Dashboard `force-dynamic` + `auth()` 守卫 | `/admin` | P0 | ✅ | `export const dynamic = "force-dynamic"` |
| F16 | Analytics `force-dynamic` + admin 角色守卫 | `/admin/analytics` | P0 | ✅ | `use client` + 客户端 fetch,服务端 `auth()` 在 layout |
| **F17** | **P1-12 修复:全站 Button/Link 自动 click 埋点** | — | P0 | ⚪ 待补 | `src/components/ui/button.tsx` 包一层 `track('click', ...)` |
| **F18** | **P1-13 修复:`/agent/store/[id]` 加 store_view 埋点** | — | P0 | ⚪ 待补 | `src/app/agent/store/[id]/page.tsx` useEffect |
| **F19** | **P1-13 修复:`/api/analytics/stats` topStores 查询 join Store** | — | P0 | ✅ 已实现 | `route.ts:145-156` |
| **F20** | **P1-7 修复:`getDashboardSummary` 加 `status='published'` 过滤** | — | P0 | ⚪ 待补 | `src/lib/admin-dashboard.ts` |
| **F21** | **P2-4 修复:折线图日期连续显示(0 值不跳过)** | — | P1 | ⚪ 待补 | 后端补 0 行 / 前端 recharts `type="category"` |

---

## 4. UI / 交互

### 4.1 视觉规范

- **背景**: 透明(继承 layout 的 `bg-zinc-950`)
- **KPI 卡**: `rounded-xl border border-zinc-800 bg-zinc-900 p-6` + 大数字 `text-3xl font-bold text-zinc-100` + 小标签 `text-sm text-zinc-400`
- **图表**: recharts `ResponsiveContainer height={280}` + Tooltip 暗色主题 `bg-zinc-900 border-zinc-800`
- **主色**: orange-500(CTA / 高亮) + blue-400(门店数据) + zinc 系(中性)
- **时间范围切换器**: orange-500 实心为选中态,zinc-800 为未选中

### 4.2 组件清单(Dashboard `/admin`)

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `DashboardPage` | `src/app/admin/(dashboard)/page.tsx` | RSC | `force-dynamic` + `auth()` |
| `WelcomeHeader` | 同上(内联) | RSC | 用户名 + 日期 |
| `DashboardKpiCards` | `src/components/admin/DashboardKpiCards.tsx` | RSC | 4 KPI |
| `DashboardContentHealth` | `src/components/admin/DashboardContentHealth.tsx` | RSC | 文章健康度 |
| `DashboardStoreNetwork` | `src/components/admin/DashboardStoreNetwork.tsx` | RSC | 门店网络 |
| `DashboardRecentActivity` | `src/components/admin/DashboardRecentActivity.tsx` | RSC | 最近活动 |
| `DashboardQuickActions` | `src/components/admin/DashboardQuickActions.tsx` | RSC | 快捷入口 |
| `DashboardTrendChart` | `src/components/admin/DashboardTrendChart.tsx` | CC | 7 天 PV 折线 |

### 4.3 组件清单(Analytics `/admin/analytics`)

| 组件 | 路径 | 类型 | 说明 |
|---|---|---|---|
| `AnalyticsPage` | `src/app/admin/(dashboard)/analytics/page.tsx` | Client | `'use client'`,全部状态管理 |
| `Skeleton` / `CardSkeleton` / `ChartSkeleton` | 同上(内联) | CC | loading 占位 |

### 4.4 状态机(Analytics)

```
[init] --fetch--> [loading + skeleton]
                  |
                  |--200 ok--> [data + 图表]
                  |
                  |--非 2xx / json.success=false--> [error + retry]
                  |
                  |--range 切换--> [loading + skeleton] → ...
```

### 4.5 三视口响应式

| 视口 | Dashboard 行为 | Analytics 行为 |
|---|---|---|
| Desktop 1440 | KPI 4 横排,内容卡片 2×2,趋势图 1×1 | KPI 4 横排,图表 2×2 |
| Tablet 768 | KPI 2×2,内容卡片 1 列,趋势图 1×1 | KPI 2×2,图表 1 列 |
| Mobile 390 | KPI 单列,内容卡片单列,趋势图单列 | KPI 单列,图表单列,横轴日期自动稀疏 |

### 4.6 可访问性

- ✅ 语义化 HTML(`<table>` / `<svg role="img">`)
- ⚠️ 图表:`<svg>` 需加 `aria-label` 或 `<title>` 元素(本轮 F22 候选)
- ✅ 时间范围切换器:3 个 `<button type="button">`,键盘 Tab 可达
- ✅ Loading 骨架屏 `animate-pulse`(`prefers-reduced-motion` 用户体验略弱,v2)
- ✅ 颜色对比度 ≥ 4.5:1

---

## 5. 数据模型

### 5.1 主表

```
DB: AnalyticsEvent      # 埋点事件
DB: Article             # 文章(健康度)
DB: Store               # 门店(网络)
DB: ActivityLog         # 最近活动
DB: User                # 用户 / 作者
```

### 5.2 AnalyticsEvent 表(关键字段)

```
AnalyticsEvent {
  id         String   @id @default(cuid())
  type       String   // 'pageview' | 'click' | 'form_submit' | 'reservation' | 'store_view'
  pathname   String?  // /agent/store/123
  storeId    String?  // 关联 Store.id(仅 store_view)
  userId     String?  // 关联 User.id(已登录)
  ip         String?
  userAgent  String?
  metadata   Json?    // { label, value, ... }
  timestamp  DateTime @default(now())

  @@index([type, timestamp])
  @@index([storeId, timestamp])
  @@index([pathname, timestamp])
}
```

### 5.3 getDashboardSummary() 聚合

**文件**: `src/lib/admin-dashboard.ts`(RSC 友好,服务端调用)

```ts
export async function getDashboardSummary() {
  const [pv, totalEvents, storeViews, reservations, articlesPub, articlesDraft, storesActive, storesInactive, recent] =
    await Promise.all([
      prisma.analyticsEvent.count({ where: { type: "pageview" } }),
      prisma.analyticsEvent.count(),
      prisma.analyticsEvent.count({ where: { type: "store_view" } }),
      prisma.analyticsEvent.count({ where: { type: "reservation" } }),
      prisma.article.count({ where: { status: "published" } }),   // ← P1-7 修复点
      prisma.article.count({ where: { status: "draft" } }),
      prisma.store.count({ where: { isActive: true } }),
      prisma.store.count({ where: { isActive: false } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    ]);
  return {
    kpi: { pv, totalEvents, storeViews, reservations },
    contentHealth: { published: articlesPub, draft: articlesDraft },
    storeNetwork: { active: storesActive, inactive: storesInactive },
    recentActivity: recent,
  };
}
```

### 5.4 /api/analytics/stats 深度查询

**文件**: `src/app/api/analytics/stats/route.ts`(已实现,见源码)

- 入参:`startDate` / `endDate` / `groupBy=day|week|month`
- 出参:`{ totalEvents, eventsByType[], topPages[], topStores[], dailyTrend[] }`
- 权限:`session.user.role === 'admin'`
- groupBy 用 3 个独立 `prisma.$queryRaw` 拼接 `DATE_TRUNC` 避免 `${groupBy}` 被参数化为 `$1`
- topStores 关联 Store 表取 name(已实现,line 145-156)

### 5.5 ActivityLog 记录

Dashboard / Analytics 是纯读页面,**不**写 ActivityLog。

---

## 6. API 接口

| Method | 路径 | 权限 | 说明 |
|---|---|---|---|
| GET | `/api/analytics/stats?startDate&endDate&groupBy` | admin | Analytics 数据源 |
| GET | `/api/articles` (内部调用) | 公开 | Dashboard 不直接调,经 `getDashboardSummary()` |
| GET | `/api/stores` (内部调用) | 公开 | 同上 |
| GET | `/api/analytics/track` | N/A | 客户端埋点写入(POST) |

**统一响应**: `{ success: true, data: T }` 或 `{ success: false, error: string }`

**写操作必做**(本页面无):

1. `auth()` 校验
2. 角色检查
3. Zod 输入校验
4. Prisma 事务 + ActivityLog
5. `revalidatePath('/admin')`

### 6.1 P1-12 / P1-13 / P1-7 修复路径

| ID | 修复点 | 代码位置 | 修复方案 |
|---|---|---|---|
| **P1-12** | 全站 click 埋点失效 | `src/components/ui/button.tsx` + 所有 button 调用点 | 1. 在 `src/lib/analytics.ts` 加 `trackClick(label, metadata?)` helper<br>2. 在 `button.tsx` `onClick` 内包一层 `trackClick(children or aria-label)`<br>3. 同步修改 Link 组件 |
| **P1-13** | store_view 缺失 + topStores 空 | 1. `src/app/agent/store/[id]/page.tsx`<br>2. `src/app/api/analytics/stats/route.ts` | 1. 详情页 `useEffect(() => track('store_view', { storeId: id }), [])`<br>2. `route.ts` topStores 已正确 join Store(line 145-156),数据空是埋点问题,**不是**查询问题 |
| **P1-7** | 文章分类 Top 5 未过滤草稿 | `src/lib/admin-dashboard.ts` | `prisma.article.count({ where: { status: "published" } })` 已过滤;验证 DashboardContentHealth 组件读 `articlesPub` 字段 |
| **P2-4** | 折线图日期不连续 | 1. `src/lib/analytics-stats.ts`(补 0 行 helper)<br>2. `route.ts` dailyTrend 返回前补全 | 1. 在后端 SQL 后用 JS 补全 `[startDate..endDate]` 范围内缺失日期为 `{ date, count: 0 }`<br>2. 前端 `recharts` XAxis `type="category"` 强制按数据点渲染(已是) |

---

## 7. 验收标准 (DoD)

### 7.1 功能

- [ ] `/admin` 加载后 1.5s 内展示 4 KPI + 5 卡片
- [ ] `/admin/analytics` 切换 7d / 30d / 90d → 4 张图表全部刷新
- [ ] Analytics 4 KPI 数字 = dashboard 4 KPI 数字(同一数据源)
- [ ] Dashboard KPI 中「总事件」= 「页面浏览 + 点击 + 提交 + 预约 + 门店访问」(口径一致)
- [ ] 加载中显示骨架屏(KPI 4 块 + 图表 4 块)
- [ ] 数据为空时:折线图 X 轴显示连续日期(0 值补全),柱状图显示空态文案

### 7.2 权限

- [ ] 未登录访问 `/admin` → 重定向 `/admin/login`
- [ ] editor 访问 `/admin` → 正常显示
- [ ] editor 访问 `/admin/analytics` → 重定向 `/admin`(无权限)
- [ ] `/api/analytics/stats` 无 session → 401
- [ ] `/api/analytics/stats` session.role !== 'admin' → 403
- [ ] 任何用户访问 `/api/analytics/stats` 都被限流 ≤ 30/min/IP(防刷)

### 7.3 质量门

- [ ] `npx tsc --noEmit` 通过
- [ ] `npm run build` 通过
- [ ] `npm run lint` 无新增 error
- [ ] Playwright e2e `dashboard loads with 4 kpi cards` 通过
- [ ] Playwright e2e `analytics range switch triggers refetch` 通过
- [ ] Playwright e2e `analytics 4 charts render` 通过
- [ ] Playwright e2e `editor blocked from analytics` 通过
- [ ] Lighthouse `/admin` desktop ≥ 80 / mobile ≥ 70
- [ ] Lighthouse `/admin/analytics` desktop ≥ 80 / mobile ≥ 70
- [ ] 三视口截图 OK

### 7.4 数据卫生

- [ ] `getDashboardSummary()` 用 `prisma.*` 服务端调用,**不**在前端直接调 DB
- [ ] 所有数字均从 DB 实时聚合,**不**缓存(强制 `force-dynamic`)
- [ ] Dashboard `published` 文章数 ≠ 总文章数(P1-7 验证)
- [ ] Analytics `topStores` 数据非空(P1-13 验证:埋点 + 门店至少 1 家有 store_view)
- [ ] Analytics `eventsByType` 至少包含 `pageview` + `click`(P1-12 验证)
- [ ] 折线图 X 轴 = `[startDate..endDate]` 连续日期(P2-4 验证)
- [ ] 任何 API 错误不导致页面 500,显示 inline 错误 + 重试

### 7.5 性能

- [ ] `/api/analytics/stats` P95 ≤ 500ms(30 天,数据量 100k)
- [ ] Dashboard 4 KPI 并行 `Promise.all` 聚合,P95 ≤ 800ms
- [ ] 客户端 fetch 失败重试 1 次(指数退避)

---

## 8. 变更记录 (CHANGELOG)

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-12 | v0 | Dashboard 初版(`page.tsx` 49 行,4 卡片内联) | Coya |
| 2026-06-15 | v0.5 | 拆分 `DashboardKpiCards` / `DashboardContentHealth` 等 5+ 组件 | Coya |
| 2026-06-16 | v0.6 | `/admin/analytics` 接入 recharts,4 张图表 + 7/30/90 切换 | Coya |
| 2026-06-19 | v0.8 | 审计发现 P1-7 / P1-8 / P1-12 / P1-13 / P2-4 | Coya |
| 2026-06-20 | v1 | 合并 `/admin` + `/admin/analytics` 一份 PRD;完整规格化 + P1-12/13/7/P2-4 修复方案 + DoD | Coya |

---

## 附录 A: 已知 P0 / P1 关联(2026-06-19 审计 §12)

| ID | 问题 | 修复方向 | 优先级 |
|---|---|---|---|
| P1-7 | Dashboard 文章分类 Top 5 未过滤草稿 | `getDashboardSummary` 加 `status='published'` | P0 |
| P1-8 | 整站预约埋点 0 | 间接 P1-12 修复(click 埋点恢复后预约 form_submit 也会恢复) | P1 |
| P1-12 | 695 PV vs ~5 click 严重失衡 | 全站 Button/Link 自动 click 埋点 | P0 |
| P1-13 | 热门门店 Top 10 完全空 | 1. `/agent/store/[id]` 加 store_view 埋点<br>2. `topStores` 查询 join Store(已实现) | P0 |
| P2-4 | 折线图日期不连续 | 后端补 0 行 / 前端 recharts type=category | P1 |
| P2-4b | 文章作者 = "系统管理员" | NewsItem 加 authorId(本 PRD **不**含,在 NEWS PRD 处理) | P2 |

完整: [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md §12](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md)

---

## 附录 B: 权限矩阵

| 操作 | admin | editor | 未登录 |
|---|---|---|---|
| 访问 `/admin` Dashboard | ✅ | ✅ (只读) | ❌ → login |
| 访问 `/admin/analytics` | ✅ | ❌ → 重定向 `/admin` | ❌ → login |
| GET `/api/analytics/stats` | ✅ | ❌ → 403 | ❌ → 401 |
| POST `/api/analytics/track`(客户端埋点) | ✅ (匿名也允许,限流 60/min/IP) | ✅ | ✅ |

详见 [../../../src/types/next-auth.d.ts](../../../src/types/next-auth.d.ts)

---

## 附录 C: 相关文档

- [../00_MASTER_PRD.md](../00_MASTER_PRD.md) §4.2 / §5.3
- [../../../src/lib/admin-dashboard.ts](../../../src/lib/admin-dashboard.ts) — Dashboard 聚合
- [../../../src/app/api/analytics/stats/route.ts](../../../src/app/api/analytics/stats/route.ts) — Analytics API
- [../../../src/lib/analytics.ts](../../../src/lib/analytics.ts) — 客户端埋点
- [../../database/SCHEMA.md](../../database/SCHEMA.md) — AnalyticsEvent / Article / Store / ActivityLog
- [../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md](../cross-cutting/AUDIT_AND_REGRESSION_PRD_2026-06-19.md) §12
- [../_templates/admin.md](../_templates/admin.md) — 后台模板

---

## 附录 D: 子任务拆分建议(本轮 `/build` 直接消费)

按 ZEEKR build 模式,每个修复独立 commit + RED→GREEN→回归:

| # | 任务 | 文件 | 估时 |
|---|---|---|---|
| T1 | P1-7 修复:`getDashboardSummary` 加 `status='published'` 过滤 | `src/lib/admin-dashboard.ts` | 30min |
| T2 | P1-13 修复:`/agent/store/[id]` 加 `store_view` 埋点 | `src/app/agent/store/[id]/page.tsx` | 20min |
| T3 | P1-13 验证:`topStores` join Store 已实现,补 Playwright 断言 | `e2e/audit-full-site.spec.ts` | 30min |
| T4 | P1-12 修复:`Button` / `Link` 自动 click 埋点 | `src/components/ui/button.tsx` + `src/components/ui/link.tsx` | 2h |
| T5 | P2-4 修复:折线图日期连续性 | `src/app/api/analytics/stats/route.ts` + `analytics/page.tsx` | 1h |
| T6 | Analytics 限流(防刷) | `src/app/api/analytics/stats/route.ts` | 30min |
| T7 | Dashboard loading 骨架屏 | 已实现,无需新增 | 0 |
| T8 | 三视口截图 + Lighthouse 复跑 | `scripts/audit/screenshot-all.mjs --with-admin` | 20min |