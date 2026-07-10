## Why

后台文章列表的 `STATUS_MAP`（状态徽章样式）和 `STATUS_OPTIONS`（筛选下拉）缺少 `withdrawn` 状态，导致已撤回的文章在列表中无法正确显示状态标签，也无法通过状态筛选器筛选。`ArticleStatus` 类型定义和状态转换系统早已支持 `withdrawn`，纯属前端展示遗漏。

## What Changes

- `STATUS_MAP` 新增 `withdrawn: { label: "已撤回", className: "bg-red-900/50 text-red-400" }`
- `STATUS_OPTIONS` 新增 `{ value: "withdrawn", label: "已撤回" }`
- `MetaFields` 编辑模式新增 `withdrawn` 状态选项

## Capabilities

### New Capabilities
None.

### Modified Capabilities
None.

## Impact

- `src/components/admin/shared/types.ts` — STATUS_MAP、STATUS_OPTIONS
- `src/components/admin/articles/MetaFields.tsx` — statusOptions（编辑模式）
