# SPEC: Admin 行为分析 Analytics

> 对应 PRD：`docs/PRD/admin/ANALYTICS_SYSTEM_PRD.md`
> 关联 API SPEC：`docs/SPEC/api/analytics.md`
> 实现状态：🔧 **部分完成（v1.0 现状 2026-06-24 校正）**

---

## 0. 校正说明

本文档原版本（2026-06-22）多处标注"未实现 ⬜"，本次按当前代码事实校正：

- ✅ 已实现但未在 SPEC 体现的部分：**已标记**
- ❌ PRD §15 列举的"当前不足"：**保留并精确化**
- 🆕 本次新增 **§12 图表选型知识模块**（基于第一性原理的 BI 图表决策表）
- 🆕 本次新增 **§13 客户端事件接入点矩阵**（明确每个埋点的页面/组件落位）

---

## 1. 职责范围

管理后台 `/admin/analytics` 分析页面。展示核心经营 KPI、产品/专题兴趣排行、热门文章/门店排行、咨询渠道分布、趋势图表和数据健康状态。

不包含：Dashboard 摘要（归 `dashboard.md`）、埋点采集 API（归 `api/analytics.md`）。

## 2. 路由

| 路径 | 类型 | 说明 | 状态 |
|------|------|------|------|
| `/admin/analytics` | page (force-dynamic) | 行为分析首页 | ✅ |

## 3. 数据模型

### 3.1 StatsData（当前实现，`src/app/admin/(dashboard)/analytics/page.tsx:21`）

```typescript
interface StatsData {
  totalEvents: number;                                  // 总事件数
  eventsByType: { type: string; count: number }[];       // 按类型分组（5 个白名单事件）
  topPages: { pathname: string; count: number }[];       // 热门页面 Top 10（混入所有事件）
  topStores: { storeId: string; storeName: string; count: number }[]; // 热门门店 Top 10
  dailyTrend: { date: string; count: number }[];         // 每日趋势（当前 = 全事件）
}

type RangeOption = '7d' | '30d' | '90d';                 // 时间范围
```

### 3.2 StatsData（目标 v1.1，PRD §8/§9）

```typescript
interface AnalyticsStats {
  range: { startDate: string; endDate: string; days: 7 | 30 | 90 };
  kpis: {
    pv: number;                          // page_view 计数
    productInterest: number;             // product_view 计数
    topicInterest: number;               // topic_view 计数
    articleReads: number;                // article_view 计数
    storeViews: number;                  // store_view 计数
    contactIntent: number;               // contact_click + navigation_click + form_submit_success
    conversionRate: {                    // 事件比率（无 sessionId 时的口径）
      productInterestRate: number | null;    // (productInterest+topicInterest) / pv
      storeInterestRate: number | null;      // storeViews / (productInterest+topicInterest)
      contactRate: number | null;            // contactIntent / storeViews
    };
  };
  productRanking: { productKey: ProductKey; productName: string; count: number; share: number }[];   // Top 6
  topicRanking:   { topicKey: TopicKey; topicName: string; count: number; share: number }[];         // Top 6
  articleRanking: { articleId: string; title: string; category: string; views: number; contactContrib?: number }[]; // Top 10
  storeRanking:   { storeId: string; storeName: string; province: string; city: string; level: string; views: number; contacts: number }[]; // Top 10
  channelDist:    { channel: 'wechat' | 'phone' | 'navigation' | 'form'; count: number; share: number }[];
  trend: { date: string; pv: number; productInterest: number; topicInterest: number; storeViews: number; contactIntent: number }[];
  health: {
    lastEventAt: string;                              // ISO8601, 最近一次成功写入
    last24hByType: Record<string, number>;            // 各核心事件 24h 计数
    unknownTypeCount: number;                         // type 不在白名单内的事件数
    missingEntityCount: number;                       // product/topic/article/store_view 缺 entityId 的事件数
    zeroEvents: { pathname: string; type: string }[]; // 长期（7d+）零事件的页面或模块
  };
}
```

### 3.3 核心指标实现状态

