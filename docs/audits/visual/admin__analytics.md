# /admin/analytics — 数据分析

**截图:** `docs/audits/screenshots/admin/{desktop,tablet,mobile}/admin__analytics.png`
**截图数:** 3(三视口)
**采集时间:** 2026-06-19 16:21 / 16:22 / 16:23
**生成依据:** real screenshot (调用 /api/analytics/stats)
**HTTP 状态:** 200 (登录后)

---

## 视觉评估

### 整体布局

| 区块 | 内容 | 评价 |
|---|---|---|
| 标题 | 数据分析 | 简洁 |
| 时间范围 | 最近 7天 / 最近 30天(orange 选中) / 最近 90天 | 三选一切换器 |
| 4 KPI 卡 | 总 PV 692 / 总事件 695 / 门店访问 0 / 预约次数 0 | 与 dashboard 类似 |
| 每日 PV 趋势 | 平滑折线图 + 横轴日期 + 纵轴 0-240 | 视觉清晰 |
| 事件类型分布 | 柱状图:页面浏览 700 / 点击 ~5 | 严重失衡 |
| 热门页面 Top 10 | 横向条形图 + 路径 | 10 条都有数据 |
| 热门门店 Top 10 | 横向条形图(空) | empty state |

### 设计系统

- **图表库:** SVG 自绘(平滑曲线 + 柱状 + 横条形)
- **配色:** orange-500 主色,数据可视化一致
- **图例:** 在图表下方,无复杂交互
- **空状态:** "热门门店 Top 10" 框内空白但无文字说明 → UI 不够友好

### 三视口响应式

| 视口 | 表现 |
|---|---|
| Desktop 1440 | 4 KPI 横排 + 2×2 图表网格 |
| Tablet 768 | KPI 2×2,图表仍 2 列 |
| Mobile 390 | KPI 单列,图表单列,横轴日期自动稀疏 |

---

## 数据发现

### ✅ Top 10 热门页面 — 数据健康

| 排名 | 路径 | 浏览量 |
|---|---|---|
| 1 | /agent | 80 |
| 2 | /product | ~60+ |
| 3 | / | ~50+ |
| 4 | /news | ~50 |
| 5 | /product/electric-steps | ~40 |
| 6 | /brand | ~30+ |
| 7 | /product/window-film | ~25 |
| 8 | /agent/guangdong | ~20 |
| 9 | /product/xiaomi | ~20 |
| 10 | /agent/jiangsu | ~15 |

**分析:**
- `/agent` 第一 → 公开站 agent 列表流量最高,SEO 成功
- `/product` 和 `/` 前三 → 合理(总入口)
- `/news` 第四 — 与实际"已发布文章 8 条"匹配
- `/product/electric-steps` 进入前 5 → 该专题页内容质量高

### ⚠️ P1-12:事件类型严重失衡 — 695 页面浏览 vs ~5 点击

**截图证据:** 事件类型分布柱状图显示:
- 页面浏览: ~700 (695 总事件的主要组成)
- 点击: ~5 (几乎为零)

**严重性:** 用户在站内浏览了 695 个页面,但仅触发 5 次 click 事件 → **点击埋点几乎全部失效**。

**根因推测:**
1. `src/lib/analytics.ts` 的 `track('click', ...)` 调用点极少 — 大多数按钮/链接没有 onClick
2. 全站 Button / Link 组件没统一包一层 track
3. 埋点 schema `type` 白名单限制 → 检查 `/api/analytics/track/route.ts`

**影响:**
- 看不出转化漏斗
- /admin/dashboard 的"本月预约 0"也是同样根因(无点击事件 → 无预约事件)
- ROI 无法衡量

**修复建议:**
```tsx
// src/components/ui/button.tsx 加自动 click 埋点
'use client';
export function Button({ onClick, ...props }) {
  const handleClick = (e) => {
    track('click', { label: props['aria-label'] || props.children });
    onClick?.(e);
  };
  return <button onClick={handleClick} {...props} />;
}
```

