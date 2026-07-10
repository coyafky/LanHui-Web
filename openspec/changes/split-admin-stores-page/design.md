## Context

`src/app/admin/(dashboard)/stores/page.tsx` 当前约 1433 行，职责过多：

- 类型定义：`StoreRow`、`ProvinceOption`、`Pagination`、`GroupMode`、`SortKey`
- 内联 UI：`LevelBadge`、`StatusBadge`、`LevelFilter`、`Kbd`、`KbdFooter`、`KpiStrip`、`BulkBar`、`TableSkeleton`、`StoreTable`
- 表格 columns：`buildColumns`
- 主页面逻辑：filters、pagination、selection、grouping、keyboard shortcuts
- 数据请求：stores/provinces/cities fetch
- URL 同步：state ↔ query string
- 状态动作：单店操作、确认弹窗、reason、toast

该文件已经难以局部修改和测试。第 4 名 change 已规划 `useStoreAction`，本 change 聚焦 stores list 页面拆分和 hooks。两者可协同：若 `useStoreAction` 先落地，本 change 应复用；若本 change 先落地，可在 stores page 范围内抽出 action hook，并让后续 change 合并。

## Goals / Non-Goals

**Goals:**

- 将内联 UI 子组件拆分到 `src/components/admin/stores/`。
- 提取 URL 同步 hook，让 query 参数解析和写回集中管理。
- 提取 stores fetch hook，让数据加载、pagination、loading、error、refetch 集中管理。
- 保持现有筛选、排序、分组、分页、键盘快捷键、选择行为和页面视觉。
- 修复 BulkBar 批量语义：显示多选时必须真正操作所有选中门店，或明确降级为单项 UI。
- 将 `stores/page.tsx` 缩小为页面组合、hook 连接和少量事件协调。

**Non-Goals:**

- 不重写 stores API。
- 不改变公开后台路由。
- 不改变 StoreForm 或门店详情页。
- 不引入新的 table 库，继续使用当前 TanStack Table。
- 不把所有 admin table 做成通用 CRUD 框架。
- 不在本 change 中重做权限或 CSRF 体系；如已有 admin fetch helper，必须复用。

## Decisions

### Decision 1: 组件按 stores domain 分目录

新增目录：

```txt
src/components/admin/stores/
  types.ts
  LevelBadge.tsx
  StatusBadge.tsx
  LevelFilter.tsx
  KeyboardHints.tsx
  KpiStrip.tsx
  BulkBar.tsx
  TableSkeleton.tsx
  StoreTable.tsx
  storeColumns.tsx
  index.ts
```

理由：

- 这些组件是 stores admin 专属，不适合放到全局 `ui/`。
- 拆分后可独立测试 badge、filter、BulkBar、table。

### Decision 2: types.ts 作为页面和组件共享契约

`types.ts` 承载：

- `StoreRow`
- `ProvinceOption`
- `StorePagination`
- `StoreGroupMode`
- `StoreSortKey`
- `StoreImageFilter`
- `AdminStoresFilters`

理由：

- page、hooks、columns、table 都需要相同类型。
- 避免拆文件后类型在多个文件重复。

### Decision 3: useAdminStoresUrlSync 管 URL 读写

Hook 输入当前 filter state 和 setter，或直接返回受控 state：

```ts
const urlState = useAdminStoresUrlSync();
```

建议返回：

- `filters`
- `setFilters`
- `page`
- `setPage`
- `searchInput`
- `setSearchInput`
- `debouncedSearch`
- `resetFilters`
- `hasActiveFilters`

必须支持现有 query 参数：

- `search`
- `province`
- `city`
- `level` 多值
- `status`
- `image`
- `sort`
- `page`
- `group`

理由：

- 当前 URL 读写散在 `StoresPageInner`。
- 抽 hook 后可单独测试 query 兼容。

### Decision 4: useAdminStoresFetch 管数据请求和分页

Hook 输入 filters/page，输出：

- `stores`
- `pagination`
- `loading`
- `error`
- `refetch`
- `setStores` 或 `updateStoreRow` 可选

同时可拆出：

- `useProvinceOptions`
- `useCityOptions(province)`

理由：

- stores/provinces/cities fetch 是页面主要副作用。
- 抽 hook 后 page 不需要拼 URLSearchParams。

### Decision 5: BulkBar 必须语义真实

BulkBar 现有文案是“已选 N 家”，按钮是发布/暂停/恢复/终止。如果内部只操作一个 id，就构成行为 bug。

修复策略：

1. 检查是否已有 bulk endpoint。
2. 如果没有 bulk endpoint，使用现有 `/api/stores/{id}/{action}` 对 `selectedIds` 逐项执行。
3. 汇总结果：
   - 全部成功：toast 成功，清空选择，refetch。
   - 部分失败：toast 显示成功/失败数量，不清空失败项或提供明确提示。
   - 全部失败：toast 失败，保留选择。
4. 操作前根据每个 row 当前 status 过滤不可执行动作，或在 UI 中禁用不适用动作。

理由：

- UI 既然显示批量，就必须按批量执行。
- 没有后端 bulk API 时逐项执行是最小安全修复。

### Decision 6: Page 文件只做 composition

目标 `stores/page.tsx` 保留：

- Suspense wrapper
- hook 调用
- action callbacks 连接
- section 组合
- 少量 route/page-specific layout

不再保留：

- 大型子组件定义
- fetch URL 拼接细节
- columns JSX
- URL query 写回细节

## Risks / Trade-offs

- [Risk] URL 同步抽 hook 后和 Next `useSearchParams` 初始值不一致  
  → Mitigation: 为 query parsing 和 serialization 写单元测试，保留现有参数名。

- [Risk] debounce search 引发重复 fetch 或 URL 抖动  
  → Mitigation: hook 内明确 `searchInput` 和 committed `search` 的关系，并测试 debounce。

- [Risk] BulkBar 逐项执行时部分失败处理复杂  
  → Mitigation: 先实现清晰结果汇总，不引入后台批处理事务假象。

- [Risk] 拆出 StoreTable 后 columns 依赖页面 state 太多  
  → Mitigation: 用 `buildStoreColumns` 接收明确 props，不从外部闭包读取隐式状态。

- [Risk] 与第 4 名 `useStoreAction` 重叠  
  → Mitigation: 实施时优先复用已存在的 `useStoreAction`；如果不存在，局部实现时保持 API 可迁移。

## Migration Plan

1. 新增 shared types。
2. 拆纯 UI：badges、filter、KPI、keyboard hints、skeleton。
3. 拆 StoreTable 和 storeColumns。
4. 抽 useAdminStoresUrlSync。
5. 抽 useAdminStoresFetch。
6. 修 BulkBar 批量语义。
7. 收缩 `stores/page.tsx`。
8. 增加测试和重复检查脚本。

Rollback：

- 每个组件拆分可单独回退。
- BulkBar 修复单独提交，必要时可先落 bug fix 后落结构拆分。

## Open Questions

- 是否已有或计划新增 store bulk API：若没有，首版使用逐项调用。
- `useStoreAction` 是否已由第 4 名 change 实施：若已存在，本 change 必须复用它。