| 指标 | 计算方式 | 当前状态 | v1.1 目标 |
|------|---------|:---:|:---:|
| PV | `page_view` 事件计数 | 🟡 混入全事件（`type='pageview'`，但数据少） | ✅ 仅 page_view |
| 产品兴趣次数 | `product_view` 事件计数 | ❌ 事件未定义 | ✅ |
| 专题兴趣次数 | `topic_view` 事件计数 | ❌ 事件未定义 | ✅ |
| 文章阅读次数 | `article_view` 事件计数 | ❌ 事件未定义 | ✅ |
| 门店查看次数 | `store_view` 事件计数 | 🟡 聚合存在，**埋点缺失 → 数据为空**（P1-13） | ✅ |
| 咨询意向次数 | `contact_click + navigation_click + form_submit_success` | ❌ 事件未定义 | ✅ |

### 3.4 事件字典实现状态

| 事件 | 业务意义 | 当前 SDK | 当前 Track API | 当前埋点接入 | v1.1 目标 |
|------|---------|:---:|:---:|:---:|:---:|
| `pageview` | 页面浏览 | ✅ `trackPageView` | ✅ 白名单 | ✅ `AnalyticsProvider` 自动 | 改名为 `page_view` |
| `click` | 通用点击 | ✅ `trackClick` | ✅ 白名单 | 🟡 仅 4 处（PhoneCta + 3 个 AnchorNav） | 保留为辅助诊断，不进 KPI |
| `form_submit` | 表单提交 | ✅ `trackFormSubmit` | ✅ 白名单 | ❌ 0 处实际调用 | 保留 + 新增 `form_submit_success` |
| `reservation` | 预约 | ✅ `trackReservation` | ✅ 白名单 | ❌ 0 处调用 | 视业务决定保留/废弃 |
| `store_view` | 门店兴趣 | ✅ `trackStoreView` | ✅ 白名单 | ❌ **P1-13 埋点缺失** | ✅ 接入 `agent/store/[id]` |
| `product_view` | 产品兴趣 | ❌ | ❌ | ❌ | ✅ 新增 + 接入 6 个产品线页 |
| `topic_view` | 车型专题 | ❌ | ❌ | ❌ | ✅ 新增 + 接入 wenjie/xiaomi/zeekr/flooring |
| `article_view` | 文章阅读 | ❌ | ❌ | ❌ | ✅ 新增 + 接入 `news/[slug]` |
| `contact_click` | 咨询意向 | ❌ | ❌ | ❌ | ✅ 新增 + 接入微信/电话 |
| `navigation_click` | 到店意向 | ❌ | ❌ | ❌ | ✅ 新增 + 接入导航按钮 |
| `form_submit_success` | 有效提交 | ❌ | ❌ | ❌ | ✅ 新增 + 接入成功回调 |

## 4. 页面模块

### 4.1 时间范围选择器

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|---|
| 支持 7d / 30d / 90d | ✅ 已实现 | ✅ |
| 所有卡片和图表使用同一时间范围 | ✅ | ✅ |
| 切换后保留旧数据 + 显示局部加载 | 🟡 当前是全屏骨架屏 | ✅ 保留旧数据 |
| 失败保留旧数据 + 重试 | 🟡 当前显示错误条但无重试按钮 | ✅ 重试按钮 |
| URL 持久化 | ❌ 仅 state，刷新丢失 | ✅ `?range=30d` 写入 URL |
| 默认值 | `30d` | `30d` |

### 4.2 KPI 卡片区

| 卡片 | 指标 | 当前状态 | v1.1 目标 |
|------|------|:---:|:---:|
| PV | page_view 计数 | 🟡 混入全事件 | ✅ |
| 产品/专题兴趣 | product_view + topic_view | ❌ | ✅ |
| 门店查看 | store_view | 🟡 埋点缺失 | ✅ |
| 咨询意向 | contact_click + navigation_click + form_submit_success | ❌ | ✅ |
| 卡片独立失败 | 4 卡共享 try/catch | ❌ | ✅ 每个卡独立 try/catch |
| 骨架屏 | ✅ CardSkeleton 已实现 | ✅ |

### 4.3 趋势图

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|:---:|
| 每日趋势折线图（Recharts LineChart） | ✅ 已实现 | ✅ |
| 指标切换（PV / 产品兴趣 / 门店查看 / 咨询意向） | ❌ 固定全事件 | ✅ 切换器（下拉或 Tab） |
| 不堆叠过多折线 | ✅ | ✅ |
| 无数据日期补 0 | 🟡 当前只返回有数据日期 | ✅ 后端补 0 或前端补 |
| 单图多指标 | ❌ 单线 | ❌ 维持单线（PRD §9.3） |

