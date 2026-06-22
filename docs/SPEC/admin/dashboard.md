# SPEC: Admin 仪表盘 Dashboard

> 对应 PRD：`docs/PRD/admin/README.md` · `docs/PRD/cross-cutting/PERFORMANCE_OPTIMIZATION_PRD_2026-06-20.md`（加载性能相关）
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

管理后台首页。展示核心 KPI、内容健康度、门店网络概览、最近活动、流量趋势。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin` | page (force-dynamic) | 仪表盘首页 | ✅ |

## 3. 数据模型 (`src/lib/admin-dashboard.ts`)

```typescript
interface DashboardKpi {
  totalStores: number;
  totalArticles: number;
  totalPageViews: number;
  establishedYears: number;
}
interface ContentHealth { storesByStatus, articlesByStatus }
interface StoreNetwork { totalProvinces, totalCities, storesByProvince[] }
interface RecentActivity { activities: RecentActivityItem[] }
```

## 4. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| DashboardKpiCards | `src/components/admin/DashboardKpiCards.tsx` | 否 | 4 个 KPI 指标卡 |
| DashboardContentHealth | `src/components/admin/DashboardContentHealth.tsx` | 否 | 内容状态统计 |
| DashboardQuickActions | `src/components/admin/DashboardQuickActions.tsx` | 否 | 快捷操作链接 |
| DashboardRecentActivity | `src/components/admin/DashboardRecentActivity.tsx` | 否 | 最近活动列表 |
| DashboardStoreNetwork | `src/components/admin/DashboardStoreNetwork.tsx` | 否 | 门店网络概览 |
| DashboardTrendChart | `src/components/admin/DashboardTrendChart.tsx` | 是 | 流量趋势折线图（Recharts） |

## 5. 数据来源

`admin-dashboard.ts` → 直接 Prisma 读取（非 API route），返回 `{ ok, data?, error? }` 包装。

## 6. 已知问题

### [P1-13] 热门门店 Top10 为空

**问题描述**：仪表盘右上角「热门门店 Top10」卡片始终显示空数据。

**根因**：
- 埋点缺失：前端 `store_view` 事件未接入埋点系统（`analytics.ts`）
- 数据层：`getKpiSnapshot()` 和 `getStoreNetwork()` 均不涉及门店访问量统计
- DB 层：`analyticsEvent` 表中 `type='store_view'` 记录数为 0

**影响范围**：
| 维度 | 说明 |
|------|------|
| 用户体验 | Top10 卡片始终显示空白/0 数据，失去参考价值 |
| 数据分析 | 无法追踪门店热度分布，无法支撑运营决策 |
| 指标准确性 | 热门门店统计直接依赖埋点数据，无埋点则永为 0 |

**修复思路**（待实现）：
1. 前端：在门店详情页 / 列表页添加 `trackEvent("store_view", { storeId })` 调用
2. 后端：在 `admin-dashboard.ts` 中新增 `getTopStores(limit=10)` 查询函数，按 `type='store_view'` 分组计数
3. 注：埋点数据需要积累后才显示有意义的排名

### [P2] 所有活动日志的 actor="系统管理员"

**问题描述**：`RecentActivity` 列表中所有活动的 `actorName` 均显示为"系统管理员"。

**根因**：`activityLog.actorId` 字段可能为 `null` 或映射到固定的系统用户 ID，导致 `log.actor?.name ?? log.actor?.username` 始终解析为系统管理员名称。

### [P2] 无 loading/error 边界组件

**问题描述**：仪表盘各卡片组件（KpiCards、ContentHealth 等）未实现独立的 loading skeleton 和 error fallback。

**影响**：任一数据源查询失败会导致整个卡片区域空白或报错，且无重试机制。详见 §7。

## 7. Loading / Error 边界要求

仪表盘由 6 个独立数据卡片组成，每个卡片应有自己的 loading 和 error 状态，避免单个数据源失败拖垮整个页面。

### 通用规范

| 状态 | 行为 | 实现方式 |
|------|------|----------|
| **Loading** | 显示骨架屏（skeleton），高度与内容区一致 | `animate-pulse` + Tailwind `bg-muted` 占位块 |
| **Error** | 显示错误提示 + 重试按钮 | `<ErrorState message={...} onRetry={refetch} />` 组件 |
| **Empty** | 显示空状态提示 | `<EmptyState message={...} />` 组件（无数据时的友好提示） |
| **Success** | 正常渲染数据 | 各组件自身渲染逻辑 |

### 组件级边界要求

| 组件 | Loading 形态 | Error fallback | 备注 |
|------|-------------|---------------|------|
| `DashboardKpiCards` | 4 个 skeleton 卡片（grid 2×2） | "KPI 数据加载失败" + 重试 | 数据最小，优先渲染 |
| `DashboardContentHealth` | 2 个 skeleton 环形占位 + 列表占位 | "内容健康度加载失败" + 重试 | 聚合查询可能较慢 |
| `DashboardStoreNetwork` | 地图区域 skeleton | "门店网络数据加载失败" + 重试 | 依赖省市区数据 |
| `DashboardRecentActivity` | 5 行 skeleton 列表项 | "最近活动加载失败" + 重试 | 数据量大时可能延迟 |
| `DashboardTrendChart` | 折线图区域 skeleton | "流量趋势加载失败" + 重试 | Client Component，注意 SSR 降级 |
| `DashboardQuickActions` | 无需 loading（纯静态链接） | 不适用 | 无数据依赖 |

### 全局兜底

`getDashboardSummary()` 使用 `Promise.allSettled` 并行获取所有数据，部分失败不影响其他卡片展示。各卡片消费者应处理 `data === null` 的情况。

### 重试策略

| 场景 | 行为 |
|------|------|
| 首次失败 | 显示 error fallback + "重试"按钮 |
| 重试再失败 | 保留 error 状态，提示"请稍后再试" |
| 连续失败 3 次 | 静默停止自动重试，仅保留手动重试按钮 |
| 数据源恢复 | 用户手动重试或刷新页面 |

## 8. 验收条件

### 功能验收

- [ ] AC1: 仪表盘加载时正确显示骨架屏，无布局抖动（CLS < 0.1）
- [ ] AC2: 6 个数据卡片独立加载，一个失败不影响其他卡片展示
- [ ] AC3: 数据加载失败时显示可读的错误信息和重试按钮
- [ ] AC4: 热门门店 Top10 无数据时显示空状态提示，不报错
- [ ] AC5: 所有活动日志显示真实的 actor 名称（非"系统管理员"）
- [ ] AC6: 门店网络按省份计数正确，包含 active/inactive 区分
- [ ] AC7: 流量趋势图 (Recharts) 在移动端正常显示，无水平滚动
- [ ] AC8: 快捷操作链接可正确导航到对应页面

### 性能验收

- [ ] AC9: 首页首屏渲染 < 2s (localhost, 4x throttling)
- [ ] AC10: KPI 数据查询响应 < 500ms
- [ ] AC11: 非首屏卡片（趋势图、活动日志）懒加载或延迟渲染

### 错误场景验收

- [ ] AC12: DB 不可用时各卡片正确显示 error fallback，页面不白屏
- [ ] AC13: 部分数据源超时不阻塞其他卡片渲染
- [ ] AC14: 重试按钮可正确重新请求该卡片数据

---

> 最后更新: 2026-06-22

## 9. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-19 | Claude Code | 仪表盘初始实现（KPI 卡片 + 内容健康度 + 流量趋势图） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 补充：loading/error 边界、验收条件、P1-13 详细说明 | 完成 | — |
