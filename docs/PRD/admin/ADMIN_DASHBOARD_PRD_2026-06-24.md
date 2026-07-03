# 蓝辉后台 Dashboard 工作台 PRD

> **页面范围**：`/admin` Dashboard 工作台；与 `/admin/analytics` 深度分析页保持边界  
> **用户**：蓝辉总部员工（admin / editor）  
> **版本**：v0.1（三棱镜规划稿）  
> **状态**：规划中，未授权编码  
> **Owner**：冯科雅（Coya）  
> **创建日期**：2026-06-24  
> **最后更新**：2026-06-24  
>
> **上位文档**：[ADMIN_SYSTEM_PRD_2026-06-21.md](./archive/ADMIN_SYSTEM_PRD_2026-06-21.md)  
> **历史实现文档**：[ADMIN_DASHBOARD_PRD_2026-06-20.md](./ADMIN_DASHBOARD_PRD_2026-06-20.md)  
> **当前实现状态**：`src/app/admin/(dashboard)/page.tsx` 已有 KPI、内容健康、门店网络、趋势图、最近活动和快捷入口。

---

## 0. 三棱镜结构

本 PRD 按“三棱镜理论”编写，所有需求都必须同时回答三个问题：

| 棱镜 | 要回答的问题 | 本文对应章节 |
|---|---|---|
| 实现什么 | Dashboard 到底解决什么业务问题、包含哪些模块、每个模块展示什么 | §1-§8 |
| 怎么实现 | 页面、数据、权限、状态、接口、组件和迁移怎么落地 | §9-§15 |
| 怎么验收 | 何为完成、如何测试、哪些边界必须过、哪些不做 | §16-§20 |

Dashboard 不再被定义为“数据大屏”，而是蓝辉总部员工每天进入后台后的**经营工作台**。

---

# 第一面：实现什么

## 1. 页面定位

Dashboard 是 `/admin` 登录后的首页，目标不是堆放所有数据，而是帮助总部员工快速回答：

1. 今天有哪些门店、文章、咨询渠道或数据异常需要处理？
2. 官网当前运营是否正常？
3. 用户最近关注哪些产品、车型专题、文章和门店？
4. 下一步应该进入哪个后台子系统处理？

一句话定位：

> 蓝辉 Dashboard 是总部员工的每日经营工作台，用于发现待办、查看运营摘要、识别异常，并跳转到具体管理模块处理。

## 2. 用户与权限

### 2.1 用户角色

| 用户 | 是否可访问 `/admin` | Dashboard 目标 |
|---|---:|---|
| 总部 admin | 是 | 查看完整经营状态、处理所有待办、进入各子系统 |
| 车主 | 否 | 不进入后台 |
| 加盟商 | 否 | 不进入官网后台；加盟商能力由小程序承载 |

### 2.2 权限初稿

| 模块 | admin | editor |
|---|---:|---:|
| 查看基础 KPI | ✅ | ✅ |
| 查看门店网络摘要 | ✅ | 待确认 |
| 查看内容健康摘要 | ✅ | ✅ |
| 查看咨询渠道健康 | ✅ | 待确认 |
| 查看用户兴趣趋势摘要 | ✅ | 待确认 |
| 查看最近操作 | ✅ | 待确认 |
| 使用快捷入口 | 按目标模块权限 | 按目标模块权限 |

权限必须在页面和服务端数据聚合层同时保证；不能只隐藏前端按钮。

## 3. 当前实现与新版目标的差距

### 3.1 当前已实现内容

当前 `/admin` 已有：

- 欢迎语和当天日期。
- 4 个 KPI：活跃门店、已发布文章、本月访问、本月预约。
- 内容健康卡片：文章状态、分类 Top 5。
- 门店网络卡片：活跃门店按省份统计。
- 最近 30 天访问趋势。
- 最近活动。
- 快捷入口：新建门店、新建文章、查看分析、门店列表。

### 3.2 主要差距