### 4.4 兴趣排行

| 排行 | 维度 | 当前状态 | v1.1 目标 |
|------|------|:---:|:---:|
| 产品线 Top 6 | productKey + 计数 + 占比 | ❌ | ✅ HorizontalBar |
| 车型专题 Top 6 | topicKey + 计数 + 占比 | ❌ | ✅ HorizontalBar |
| 热门页面 Top 10 | pathname + 计数 | ✅ 已实现 | ✅ 但需修正为仅 `page_view` |

### 4.5 内容排行

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|:---:|
| 热门文章 Top 10 | ❌ | ✅ |
| 标题 + 分类 + 阅读次数 | ❌ | ✅ |
| 咨询贡献（contact_click.metadata.articleId 关联） | ❌ | ✅ 数据具备时显示 |
| 无 article_view 事件时的友好提示 | ❌ | ✅ "尚未积累文章阅读数据，请检查 article_view 埋点" |

### 4.6 门店排行

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|:---:|
| 热门门店 Top 10 | ✅ 已实现（数据为空，P1-13） | ✅ |
| 显示店名 + 省市 + 等级 + 查看次数 | 🟡 当前缺省市 + 等级 | ✅ |
| 显示咨询次数 | ❌ | ✅ |
| 已删除门店保留历史名称 + 标记 | ❌ | ✅ "历史门店已不存在" |

### 4.7 咨询渠道

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|:---:|
| 微信 / 电话 / 导航 / 表单分布 | ❌ | ✅ Donut Chart + 图例 + 数字 |
| 占比计算 | ❌ | ✅ share = count / totalContactIntent |

### 4.8 用户兴趣漏斗（PRD §5 v1.1 新增）

| 层级 | 指标 | 来源事件 |
|------|------|---------|
| L1 访问 | PV | `page_view` |
| L2 内容/产品兴趣 | product_view + topic_view + article_view | 3 类 |
| L3 门店兴趣 | store_view | 1 类 |
| L4 咨询意向 | contact_click + navigation_click + form_submit_success | 3 类 |

→ **FunnelChart**（Recharts `<FunnelChart><Funnel/><LabelList/></FunnelChart>`）

### 4.9 数据健康

| 子项 | 当前状态 | v1.1 目标 |
|------|:---:|:---:|
| 最近成功接收事件时间 | ❌ | ✅ `MAX(timestamp)` |
| 各核心事件 24h 数量 | ❌ | ✅ |
| 未识别事件数量（type 不在白名单） | ❌ | ✅ Track API 已分桶计数，Stats 聚合 |
| 缺少实体 ID 的事件数 | ❌ | ✅ product/topic/article/store_view 但 metadata 缺对应 key |
| 埋点长期为零的页面/模块提示 | ❌ | ✅ 比对产品/专题/文章实体表与埋点计数 |

## 5. 关键组件

### 5.1 当前（v1.0）

| 组件 | 路径 | Client? | 职责 |
|------|------|---------|------|
| `AnalyticsPage` | `src/app/admin/(dashboard)/analytics/page.tsx` | ✅ | 主页面，全量逻辑内联（343 行） |
| `Skeleton` / `CardSkeleton` / `ChartSkeleton` | 同上内联 | ✅ | 骨架屏 |

### 5.2 v1.1 拆分（推荐）

| 组件 | 路径（新增） | Client? | 职责 |
|------|------|---------|------|
| `RangePicker` | `src/components/admin/analytics/RangePicker.tsx` | ✅ | 时间范围 + URL searchParams |
| `FilterBar` | `src/components/admin/analytics/FilterBar.tsx` | ✅ | 7 维筛选 + 联动 + URL 持久化 |
| `KpiCards` | `src/components/admin/analytics/KpiCards.tsx` | ✅ | 4 张数字卡 + 转化率 + 独立 try/catch |
| `TrendChart` | `src/components/admin/analytics/TrendChart.tsx` | ✅ | 指标切换 + 多 key LineChart |
| `RankingList` | `src/components/admin/analytics/RankingList.tsx` | ✅ | 通用排行（产品/专题/文章/门店复用） |
| `ChannelDonut` | `src/components/admin/analytics/ChannelDonut.tsx` | ✅ | 渠道分布 PieChart |
| `InterestFunnel` | `src/components/admin/analytics/InterestFunnel.tsx` | ✅ | L1→L4 FunnelChart |
| `DataHealthPanel` | `src/components/admin/analytics/DataHealthPanel.tsx` | ✅ | 健康状态 + 告警 |

