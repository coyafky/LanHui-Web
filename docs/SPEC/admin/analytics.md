# SPEC: Admin 行为分析 Analytics

> 对应 PRD：`docs/PRD/admin/ANALYTICS_SYSTEM_PRD.md`
> 关联 API SPEC：`docs/SPEC/api/analytics.md`
> 实现状态：🔧 **部分完成**

---

## 1. 职责范围

管理后台 `/admin/analytics` 分析页面。展示核心经营 KPI、产品/专题兴趣排行、热门文章/门店排行、咨询渠道分布、趋势图表和数据健康状态。

不包含：Dashboard 摘要（归 `dashboard.md`）、埋点采集 API（归 `api/analytics.md`）。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin/analytics` | page (force-dynamic) | 行为分析首页 | ✅ |

## 3. 数据模型

### StatsData（`src/app/admin/(dashboard)/analytics/page.tsx`）

```typescript
interface StatsData {
  totalEvents: number;                          // 总事件数
  eventsByType: { type: string; count: number }[];  // 按类型分组
  topPages: { pathname: string; count: number }[];   // 热门页面
  topStores: { storeId: string; storeName: string; count: number }[]; // 热门门店
  dailyTrend: { date: string; count: number }[];     // 每日趋势
}

type RangeOption = '7d' | '30d' | '90d';        // 时间范围
```

### 核心指标（PRD §8 定义，待实现）

| 指标 | 计算方式 | 状态 |
|------|---------|------|
| PV | `page_view` 事件计数 | ✅ 部分（当前统计全部事件） |
| 产品兴趣次数 | `product_view` 事件计数 | ⬜ 未实现独立事件 |
| 专题兴趣次数 | `topic_view` 事件计数 | ⬜ 未实现独立事件 |
| 文章阅读次数 | `article_view` 事件计数 | ⬜ 未实现独立事件 |
| 门店查看次数 | `store_view` 事件计数 | ✅ 基础统计 |
| 咨询意向次数 | `contact_click + navigation_click + form_submit_success` | ⬜ 未实现 |

### 事件字典（PRD §6 定义，待实现）

| 事件 | 业务意义 | 状态 |
|------|---------|------|
| `page_view` | 页面浏览 | ✅ |
| `product_view` | 产品兴趣 | ⬜ |
| `topic_view` | 车型专题兴趣 | ⬜ |
| `article_view` | 文章阅读 | ⬜ |
| `store_view` | 门店兴趣 | ✅ 部分（埋点缺失） |
| `contact_click` | 咨询意向 | ⬜ |
| `navigation_click` | 到店意向 | ⬜ |
| `form_submit_success` | 有效提交 | ⬜ |

## 4. 页面模块

### 4.1 时间范围选择器

- 支持：最近 7 天 / 30 天 / 90 天
- 所有卡片和图表使用同一时间范围
- 切换后显示加载状态，失败保留旧数据 + 重试

### 4.2 KPI 卡片区

| 卡片 | 指标 | 状态 |
|------|------|------|
| PV | 总事件数 | ✅ 部分（当前 = 全部事件非仅 page_view） |
| 产品/专题兴趣 | product_view + topic_view | ⬜ |
| 门店查看 | store_view | ✅ 部分 |
| 咨询意向 | contact_click + navigation_click + form_submit | ⬜ |

### 4.3 趋势图

- 每日趋势折线图（Recharts LineChart）
- 可切换指标（PV / 产品兴趣 / 门店查看 / 咨询意向）
- 不允许同一图堆叠过多折线

### 4.4 兴趣排行

| 排行 | 维度 | 状态 |
|------|------|------|
| 产品线 Top 6 | product_key + 事件计数 | ⬜ |
| 车型专题排行 | topic_key + 事件计数 | ⬜ |
| 热门页面 | pathname + 事件计数 | ✅ |

### 4.5 内容排行

- 热门文章 Top 10
- 显示标题、分类、阅读次数
- 咨询贡献（数据具备时）

### 4.6 门店排行

- 热门门店 Top 10
- 显示门店名、省市、等级、查看次数
- 状态：✅ 部分（数据为空因 store_view 埋点缺失，P1-13）

### 4.7 咨询渠道

- 微信 / 电话 / 导航 / 表单分布
- 状态：⬜ 未实现

### 4.8 数据健康

- 最近成功接收事件时间
- 各核心事件 24h 数量
- 未识别事件数量
- 缺少实体 ID 的事件数量
- 埋点长期为零的页面/模块提示
- 状态：⬜ 未实现

## 5. 关键组件

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| 分析页面 | `src/app/admin/(dashboard)/analytics/page.tsx` | 是 | 主页面，全量逻辑内联 |

当前分析页面内联所有 Recharts 逻辑，未拆分为独立组件。未来视复杂度决定是否提取 `AnalyticsKpiCards`、`AnalyticsTrendChart` 等子组件。

## 6. 筛选与 URL 持久化

### 6.1 筛选维度（待实现）

- 时间范围
- 产品线
- 车型专题
- 文章分类
- 门店省份/城市/等级
- 咨询渠道

### 6.2 联动规则

- 选择省份后，城市只显示下属城市
- 选择产品线时，排行和趋势只统计对应产品
- 筛选条件同步 URL searchParams
- 无结果展示筛选摘要 + "清除筛选"
- 清除筛选恢复全局数据

## 7. Loading / Error 边界

| 状态 | 行为 |
|------|------|
| 首次加载 | 骨架屏（KPI 卡片 + 图表占位） |
| 切换时间范围 | 保留旧数据 + 局部加载指示 |
| 无数据 | 说明未积累数据 + 埋点检查入口 |
| 筛选无结果 | 筛选摘要 + "清除筛选" |
| 查询失败 | 保留旧数据 + 错误提示 + 重试 |
| 部分模块失败 | 其他模块继续，失败模块单独提示 |
| 无权限 | 403 或重定向 |

## 8. 与当前实现的差距

当前已有：
- 总事件数和事件类型统计
- 热门页面和门店排行
- 7/30/90 天趋势图
- 客户端缓冲 + Beacon 发送

当前不足（来自 PRD §15）：
- 事件类型过宽，`click` 不能表达产品兴趣
- 无独立 `product_view/topic_view/article_view/contact_click/navigation_click`
- 热门页面混入不同事件类型
- 趋势统计的是全部事件，非仅 page_view
- 无产品线/专题排行
- 无咨询渠道分布
- 无数据健康模块
- IP 被写入数据库（隐私策略待定义）

## 9. 验收条件

### 功能验收

- [ ] AC1: 7/30/90 天切换正确，所有卡片使用同一时间范围
- [ ] AC2: 4 个 KPI 卡片独立展示，一个失败不影响其他
- [ ] AC3: 产品线排行 Top 6 + 占比
- [ ] AC4: 车型专题排行 + 占比
- [ ] AC5: 热门文章 Top 10 + 分类 + 阅读次数
- [ ] AC6: 热门门店 Top 10 + 省市 + 等级 + 查看次数
- [ ] AC7: 咨询渠道分布（微信/电话/导航/表单）
- [ ] AC8: 筛选联动正确，条件同步 URL

### 状态验收

- [ ] AC9: 首次加载骨架屏，无布局抖动
- [ ] AC10: 部分数据源失败不影响其他模块
- [ ] AC11: 无数据时显示友好提示，不报错
- [ ] AC12: 筛选无结果显示摘要 + 清除按钮
- [ ] AC13: 数据健康模块显示埋点状态

### 事件验收

- [ ] AC14: 每项指标只统计对应事件类型
- [ ] AC15: 产品/专题/文章/门店详情产生正确语义事件
- [ ] AC16: 咨询事件带 channel 和触发区域
- [ ] AC17: 分母为 0 时不报错，显示"暂无足够数据"

## 10. 已知问题

- [P1-12] 埋点严重失衡：695 PV vs ~5 click，全站 Button/Link 无自动语义事件
- [P1-13] 热门门店 Top 10 为空：store_view 埋点缺失
- 分析页面当前未拆分组件，所有逻辑内联在 page.tsx
- 指标口径当前混用（totalEvents 包含所有 type，非仅 page_view）
- 当前无产品线/车型专题维度数据

---

> 最后更新: 2026-06-22

## 11. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-21 | Claude Code | 分析页面初始实现（KPI + 趋势 + 排行） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | 跟踪 PRD §15 差距逐步实现 |