| 差距 | 当前表现 | 新版 PRD 目标 |
|---|---|---|
| 页面定位 | 数据概览页 | 每日经营工作台 |
| 待办能力 | 无独立待办模块 | 显示门店、文章、咨询渠道、埋点异常 |
| 门店状态 | 仍部分依赖 `isActive` | 基于 `status` 四态 + `level` 等级统计 |
| 文章状态 | 当前代码主要是 `draft/published/archived` | 目标状态含 `withdrawn` |
| 咨询承接 | Dashboard 无健康检查 | 检查默认咨询渠道是否可用 |
| 行为数据 | 展示 PV 趋势 | 展示可解释的兴趣摘要 |
| 快捷入口 | 固定 4 个入口 | 根据待办和权限引导任务 |

## 4. 页面信息架构

新版 Dashboard 一期建议采用 6 个核心区块：

```text
/admin Dashboard
├── A. 欢迎与今日摘要
├── B. 今日待办 / 异常提醒
├── C. 经营 KPI
├── D. 门店网络摘要
├── E. 内容健康摘要
├── F. 用户兴趣与咨询趋势
└── G. 最近操作与快捷入口
```

其中 **B. 今日待办 / 异常提醒** 是新版 Dashboard 的核心新增能力。

## 5. 模块 A：欢迎与今日摘要

### 5.1 展示内容

- 页面标题：`仪表盘`
- 当前登录用户名称。
- 当前日期，使用中文本地化格式。
- 一句话经营摘要，例如：
  - `今天有 3 个待处理事项，官网数据正常。`
  - `咨询渠道未配置默认企业微信，请尽快处理。`
  - `最近 7 天暂无咨询点击，请检查埋点或咨询入口。`

### 5.2 业务规则

- 若全部状态正常，展示平静、克制的成功提示。
- 若存在 P0 异常，摘要优先展示最严重问题。
- 不使用夸张营销语，不做“战报大屏”表达。

## 6. 模块 B：今日待办 / 异常提醒

### 6.1 目标

让总部员工打开后台后，第一眼知道今天该处理什么。

### 6.2 一期待办清单

| 待办类型 | 触发条件 | 目标入口 | 优先级 |
|---|---|---|---|
| 待发布门店 | `Store.status = pending` 数量 > 0 | `/admin/stores?status=pending` | P0 |
| 缺封面图门店 | 营业中或待发布门店 `imageUrl/imagePath` 为空 | `/admin/stores?image=missing` | P0 |
| 暂停合作门店 | `Store.status = suspended` 数量 > 0 | `/admin/stores?status=suspended` | P1 |
| 草稿文章 | `Article.status = draft` 数量 > 0 | `/admin/articles?status=draft` | P1 |
| 已撤回文章 | `Article.status = withdrawn` 数量 > 0；当前实现未落地时隐藏或兼容为 0 | `/admin/articles?status=withdrawn` | P1 |
| 咨询渠道缺失 | 没有 active 的总部默认企业微信/微信/电话承接渠道 | `/admin/consultation-channels` | P0 |
| 埋点异常 | 最近 7 天无 `page_view/pageview` 或无咨询事件 | `/admin/analytics` | P1 |

### 6.3 待办展示规则

- 最多展示 5 条；其余折叠为“查看全部待办”。
- P0 待办排在最前。
- 每条待办必须有：
  - 简短标题。
  - 数量或异常说明。
  - 处理入口。
  - 影响范围。
- 没有待办时展示空态：`当前没有必须处理的事项。`

### 6.4 一期不做

- 不做个人任务分配。
- 不做审批流。
- 不做消息通知、短信、企业微信推送。
- 不做加盟商待办。

## 7. 模块 C：经营 KPI

### 7.1 KPI 初稿

新版 Dashboard 一期建议保留 4 个 KPI，但统一业务口径：