## 6. 筛选与 URL 持久化

### 6.1 筛选维度（v1.1 全部待实现）

| 维度 | 当前状态 | v1.1 实现位置 |
|------|:---:|---|
| 时间范围（7d / 30d / 90d） | 🟡 state，未持久化 | URL `?range=30d` |
| 产品线 | ❌ | URL `?product=electric_steps` |
| 车型专题 | ❌ | URL `?topic=wenjie` |
| 文章分类 | ❌ | URL `?category=brand` |
| 门店省份 | ❌ | URL `?storeProvince=guangdong` |
| 门店城市 | ❌ | URL `?storeCity=shunde` |
| 门店等级 | ❌ | URL `?storeLevel=A` |
| 咨询渠道 | ❌ | URL `?channel=wechat` |
| 测试数据排除 | ❌ | URL `?includeTest=true`（默认 false） |

### 6.2 联动规则（v1.1 待实现）

- 选择省份后，城市下拉只显示 `china-regions.ts` 中该省份下属城市
- 选择产品线时，趋势图和排行只统计该 `productKey`
- 筛选条件同步 URL searchParams，刷新后保持
- 无结果展示「筛选摘要」+「清除筛选」按钮
- 清除筛选恢复当前时间范围的全局数据

### 6.3 当前 URL 同步实现

仅 `range` 在 useState（`page.tsx:76`），无 `useSearchParams`、无 `router.replace`。

## 7. Loading / Error 边界

| 状态 | 行为 | 当前 | v1.1 |
|------|------|:---:|:---:|
| 首次加载 | 骨架屏（KPI 卡片 + 图表占位） | ✅ | ✅ |
| 切换时间范围 | 保留旧数据 + 局部加载指示 | 🟡 全屏 loading（`loading=true` 直接覆盖） | ✅ |
| 无数据 | 说明未积累数据 + 埋点检查入口 | 🟡 显示空图表轴 | ✅ |
| 筛选无结果 | 筛选摘要 + "清除筛选" | ❌ | ✅ |
| 查询失败 | 保留旧数据 + 错误提示 + 重试 | 🟡 错误条但清空 data | ✅ |
| 部分模块失败 | 其他模块继续，失败模块单独提示 | ❌ 一个 catch 全部 | ✅ 模块独立 try/catch |
| 无权限 | 403 或重定向 | ✅（layout.tsx `auth()` 守卫） | ✅ |
| 日期非法 | 阻止查询并恢复默认范围 | ✅（API 校验） | ✅ |

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

## 11. AI 执行记录

| 日期 | AI 会话 | 执行内容 | 完成度 | 剩余工作 |
|------|---------|---------|--------|---------|
| 2026-06-21 | Claude Code | 分析页面初始实现（KPI + 趋势 + 排行） | 完成 | — |
| 2026-06-22 | Claude Code | SPEC 文档创建 | 完成 | 跟踪 PRD §15 差距逐步实现 |
| 2026-06-24 | Claude Code | SPEC v1.1 校正：按当前实现补齐状态（§3.3/3.4/4/6/7）、新增 §12 图表选型知识模块（第一性原理）、新增 §13 事件接入点矩阵 | 完成 | 等待 v1.1 实现授权 |
| TBD | — | v1.1 实现：11 事件字典升级 + 9 聚合 Stats API + 8 子组件拆分 + 6 产品/4 专题/文章/门店/按钮接入 | — | 待 PRD §18 开放问题 1-7 决议 |

---

## 12. 图表选型知识模块（基于第一性原理）

> 本节是设计知识沉淀，用于回答：**"这块数据该用什么图？"**
> 应用范围：未来 `/admin/analytics` 重构 + 其他 admin 页面（如 `/admin/stores` 看板、未来 `/admin/articles` 看板）

### 12.1 第一性原理：BI 图表的 4 个选择维度

每个图表决策必须先回答以下 4 个问题：