**优先级:** P1(埋点是运营决策核心)

### ⚠️ P1-13:热门门店 Top 10 完全空数据

**截图证据:** 图表框内空白,无任何条形,但其他三个图表正常渲染。

**根因推测:**
1. `/api/analytics/stats` 的 `topStores` 查询条件不正确(可能过滤了 status='published',但 stores 全是 draft,见 P0-6)
2. 埋点 schema 没 `entityType: 'store'` 区分
3. `/agent/store/[id]` 页面无埋点

**关联:** 与 P0-6 测试门店数据相互强化 — 测试数据草稿状态 → 过滤后为空 → Top 10 没数据。

**修复路径:**
1. 修复 P0-6(清理 stores + 加 status 过滤)
2. 在 `/agent/store/[id]` 页面 `useEffect` 加 `track('store_view', { id })`
3. /api/analytics/stats 的 topStores join PageView table 加 `WHERE type='store_view'`

**优先级:** P1(数据可用性)

### ⚠️ P2-4:折线图日期不连续

**截图证据:** X 轴显示 `06-09 / 06-10 / 06-11 / 06-13 / 06-14 / 06-15 / 06-16 / 06-19` — **跳过了 06-12 和 06-17、06-18**。

**可能解释:**
1. 真无数据(那几天没访问)— 应该显示 0 而非跳过
2. 渲染逻辑跳过了 0 数据日 → 不合理,会让用户以为有数据缺失

**优先级:** P2(图表完整性)

---

## 功能验证

| 项目 | 结果 | 证据 |
|---|---|---|
| 时间范围切换器 | ✅ | 7d / 30d / 90d 三选项 |
| KPI 卡渲染 | ✅ | 4 卡均显示数字 |
| 折线图 | ✅ | 平滑曲线,SVG 自绘 |
| 柱状图 | ✅ | 事件类型分布 |
| Top 10 列表 | ⚠️ 部分 | 热门页面有数据,热门门店空 |
| 时间范围联动 | ⚠️ 未实测 | 点击应触发重新查询 |
| 数据导出 | ❌ | UI 暂未见导出按钮 |

---

## 与 Dashboard 数据一致性

| 指标 | /admin (Dashboard) | /admin/analytics | 一致性 |
|---|---|---|---|
| 本月访问 (PV) | 692 (desktop) | 692 (总 PV) | ✅ |
| 本月预约 | 0 | 0 (预约次数) | ✅ |
| 活跃门店 | 22 | (analytics 不显示) | N/A |
| 已发布文章 | 8 | (analytics 不显示) | N/A |

**两页面数据口径一致**,Dashboard 是 analytics 的子集摘要 → 设计合理。

---

## 性能观察

| 操作 | 响应时间 |
|---|---|
| GET /admin/analytics | 1809ms (首次) → 114ms (tablet 缓存) → 61ms (mobile 缓存) |
| GET /api/analytics/stats?... | 22-172ms |

**首屏 ~1.8s**,缓存后 < 200ms — 可接受。

---

## 结论

**总评:** ⭐⭐⭐ (3/5) — 图表美观,但数据严重失衡
**可视化品质:** 高 — SVG 图表专业美观
**数据完整性:** 中 — Top 页面有,Top 门店空
**埋点健康度:** 低 — click / store_view / booking 三类事件几乎为零
**改进重点:**
1. P1-12:全站 click 自动埋点(Button / Link 包装)
2. P1-13:store_view 埋点 + 修复 topStores 查询
3. P2-4:折线图日期连续性(显示 0 而非跳过)

---

## 相关 /build 任务

- **B7:** 全站 Button/Link 自动 click 埋点
- **B8:** /agent/store/[id] 加 store_view 埋点
- **B9:** 折线图日期连续显示(0 值不跳过)