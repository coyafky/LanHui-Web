## Context

`src/lib/admin-dashboard.ts` 同时承载 V1 和 V2 管理后台数据函数。文件当前接近 900 行，重复集中在：

- KPI：`getKpiSnapshot` 与 `getKpiSnapshotV2`
- 门店：`getStoreNetwork` 与 `getStoreSummary`
- 内容：`getContentHealth` 与 `getContentSummaryV2`
- 错误处理：多处重复 `try/catch`、`DashboardFetchResult`、`logger.warn`
- 时间范围：`getMonthRange`、`getDaysRange` 及趋势补零逻辑

V2 不是 V1 的完全同构输出：

- V1 KPI 有 `monthlyReservations`，V2 KPI 有 `monthlyContactIntent`
- V1 门店只输出 active/inactive + byProvince，V2 输出 status、level、topProvinces、missingProfile
- V1 内容输出 `byStatus/byCategory/totalDrafts/totalPublished/totalArchived`，V2 输出 label、recent7dPublished、topCategories、missingCover
- `getInterestSummaryV2` 是 V2 专属，没有 V1 等价函数

因此重构不能简单让 V2 直接调用 V1，而应抽出共享 raw query 和 aggregation，再由 V1/V2 presenter 做输出映射。

## Goals / Non-Goals

**Goals:**

- 消除 V1/V2 重复 Prisma 查询和重复聚合逻辑。
- 保留所有现有导出函数名称和返回 shape。
- 建立共享数据源层，V1/V2 函数只负责兼容输出转换。
- 统一 DashboardFetchResult 错误包装和日志模块名。
- 保持现有 `src/lib/admin-dashboard.test.ts` 行为测试通过。
- 增加结构性测试或检查脚本，防止后续再次复制整段查询。

**Non-Goals:**

- 不重做管理后台 UI。
- 不删除 V1 导出，除非所有调用方已经迁移并有单独 change 批准。
- 不改变 Prisma schema。
- 不改变 KPI、门店、内容、兴趣指标的业务口径，除非当前代码已有明确 bug。
- 不引入缓存、队列或外部 analytics 服务。
- 不把 `admin-dashboard.ts` 拆成过多微文件；优先简单可读。

## Decisions

### Decision 1: 使用 raw query + presenter，而不是 V2 直接包装 V1

新增内部核心函数，示例：

```ts
async function fetchDashboardKpiRaw(): Promise<DashboardKpiRaw> {}
function toDashboardKpiV1(raw: DashboardKpiRaw): DashboardKpi {}
function toDashboardKpiV2(raw: DashboardKpiRaw): DashboardKpiV2 {}
```

理由：

- V1/V2 字段相近但不完全相同。
- raw 层能统一查询，presenter 层能保留兼容 shape。
- 后续删除 V1 时只需删除 presenter，不影响 raw 查询。

替代方案：

- V2 直接调用 V1。简单但会丢失 V2 独有字段，且会把 V1 的旧口径固化到 V2。

### Decision 2: 统一 Result 包装 helper

新增内部 helper：

```ts
async function withDashboardResult<T>(
  module: string,
  fn: () => Promise<T>,
  fallback?: T | null,
): Promise<DashboardFetchResult<T>>
```

行为：

- 成功返回 `{ ok: true, data }`
- 失败时 `logger.warn({ event: "admin-dashboard.fetch.failed", module, error })`
- 默认返回 `{ ok: false, error, data: null }`
- 对 `getInterestSummaryV2` 这类已有 fallback 数据的函数，允许传入 fallback

理由：

- 消除重复 `try/catch`
- 保持现有 V2 日志模式
- 让失败策略集中可测

### Decision 3: 门店 raw 数据一次查询，多种聚合复用

门店共享核心应查询一次 `prisma.store.findMany`，字段覆盖 V1/V2 所需：

- status
- isActive
- provinceSlug
- provinceLabel
- level
- address
- phone
- imagePath

然后派生：

- V1 `StoreNetwork`
- V2 `StoreSummaryV2`