1. **变量数量**：1 个 / 2 个 / 多个？
2. **变量类型**：分类（categorical）/ 顺序（ordinal）/ 时间（temporal）/ 数值（numerical）？
3. **比较意图**：构成（part-to-whole）/ 排序（ranking）/ 分布（distribution）/ 趋势（trend over time）/ 关系（correlation）/ 流程（flow）？
4. **认知负荷**：人类视觉系统对**长度**最敏感、对**角度**次之、对**面积**再次、对**颜色**最弱（pre-attentive processing）。

### 12.2 图表决策矩阵

| 比较意图 | 数据类型 | 推荐图表 | Recharts 组件 | 认知原理 | admin/analytics 应用 |
|---|---|---|---|---|---|
| **构成**（部分占整体比例） | 1 分类 + 1 数值 | 🥧 Pie / 🍩 Donut | `<PieChart><Pie/><Cell/></PieChart>` | 角度感知（中等） | ✅ **§4.7 咨询渠道分布**（4 类 wechat/phone/navigation/form） |
| **构成（强调占比）** | 1 分类 + 1 数值 | 🥞 **Stacked Bar / 100% Stacked Bar** | `<BarChart><Bar stackId="a"/></BarChart>` | 长度感知（最强） | 趋势区可加：每日事件类型堆叠（pv/store/contact） |
| **排序**（Top N） | 1 分类 + 1 数值 | 📊 **Horizontal Bar** | `<BarChart layout="vertical">` | 长度感知（最强） | ✅ **§4.4-4.6** 产品/专题/文章/门店排行 |
| **趋势**（时间序列） | 1 时间 + 1 数值 | 📈 **Line** | `<LineChart>` | 斜率 + 长度（强） | ✅ **§4.3 趋势图** |
| **趋势（强调累积）** | 1 时间 + 1 数值 | 🏔️ **Area** | `<AreaChart>` | 面积 = 累积量 | 可选：每日 PV 用面积强调"流量总量" |
| **分布**（取值密度） | 1 数值 + 频次 | 🌄 **Histogram** | `<BarChart>` + binning | 形状感知 | 暂未用 |
| **关系**（2 数值变量） | 2 数值 | 🔵 **Scatter / Bubble** | `<ScatterChart>` | 位置感知 | 暂未用 |
| **流程（顺序流失）** | 多级有序分类 + 数值 | 🔻 **Funnel** | `<FunnelChart><Funnel/><LabelList/></FunnelChart>` | 阶段对比 + 转化率 | ✅ **§4.8 用户兴趣漏斗** L1→L4 |
| **多阶段流量** | 来源 → 目标 + 流量 | 🌊 **Sankey** | 需额外库（d3-sankey） | 流宽 = 量 | 一期不做 |
| **单指标 + 上下文** | 1 数值 | 🔢 **Big Number + Sparkline** | 自定义 + `<LineChart>` 无 axis | 大数字 + 微趋势 | ✅ **§4.2 KPI 卡片**（可加 sparkline） |
| **地理分布** | 地理坐标 + 数值 | 🗺️ **Choropleth Map** | 需额外库（leaflet） | 空间模式 | 一期不做 |
| **多变量并行** | 多个数值 | 🎻 **Heatmap** | 自定义 Cell grid | 颜色密度 | 可选：日期 × 时段热力（未在 PRD 范围） |

### 12.3 admin/analytics v1.1 图表选型清单

按 PRD §9.3 模块顺序排列：

| 模块 | 选定图表 | 备选 | 不选原因 |
|---|---|---|---|
| 4.1 时间范围 | 🔘 按钮组（不是图表） | — | — |
| 4.2 KPI 卡 | 🔢 Big Number（4 卡） + Sparkline | Sparkline | 加 sparkline 让数字带趋势 |
| 4.3 趋势 | 📈 LineChart（单指标 + 切换器） | AreaChart | PRD §9.3 明确"不堆叠过多折线" |
| 4.4 产品/专题 | 📊 HorizontalBar | Pie | 6 项 Top N 用饼图难读排名 |
| 4.5 热门文章 | 📊 HorizontalBar | — | 标题长，横向 bar 容纳性好 |
| 4.6 热门门店 | 📊 HorizontalBar（含省市等级 tooltip） | Table | 表格适合查具体数据，但图表适合快速扫 Top 10 |
| 4.7 咨询渠道 | 🍩 **Donut（带中心总数 + 图例）** | Pie / Stacked Bar | 4 个渠道 + 强 part-to-whole，Donut 中心写总数最直观 |
| 4.8 兴趣漏斗 | 🔻 **FunnelChart + 转化率 LabelList** | 表格 | 4 级顺序流失，Funnel 是教科书答案 |
| 4.9 数据健康 | 🔢 状态徽章 + 数字 tile | — | 状态信息，表格 + 颜色比图表清晰 |

