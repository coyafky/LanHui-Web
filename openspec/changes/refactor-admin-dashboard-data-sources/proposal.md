## Why

`src/lib/admin-dashboard.ts` 同时维护 V1 与 V2 仪表盘数据函数，KPI、门店、内容、兴趣等模块存在大量重复 Prisma 查询、聚合逻辑和错误处理。重复逻辑让后台指标维护成本变高：一个查询条件、状态 fallback、错误返回策略或埋点口径变化，都需要在 V1/V2 两套函数里同步修改。

现在需要把仪表盘数据层改为“共享查询核心 + V1/V2 shape adapter”，保留现有导出兼容，同时消除重复查询实现。

## What Changes

- 在 `src/lib/admin-dashboard.ts` 内部或相邻模块中新增共享数据源函数：
  - KPI 原始统计核心
  - 门店原始统计核心
  - 内容原始统计核心
  - 兴趣趋势原始统计核心
  - 统一 DashboardFetchResult 包装 helper
- V1 函数继续导出：
  - `getKpiSnapshot`
  - `getStoreNetwork`
  - `getContentHealth`
  - `getDashboardSummary`
- V2 函数继续导出：
  - `getKpiSnapshotV2`
  - `getStoreSummary`
  - `getContentSummaryV2`
  - `getInterestSummaryV2`
  - `getDashboardSummaryV2`
- V1/V2 函数不再各自复制完整 Prisma 查询逻辑，而是复用共享核心并做各自输出 shape mapping。
- 统一错误处理模式，使用 `logger.warn` 和 `DashboardFetchResult<T>`，避免散落的重复 `try/catch`。
- 增加测试，确保 V1/V2 输出 shape 不变，并验证共享核心不会重复查询。
- 增加检查脚本，防止 `admin-dashboard.ts` 再次出现 V1/V2 大段复制查询逻辑。

## Capabilities

### New Capabilities
- `admin-dashboard-data-sources`: 管理后台仪表盘数据源复用能力，定义 V1/V2 指标如何共享查询核心并保持兼容输出。

### Modified Capabilities
（无 — 对外导出函数和后台页面行为保持兼容，本次只重构数据层实现。）

## Impact

- 主要修改：
  - `src/lib/admin-dashboard.ts`
  - `src/lib/admin-dashboard.test.ts`
- 可能新增：
  - `src/lib/admin-dashboard-data.ts` 或 `src/lib/admin-dashboard/core.ts`
  - `scripts/check-admin-dashboard-duplication.mjs`
- `package.json` 增加检查脚本，例如 `check:admin-dashboard-duplication`
- 受影响页面：
  - `/admin`
  - `/admin/analytics`
  - 使用 dashboard V1/V2 数据函数的后台组件
- 风险：
  - V1/V2 查询条件并非完全一致，例如 V2 KPI 用 `monthlyContactIntent` 替代 `monthlyReservations`
  - V2 门店摘要包含 status、level、missingProfile，不能简单包装 V1 `StoreNetwork`
  - 内容摘要 V2 有 `recent7dPublished`、`missingCover`，不能直接等同 V1 `ContentHealth`
  - 必须保留当前测试里验证的 V2 shape