| KPI | 说明 | 当前字段/来源 | 备注 |
|---|---|---|---|
| 营业中门店 | 当前官网可展示的门店数量 | `Store.status = active`；兼容 `isActive=true` | 替代“活跃门店” |
| 已发布内容 | 官网可见文章数量 | `Article.status = published` | 后续可拆文章/案例 |
| 本月访问 | 本月公开站访问量 | `AnalyticsEvent` 中 pageview/page_view | 需要兼容旧事件名 |
| 本月咨询意向 | 电话、微信、导航、表单等咨询行为 | contact_click/navigation_click/form_submit_success；兼容 reservation | 替代“本月预约” |

### 7.2 口径原则

- Dashboard KPI 只展示能驱动行动的数字。
- “访问”不等于“兴趣”。
- “咨询意向”不等于“成交”。
- 不展示无法解释或无法行动的装饰性指标。

### 7.3 数字异常状态

| 场景 | 展示方式 |
|---|---|
| 查询失败 | 显示 `—`，卡片底部显示“数据暂不可用” |
| 数值为 0 | 显示 `0`，不显示为错误 |
| 埋点长期为 0 | 由今日待办模块生成提醒 |
| 数据库不可用 | Dashboard 不整体崩溃，各模块降级 |

## 8. 模块 D/E/F/G：摘要区块

### 8.1 门店网络摘要

展示：

- 四态数量：待发布、营业中、暂停合作、终止合作。
- 按省份 Top 10 的营业中门店。
- 按门店等级数量：[修改为符合我们当前的模块-这个其实我们有的]
- 缺资料门店数量。

进入：

- 点击状态 → `/admin/stores?status=...`
- 点击省份 → `/admin/stores?province=...`
- 点击等级 → `/admin/stores?level=...`

### 8.2 内容健康摘要

展示：

- 草稿、已发布、已撤回、已归档数量。
- 最近 7 天新发布文章数。
- 分类 Top 5。

当前实现缺口：

- `withdrawn` 文章状态尚未落地。
- 文章封面图上传能力尚未完全作为通用能力落地。

### 8.3 用户兴趣与咨询趋势

Dashboard 只展示摘要，不替代 `/admin/analytics`。

展示：

- 最近 30 天访问趋势。
- 产品兴趣 Top 5。
- 车型专题兴趣 Top 5。
- 门店查看 Top 5。
- 咨询点击趋势。

必须能解释零数据：

- 真实无行为。
- 埋点未接入。
- 事件命名不兼容。
- 查询失败。

### 8.4 最近操作与快捷入口

最近操作：

- 最近 10 条 ActivityLog。
- 显示操作者、动作、对象、时间和跳转入口。
- 操作类型包含文章、门店、咨询渠道、账号等。

快捷入口：

- 新建文章。
- 新建门店。
- 查看数据分析。
- 管理咨询渠道。
- 查看待完善门店。
- 查看草稿文章。

快捷入口必须根据权限展示；editor 不应看到无权限执行的入口。

---

# 第二面：怎么实现

## 9. 路由与页面边界

| 路由 | 定位 | 是否属于本文 |
|---|---|---:|
| `/admin` | Dashboard 工作台 | 是 |
| `/admin/analytics` | 深度用户行为分析 | 否，仅提供摘要入口 |
| `/admin/stores` | 门店管理 | 否，Dashboard 只链接 |
| `/admin/articles` | 文章管理 | 否，Dashboard 只链接 |
| `/admin/consultation-channels` | 咨询渠道管理 | 否，Dashboard 做健康提醒 |
| `/admin/settings` | 系统设置 | 当前侧边栏已有入口，但未实现；不纳入本轮 |

Dashboard 必须保持 `force-dynamic`，因为其数据依赖登录用户、权限和实时运营状态。

## 10. 数据来源

### 10.1 主数据表

| 数据 | 表/来源 | 用途 |
|---|---|---|
| 用户 | `User` | 权限、最近操作操作者 |
| 门店 | `Store` | KPI、待办、门店网络 |
| 省份/城市 | `Province` / `City` | 门店地区展示 |
| 文章 | `Article` | KPI、内容健康、待办 |
| 行为事件 | `AnalyticsEvent` | 访问、兴趣、咨询趋势 |
| 操作日志 | `ActivityLog` | 最近操作 |
| 咨询渠道 | 规划中的 ConsultationChannel | 咨询渠道健康检查 |

