## Why

`src/app/admin/(dashboard)/stores/page.tsx` 已达到 1433 行，一个文件同时包含页面状态、URL 同步、API 请求、筛选逻辑、键盘交互、表格 columns、内联 UI 子组件和批量操作条。该结构让门店管理页难以维护和测试，任何小改动都容易波及整页。

现在需要把门店列表页拆成可复用组件和 hooks，并修复 `BulkBar` 的批量语义问题：它展示为批量操作，但实际逻辑需要确认是否只处理了 `selectedIds[0]` 或单项动作，不能继续“伪批量”。

## What Changes

- 将 `stores/page.tsx` 中的内联子组件拆到 `src/components/admin/stores/`：
  - `LevelBadge`
  - `StatusBadge`
  - `LevelFilter`
  - `Kbd` / `KbdFooter`
  - `KpiStrip`
  - `BulkBar`
  - `TableSkeleton`
  - `StoreTable`
  - `storeColumns` / `buildStoreColumns`
- 新增共享类型文件，例如 `src/components/admin/stores/types.ts`：
  - `StoreRow`
  - `ProvinceOption`
  - `StorePagination`
  - `StoreGroupMode`
  - `StoreSortKey`
  - `StoreImageFilter`
- 提取 `useAdminStoresUrlSync` hook：
  - URL query → 初始 filter state
  - filter state → URL query
  - 支持 search debounce 后同步
  - 保持现有 query 参数兼容
- 提取 `useAdminStoresFetch` hook：
  - 负责 stores 数据加载
  - 负责 pagination
  - 负责 loading/error/refetch
  - 负责 provinces/cities 加载或把它们拆成小 hook
- 修复 `BulkBar`：
  - 如果是批量操作，必须对所有 `selectedIds` 执行动作或调用明确的 bulk endpoint
  - 如果暂不支持真正批量，则 UI 必须改名/改文案为单项操作，不得显示“已选 N 家”却只操作第一家
- 保持门店列表路由、筛选参数、表格交互、键盘快捷键、分页、状态动作和视觉风格不变。

## Capabilities

### New Capabilities
- `admin-stores-page-composition`: 管理后台门店列表页组件拆分、URL 状态同步、数据加载 hook 和批量操作语义能力。

### Modified Capabilities
（无 — 本次保持页面业务行为兼容，只重构页面结构并修复 BulkBar 批量语义缺陷。）

## Impact

- 主要修改：
  - `src/app/admin/(dashboard)/stores/page.tsx`
- 新增目录：
  - `src/components/admin/stores/`
  - `src/hooks/use-admin-stores-url-sync.ts`
  - `src/hooks/use-admin-stores-fetch.ts`
- 测试：
  - 子组件测试
  - hook 测试
  - stores page smoke/page tests
  - BulkBar 批量行为测试
- 风险：
  - URL query 参数兼容性不能破坏已有收藏/分享链接
  - fetch hook 抽离后不能造成重复请求或 debounce 失效
  - BulkBar 修复需要确认后端是否已有 bulk API；没有时应使用逐项 action 且清晰展示部分失败结果