### 12.4 反模式（不该用的图）

| 反模式 | 原因 | admin/analytics 现状 |
|---|---|---|
| 3D Pie | 角度失真，无法判断相对大小 | ❌ 未用 |
| 双 Y 轴折线 | 容易误导（左右刻度不同） | ❌ 未用 |
| 折线 + 柱状叠加 | 双轴问题 | ❌ 未用 |
| 雷达图（>5 维） | 面积错觉 | ❌ 未用 |
| 饼图 + 12+ 切片 | 难辨认 | ❌ 未用 |
| 渐变色块图表 | 颜色 = 第三维度，无第三维度时多余 | ❌ 未用 |
| emoji 装饰 / 数据小图标滥用 | 干扰认知负荷 | ❌ 避免 |

### 12.5 a11y 要求

- 每个图表 `<svg role="img" aria-labelledby="title-id">`
- 提供 `<title id>` + 同等信息的 `<table>` 替代（screen reader 友好）
- 颜色编码必须配合图例文字（不能纯靠颜色区分）
- 键盘可达：图表切换器用 `<button>` + `aria-pressed`，不用 `<div onClick>`

### 12.6 Recharts 版本与组件清单

项目当前 Recharts: 通过 `package.json` 锁定 v2.x（实际版本以 `package-lock.json` 为准）。已确认可用组件：

```
LineChart / Line / XAxis / YAxis / CartesianGrid / Tooltip / ResponsiveContainer / Legend
BarChart / Bar / Cell
PieChart / Pie（v1.1 引入）
FunnelChart / Funnel / LabelList（v1.1 引入）
AreaChart / Area（可选）
```

引入新组件前在 `node_modules/recharts/types/index.d.ts` 验证导出。

## 13. 客户端事件接入点矩阵（v1.1 必落地的埋点）

> 本节回答："每个产品/专题/文章/门店/按钮，到底调哪个 track 函数？"
> 由 `trellis-implement` 阶段强制对照清单执行，避免漏埋。

### 13.1 自动事件（已在 AnalyticsProvider）

| 触发 | 当前 | v1.1 |
|---|:---:|:---:|
| 公开站路由变化 | ✅ `trackPageView` | 改名 `trackPageView` + 注入 `pageType` |
| `/admin/*` 路由 | ✅ 跳过 | ✅ |

### 13.2 详情页语义事件（v1.1 新增）

| 页面 | 文件 | 事件 | 函数 | 实体 key 字段 |
|---|---|---|---|---|
| `/product/electric-steps` | `src/app/product/electric-steps/page.tsx` | `product_view` | `trackProductView('electric_steps', 'page')` | `metadata.productKey` |
| `/product/wheels` | 同类 | `product_view` | `trackProductView('wheels', 'page')` | `metadata.productKey` |
| `/product/chassis` | 同类 | `product_view` | `trackProductView('chassis', 'page')` | `metadata.productKey` |
| `/product/window-film` | 同类 | `product_view` | `trackProductView('window_film', 'page')` | `metadata.productKey` |
| `/product/color-film` | 同类 | `product_view` | `trackProductView('color_film', 'page')` | `metadata.productKey` |
| `/product/ppf` | 同类 | `product_view` | `trackProductView('ppf', 'page')` | `metadata.productKey` |
| `/product/wenjie` | `src/app/product/wenjie/page.tsx` | `topic_view` | `trackTopicView('wenjie', 'page')` | `metadata.topicKey` |
| `/product/xiaomi` | 同类 | `topic_view` | `trackTopicView('xiaomi', 'page')` | `metadata.topicKey` |
| `/product/zeekr` | 同类 | `topic_view` | `trackTopicView('zeekr', 'page')` | `metadata.topicKey` |
| `/product/flooring` | 同类 | `topic_view` | `trackTopicView('flooring', 'page')` | `metadata.topicKey` |
| `/news/[slug]` | `src/app/news/[slug]/page.tsx` | `article_view` | `trackArticleView(article.id, article.category)` | `metadata.articleId` + `metadata.category` |
| `/agent/store/[id]` | `src/app/agent/store/[id]/page.tsx` | `store_view` | `trackStoreView(store.id, store.provinceSlug, store.citySlug, store.level)` | `storeId` + `metadata.{province,city,level}` |