### 10.2 当前实现文件

| 类型 | 文件 |
|---|---|
| 页面 | `src/app/admin/(dashboard)/page.tsx` |
| 聚合服务 | `src/lib/admin-dashboard.ts` |
| KPI 组件 | `src/components/admin/DashboardKpiCards.tsx` |
| 内容健康 | `src/components/admin/DashboardContentHealth.tsx` |
| 门店网络 | `src/components/admin/DashboardStoreNetwork.tsx` |
| 趋势图 | `src/components/admin/DashboardTrendChart.tsx` |
| 最近活动 | `src/components/admin/DashboardRecentActivity.tsx` |
| 快捷入口 | `src/components/admin/DashboardQuickActions.tsx` |

## 11. 数据聚合设计

### 11.1 推荐服务结构

`src/lib/admin-dashboard.ts` 从“按组件散装查询”升级为“工作台摘要聚合”：

```ts
export async function getDashboardSummary(user: SessionUser): Promise<DashboardSummary> {
  return {
    welcome,
    todoSummary,
    kpi,
    storeSummary,
    contentSummary,
    interestSummary,
    recentActivity,
    quickActions,
    fetchedAt,
  };
}
```

### 11.2 推荐类型

```ts
type DashboardSummary = {
  welcome: DashboardWelcome;
  todoSummary: DashboardTodoSummary | null;
  kpi: DashboardKpi | null;
  storeSummary: DashboardStoreSummary | null;
  contentSummary: DashboardContentSummary | null;
  interestSummary: DashboardInterestSummary | null;
  recentActivity: DashboardRecentActivity | null;
  quickActions: DashboardQuickAction[];
  fetchedAt: string;
};
```

### 11.3 降级原则

- 单个模块查询失败，不导致整个 Dashboard 500。
- 每个模块返回 `ok/error/data` 或 `null`。
- 页面展示模块级错误，不吞掉错误状态。
- 后台日志记录错误，前端只展示用户可理解文案。

## 12. 事件口径兼容

当前项目历史上存在两套事件名：

| 历史实现 | 新分析 PRD | 处理策略 |
|---|---|---|
| `pageview` | `page_view` | Dashboard 一期兼容两者 |
| `reservation` | `contact_click/form_submit_success` | Dashboard 一期把 reservation 计入咨询意向 |
| `store_view` | `store_view` | 保持 |
| 普通 `click` | 仅业务事件入核心指标 | 不进入经营 KPI，最多进入埋点健康 |

Dashboard 必须避免把所有点击粗暴统计为“咨询”或“兴趣”。

## 13. 权限实现

### 13.1 页面层

- `/admin` 继续通过 admin layout 调用 `auth()` 守卫。
- 未登录跳转 `/admin/login`。
- 页面根据 session role 渲染可见模块。

### 13.2 数据层

聚合函数必须接受用户角色或 session 信息，并在服务端过滤：

- editor 无权查看的数据不查询或不返回。
- 不把门店敏感运营数据传到前端后再隐藏。
- 最近操作若包含 editor 无权限对象，需要过滤或脱敏。

### 13.3 快捷入口权限

快捷入口不是纯 UI：

- 没权限的入口不展示。
- 如果用户直接访问目标页面，目标页面仍需独立鉴权。

## 14. UI 设计原则

### 14.1 视觉基线

沿用当前后台深色系统：

- 背景：`zinc-950`
- 卡片：`zinc-900` + `border-zinc-800`
- 主色：`orange-500`
- 成功：`emerald`
- 警告：`amber`
- 危险：`red`

### 14.2 布局

Desktop：

```text
欢迎区
今日待办（横跨整行）
4 KPI
门店摘要 | 内容摘要
访问/兴趣趋势
最近操作 | 快捷入口
```

Tablet：

- KPI 2 × 2。
- 摘要卡片单列。
- 图表单列。

Mobile：