理由：

- 当前 V1/V2 都围绕门店列表做聚合。
- 统一 status fallback，可避免 active/pending 口径漂移。

### Decision 4: 内容 raw 数据按输出需求合并，避免重复 groupBy

内容共享核心应至少提供：

- 全状态 groupBy
- 全分类或 published 分类 groupBy
- recent7dPublished
- missingCover

V1 presenter 从 raw 派生 `ContentHealth`，V2 presenter 从 raw 派生 `ContentSummaryV2`。

理由：

- V1/V2 都需要状态统计和分类 Top。
- V2 额外需要 recent/missingCover。
- 将 Prisma 调用集中后，新增状态 label 不需要改两处。

### Decision 5: KPI raw 同时包含 reservation 和 contact intent

KPI raw 应包含：

- activeStoresV1 或兼容 activeStores
- activeStoresV2 口径需要的 status fallback active count
- publishedArticles
- monthlyPageViews
- monthlyReservations
- monthlyContactIntent

V1 返回 `monthlyReservations`，V2 返回 `monthlyContactIntent`。

理由：

- 两个版本字段不同，不能互相覆盖。
- raw 层可明确记录两个口径。

### Decision 6: Interest V2 抽 helper，但不伪造 V1

`getInterestSummaryV2` 没有 V1 对应函数，应抽出：

- date range helper
- fill missing days helper
- product/topic interest aggregation helper
- store view aggregation helper
- contact trend aggregation helper
- zeroReason helper

理由：

- 减少函数体长度和重复模式。
- 不创建无意义 V1 API。

## Proposed Structure

首选保守方案：仍在 `src/lib/admin-dashboard.ts` 内部重排，新增 private functions：

```txt
types
constants
result helpers
date helpers
raw query helpers
presenters
public V1 exports
public V2 exports
summary aggregators
activity logging
```

如果文件仍超过可读范围，可拆出：

```txt
src/lib/admin-dashboard.ts              # public exports
src/lib/admin-dashboard-core.ts         # raw query + presenters
```

拆文件时 `admin-dashboard.ts` 必须继续导出原有 public API。

## Risks / Trade-offs

- [Risk] V1/V2 指标口径被错误合并  
  → Mitigation: raw type 同时保留 V1/V2 所需字段，不用一个字段强行代表两个口径。

- [Risk] 查询次数减少后 mock 测试顺序变化导致测试脆弱  
  → Mitigation: 更新测试从“调用顺序”转向“输出 shape + 查询参数关键断言”。

- [Risk] `getInterestSummaryV2` 失败 fallback 被统一 helper 改丢  
  → Mitigation: `withDashboardResult` 支持 fallback data，并为 query-failed 场景补测试。

- [Risk] 拆文件导致循环 import 或 RSC 使用问题  
  → Mitigation: core 文件只 import `prisma/logger` 和纯类型，不 import React/Next 页面组件。

- [Risk] 代码行数下降但可读性变差  
  → Mitigation: presenter 命名清晰，raw type 明确，不做过度泛型。

## Migration Plan

1. 补齐现有 V1/V2 行为测试基线。
2. 新增 `withDashboardResult` 和 date helper 测试。
3. 抽 KPI raw + presenters，替换 V1/V2 KPI。
4. 抽 store raw + presenters，替换 V1/V2 store。
5. 抽 content raw + presenters，替换 V1/V2 content。
6. 抽 interest V2 内部 helper，保持 public shape。
7. 新增重复检查脚本。
8. 跑 targeted tests、lint、typecheck、build。

Rollback：

- 每组指标单独提交或单独 patch，失败时可只回退该组。
- public exports 保持不变，页面调用方无需同步改动。

## Open Questions

- 是否在本 change 中拆出 `admin-dashboard-core.ts`：建议实施时先在单文件内重排，若文件仍过长再拆。
- V1 是否仍有实际调用方：即使没有，本 change 也先保留导出，删除 V1 应作为单独清理 change。