### 13.3 交互事件（v1.1 新增）

| 触发位置 | 文件 | 事件 | 函数 | metadata |
|---|---|---|---|---|
| Header "联系" / "微信" 按钮 | `src/components/Header.tsx` | `contact_click` | `trackContactClick('wechat', 'header', null)` | `{channel: 'wechat', sourceArea: 'header'}` |
| Hero 主 CTA "微信咨询" | `src/components/Hero.tsx` | `contact_click` | `trackContactClick('wechat', 'hero_cta', null)` | `{channel: 'wechat', sourceArea: 'hero_cta'}` |
| 通用 PhoneCta | `src/components/cta/PhoneCta.tsx` | `contact_click` | `trackContactClick('phone', sourceArea, entity)` | `{channel: 'phone', sourceArea, relatedEntity}` |
| 门店详情"电话"按钮 | `src/app/agent/store/[id]/page.tsx` | `contact_click` | `trackContactClick('phone', 'store_detail', storeId)` | 同上 |
| 门店详情"微信"按钮 | 同上 | `contact_click` | `trackContactClick('wechat', 'store_detail', storeId)` | 同上 |
| 门店详情"导航"按钮 | 同上 | `navigation_click` | `trackNavigationClick(storeId, 'store_detail')` | `{storeId, sourceArea: 'store_detail'}` |
| 表单服务端成功 | 各 form `onSuccess` | `form_submit_success` | `trackFormSubmitSuccess(formName, relatedEntity)` | `{formName, relatedEntity}` |
| 现有 `trackClick` 调用点 | `PhoneCta` / 3 AnchorNav | `click` | 保留为辅助诊断 | `{target, ...}` |

### 13.4 不采集的页面（PRD §2.1 + §6.3）

- 菜单展开/收起、轮播图切换、返回顶部按钮
- `/admin/*` 所有路由（已在 AnalyticsProvider 跳过）
- 表单失败（仅成功才发 `form_submit_success`）
- 重复挂载的同组件（同 pathname + 同 sourceArea 在 1s 内不重复发）

### 13.5 字面量类型防漂移（v1.1 新增）

新建 `src/lib/analytics-keys.ts`：

```ts
export const PRODUCT_KEYS = [
  'electric_steps', 'wheels', 'chassis', 'window_film', 'color_film', 'ppf',
] as const;
export type ProductKey = typeof PRODUCT_KEYS[number];

export const TOPIC_KEYS = ['wenjie', 'xiaomi', 'zeekr', 'flooring'] as const;
export type TopicKey = typeof TOPIC_KEYS[number];

export const CHANNELS = ['wechat', 'phone', 'navigation', 'form'] as const;
export type Channel = typeof CHANNELS[number];

export const PAGE_TYPES = [
  'home', 'brand', 'product_index', 'product_detail',
  'topic_detail', 'article_list', 'article_detail',
  'store_region', 'store_detail', 'contact', 'other',
] as const;
export type PageType = typeof PAGE_TYPES[number];

export const EVENT_NAMES = [
  'page_view', 'product_view', 'topic_view', 'article_view', 'store_view',
  'contact_click', 'navigation_click', 'form_submit_success',
] as const;
export type AnalyticsEventName = typeof EVENT_NAMES[number];

// 中文名映射（产品/专题）
export const PRODUCT_NAMES: Record<ProductKey, string> = {
  electric_steps: '电动踏板', wheels: '轮毂升级', chassis: '底盘升级',
  window_film: '汽车窗膜', color_film: '改色膜', ppf: '隐形车衣',
};
export const TOPIC_NAMES: Record<TopicKey, string> = {
  wenjie: '问界', xiaomi: '小米 SU7', zeekr: '极氪', flooring: '木地板',
};
```

Track API 用同一份 `EVENT_NAMES` 作为白名单；Stats API 用 `PRODUCT_KEYS` / `TOPIC_KEYS` 做产品/专题过滤枚举。

---

> 最后更新: 2026-06-24