- 单列。
- 图表高度降低。
- 快捷入口变两列或单列。

### 14.3 空态和错误态

| 模块 | 空态 | 错误态 |
|---|---|---|
| 今日待办 | 当前没有必须处理的事项 | 待办加载失败，请刷新 |
| KPI | 数字显示 0 或 — | 数据暂不可用 |
| 门店摘要 | 暂无门店 | 门店数据加载失败 |
| 内容摘要 | 暂无文章 | 内容数据加载失败 |
| 趋势 | 暂无访问数据 | 趋势加载失败，可重试 |
| 最近操作 | 暂无操作记录 | 操作记录加载失败 |

## 15. 与现有模块的关系

Dashboard 不拥有具体业务的写操作。

| 业务 | Dashboard 做什么 | 具体处理在哪里 |
|---|---|---|
| 门店管理 | 展示数量、异常、入口 | `/admin/stores` |
| 文章管理 | 展示草稿、发布、缺图、入口 | `/admin/articles` |
| 用户行为分析 | 展示摘要和异常 | `/admin/analytics` |
| 咨询渠道 | 展示健康检查和入口 | `/admin/consultation-channels` |
| 操作日志 | 展示最近 10 条 | 未来 `/admin/audit-logs` |
| 系统设置 | 不在 Dashboard 实现 | 未来 `/admin/settings` |

---

# 第三面：怎么验收

## 16. 功能验收

### 16.1 页面加载

- [ ] admin 登录后访问 `/admin`，能看到 Dashboard。
- [ ] editor 登录后访问 `/admin`，能看到授权范围内的 Dashboard。
- [ ] 未登录访问 `/admin`，跳转 `/admin/login`。
- [ ] Dashboard 页面不依赖公开站静态 fallback 数据。
- [ ] 数据库某个模块查询失败时，页面不整体崩溃。

### 16.2 今日待办

- [ ] 存在 `pending` 门店时，显示“待发布门店”待办。
- [ ] 存在缺封面图门店时，显示“缺封面图门店”待办。
- [ ] 存在草稿文章时，显示“草稿文章”待办。
- [ ] 未配置 active 咨询渠道时，显示咨询渠道异常。
- [ ] 点击待办能进入带筛选参数的目标页面。
- [ ] 没有待办时，显示明确空态。

### 16.3 KPI

- [ ] 营业中门店数按 `Store.status = active` 统计；迁移兼容期可回退 `isActive = true`。
- [ ] 已发布内容只统计 `Article.status = published`。
- [ ] 本月访问兼容 `pageview` 和 `page_view`。
- [ ] 本月咨询意向兼容新旧事件，但不把普通 click 计入。
- [ ] 查询失败时显示 `—`，不显示错误数字。

### 16.4 门店摘要

- [ ] 展示待发布、营业中、暂停合作、终止合作数量。
- [ ] 展示省份 Top 10。
- [ ] 展示等级分布。
- [ ] 点击状态、省份、等级进入门店列表并带筛选参数。
- [ ] 无门店时显示空态。

### 16.5 内容摘要

- [ ] 展示草稿、已发布、已归档数量。
- [ ] 若 `withdrawn` 状态已落地，展示已撤回数量。
- [ ] 分类 Top 5 不应把空分类显示为错误。
- [ ] 已发布内容统计不能包含草稿和归档。
- [ ] 点击状态进入文章列表并带筛选参数。

### 16.6 用户兴趣趋势

- [ ] 访问趋势能展示最近 30 天。
- [ ] 无数据天需要补 0，日期轴连续。
- [ ] 产品、车型、门店、咨询摘要使用明确业务事件。
- [ ] 埋点缺失时有提示，不把缺失误判为“业务没有需求”。

### 16.7 最近操作和快捷入口

- [ ] 最近操作展示最近 10 条 ActivityLog。
- [ ] 操作记录能跳转到对应文章或门店详情。
- [ ] 无权限对象不展示给 editor。
- [ ] 快捷入口根据角色过滤。
- [ ] 目标页面仍有自己的权限守卫。

## 17. 权限与安全验收

- [ ] 未登录用户不能获得 Dashboard 聚合数据。
- [ ] editor 无权查看的数据在服务端不返回。
- [ ] Dashboard 不泄露未发布门店的公开访问链接。
- [ ] Dashboard 不展示车主个人敏感信息。
- [ ] AnalyticsEvent 中的 IP、UserAgent 不在 Dashboard 直接展示。

## 18. 视觉与易用性验收

- [ ] Desktop 1440 下首屏能看到欢迎区、待办区和 KPI。
- [ ] Tablet 768 下布局不拥挤，卡片顺序合理。
- [ ] Mobile 390 下不出现横向溢出。
- [ ] 所有可点击卡片有 hover/focus 状态。
- [ ] 状态颜色不能只靠颜色表达，必须有文字标签。
- [ ] 图表需要有文本标题和空态说明。

## 19. 工程质量验收

当前项目质量门说明：

- `npm run typecheck` 已知存在测试文件历史错误，不应误判为本 PRD 引入。
- 本 PRD 实施时，业务代码不能新增 typecheck 错误。

建议验收命令：

```bash
npm run lint
npm run build
npx vitest run src/lib/admin-dashboard.test.ts
npx vitest run src/app/api/analytics/stats/route.test.ts
```

如果实施中新增 E2E：

```bash
npm run test:e2e
```

## 20. 暂不做范围

Dashboard 一期明确不做：

- 不做实时大屏。
- 不做复杂 BI、多维透视表或自定义报表。
- 不做导出 Excel。
- 不做个人待办分配。
- 不做审批流。
- 不做加盟商后台。
- 不做成交、订单、库存、SKU、价格、合同、返佣数据。
- 不做公众号自动同步。
- 不在 Dashboard 内直接编辑门店、文章或咨询渠道。

## 21. 实施拆分建议

| 任务 | 内容 | 优先级 |
|---|---|---|
| T1 | 新建 Dashboard Summary 类型和聚合函数结构 | P0 |
| T2 | KPI 口径从“预约”调整为“咨询意向” | P0 |
| T3 | 增加今日待办模块 | P0 |
| T4 | 门店摘要改为 status + level 统计 | P0 |
| T5 | 内容摘要兼容目标文章状态机 | P1 |
| T6 | 咨询渠道健康检查接入 | P1 |
| T7 | 用户兴趣摘要与 `/admin/analytics` 口径统一 | P1 |
| T8 | 权限过滤 editor 可见模块 | P1 |
| T9 | 三视口 UI 和空态错误态完善 | P1 |
| T10 | 单元测试和 E2E 验收 | P0 |

## 22. 与旧 PRD 的关系

| 文档 | 定位 |
|---|---|
| `ADMIN_DASHBOARD_PRD_2026-06-20.md` | 旧实现说明，记录当前 Dashboard + Analytics 组件/API/修复点 |
| `archive/ADMIN_SYSTEM_PRD_2026-06-21.md` | 后台总系统业务定位 |
| 本文 | 2026-06-24 Dashboard 工作台产品规划 |

后续如果确认本文为新基线，可将旧文档标注为历史版本，或把本文合并为 canonical `ADMIN_DASHBOARD_PRD.md`。

## 23. 待确认问题

1. editor 是否可以查看门店网络摘要和用户兴趣趋势？
2. Dashboard 一期是否要显示“咨询渠道健康”，即使 `/admin/consultation-channels` 尚未编码？
3. 文章 `withdrawn` 状态是否先在 Dashboard 文案中预留，还是等文章系统迁移后再展示？
4. “本月咨询意向”是否采用：微信点击 + 电话点击 + 导航点击 + 表单成功 + 历史 reservation 的兼容口径？

## 24. 变更记录

| 日期 | 版本 | 变更 | 作者 |
|---|---|---|---|
| 2026-06-24 | v0.1 | 新建三棱镜结构 Dashboard 工作台 PRD | Codex / Coya |
