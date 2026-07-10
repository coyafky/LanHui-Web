# Comet Design Handoff

- Change: split-admin-articles-and-forms
- Phase: design
- Mode: compact
- Context hash: fea83371a1a5784a3a848bf1eee1c65fd2474fdfdb9e1940cb659d24bf40c6e3

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/split-admin-articles-and-forms/proposal.md

- Source: openspec/changes/split-admin-articles-and-forms/proposal.md
- Lines: 1-52
- SHA256: bc72d906dd0193aad13b56c5c0c38b93eff3562fc7d3bc88a78f9170cc4db4e5

```md
## Why

`articles/page.tsx` (682行)、`StoreForm.tsx` (562行)、`ArticleForm.tsx` (438行) 已变成巨石组件——状态、筛选、表格列、表单字段、提交逻辑全部内联在一个文件里，难以维护和测试。需要在保持现有功能不变的前提下拆分为可复用子组件和 hooks。

## What Changes

- 拆分 `articles/page.tsx`：
  - 提取 `ArticleFilterBar` — 搜索框 + 状态筛选 + 分类筛选
  - 提取 `ArticleTable` — 表格 + 列定义 + 行操作菜单
  - 提取 `ArticleBulkToolbar` — 批量操作栏（已选计数 + 批量发布/归档/删除）
  - 提取 `PaginationBar` — 通用分页组件（articles + stores 共用）
  - 页面本身缩减为组合子组件的数据编排层
- 拆分 `StoreForm.tsx`：
  - 提取 `StoreBasicInfoFields` — 基本信息字段组
  - 提取 `StoreContactFields` — 联系方式字段组
  - 提取 `StoreLevelSelect` — 门店级别选择器
  - 提取 `StoreImageUploader` — 图片上传组件
  - 保留 `StoreForm` 作为组合容器
- 拆分 `ArticleForm.tsx`：
  - 提取 `ArticleTitleSlugFields` — 标题 + slug 联动
  - 提取 `ArticleContentEditor` — 富文本编辑 + 预览
  - 提取 `ArticleMetaFields` — 分类/标签/状态/置顶
  - 提取 `ArticleTagInput` — 标签输入组件
  - 保留 `ArticleForm` 作为组合容器
- 新增 `src/components/admin/shared/` 目录，放置 admin 内部共享组件：
  - `PaginationBar` — 分页（articles + stores 共用）
  - `FilterBar` — 通用筛选栏骨架
  - `EmptyState` — 空状态占位

## Capabilities

### New Capabilities
- `admin-articles-page-composition`: 管理后台文章列表页组件拆分（FilterBar、Table、BulkToolbar、PaginationBar）
- `admin-form-composition`: 管理后台表单组件拆分（StoreForm、ArticleForm 字段组提取）
- `admin-shared-components`: admin 内部共享组件（PaginationBar、FilterBar 骨架、EmptyState）

### Modified Capabilities
（无 — 本次保持页面行为兼容，只重构组件结构）

## Impact

- 主要修改：
  - `src/app/admin/(dashboard)/articles/page.tsx`
  - `src/components/admin/StoreForm.tsx`
  - `src/components/admin/ArticleForm.tsx`
- 新增目录：
  - `src/components/admin/articles/`
  - `src/components/admin/stores/`（仅 StoreForm 相关，与 split-admin-stores-page 互补）
  - `src/components/admin/shared/`
- 测试：
  - 现有测试必须继续通过：`page.test.tsx` (12 tests)、`ArticleForm.test.tsx`
  - StoreForm 当前无测试，拆分后补基础 smoke test
```

## openspec/changes/split-admin-articles-and-forms/design.md

- Source: openspec/changes/split-admin-articles-and-forms/design.md
- Lines: 1-78
- SHA256: 67a47e8f702caddf3172538f9342d07a47896998cd9b2af8cdddcb2eb167d3c5

```md
## Context

`articles/page.tsx`（682行）、`StoreForm.tsx`（562行）、`ArticleForm.tsx`（438行）均以单文件承载筛选、表格、表单的全部逻辑。当前项目已有 `split-admin-stores-page` change 覆盖 stores 列表页的组件提取，本 change 与其互补——前者负责 stores 列表，本 change 负责 articles 列表 + 两个表单的拆分，同时在 `src/components/admin/shared/` 下沉淀 admin 内部共享组件。

## Goals / Non-Goals

**Goals:**
- 将 `articles/page.tsx` 拆分为 FilterBar、Table、BulkToolbar、PaginationBar 四个子组件
- 将 `StoreForm.tsx` 拆分为字段组组件（BasicInfo、Contact、LevelSelect、ImageUploader）
- 将 `ArticleForm.tsx` 拆分为字段组组件（TitleSlug、ContentEditor、MetaFields、TagInput）
- 提取 `PaginationBar` 作为 articles + stores 共用组件
- 所有现有测试继续通过
- 页面行为和 API 契约完全不变

**Non-Goals:**
- 不修改 `split-admin-stores-page` 的方案或范围
- 不引入 CQRS/Repository 数据抽象层
- 不迁移品牌专题组件体系
- 不拆分 Header.tsx（公开站导航组件）
- 不拆分 Sidebar.tsx（体积可控，~200行）

## Decisions

### D1: 组件拆分策略 — 按 UI 区域切分，不按数据流切分

**选择**: 每个 UI 区域（筛选栏、表格、分页）一个独立组件，props 驱动，无内部数据请求。

**备选**: 按数据流切分（每个区域既是 UI 也是数据容器）。被否决——会导致组件无法在不同页面复用。

**理由**: 与现有 `split-admin-stores-page` 的拆分方向一致。`PaginationBar` 可被 articles 和 stores 直接共享。

### D2: 目录结构 — `src/components/admin/` 下增量扩展

**选择**:
```
src/components/admin/
├── articles/                  # 新增
│   ├── ArticleFilterBar.tsx
│   ├── ArticleTable.tsx
│   ├── ArticleBulkToolbar.tsx
│   └── ArticleRowMenu.tsx
├── stores/                    # 已存在（split-admin-stores-page）
│   └── ... (StoreForm 拆分放这里)
├── shared/                    # 新增
│   ├── PaginationBar.tsx
│   ├── EmptyState.tsx
│   └── types.ts
├── StoreForm.tsx              # 拆分后变薄 → 委托给 stores/ 子组件
├── ArticleForm.tsx            # 拆分后变薄 → 委托给 articles/ 子组件
```

**备选**: 激进 `features/` 目录迁移。被否决——200+ 组件迁移量大且风险高。

**理由**: 增量提取，不破坏现有引用，与 `split-admin-stores-page` 共享 `stores/` 目录。

### D3: 表单拆分 — 保留容器组件，提取字段组

**选择**: `StoreForm` 和 `ArticleForm` 保留为薄的容器组件（组合字段组 + 提交逻辑），字段组作为纯展示组件。

**理由**: 页面通过 `formId` 和 `onSubmit` prop 触发提交——容器组件需要持有这些接口。字段组只负责渲染字段和 onChange 回调，可独立测试。

### D4: PaginationBar 共用

**选择**: 提取通用 `PaginationBar` 组件，接受 `page`、`totalPages`、`onPrev`、`onNext` props。

**理由**: articles 和 stores 的分页 UI 几乎相同（前一页/页码/后一页）。各自独立维护会导致两处 bug。

### D5: 与 split-admin-stores-page 的关系

**选择**: 保持 `split-admin-stores-page` 独立，本 change 不修改其方案。两个 change 都完成后，`PaginationBar` 在 `shared/` 下被两者复用。

**理由**: 两个 change 有重叠点（`PaginationBar`），但各自 focuse 不同页面，独立交付更安全。

## Risks / Trade-offs

- **StoreForm 无现有测试** → 拆分时补基础 smoke test，确保字段渲染和提交不挂
- **两 change 共享 `stores/` 目录可能有合并冲突** → 本 change 只往 `stores/` 添加 StoreForm 相关文件（如 `StoreBasicInfoFields.tsx`），不修改 `split-admin-stores-page` 产出的文件
- **ArticleForm.test.tsx 可能因导入路径变化失败** → 拆分后第一时间跑测试，若有 breakage 及时修复
```

## openspec/changes/split-admin-articles-and-forms/tasks.md

- Source: openspec/changes/split-admin-articles-and-forms/tasks.md
- Lines: 1-38
- SHA256: 1bb2649e271583660c640dc43cc92d4b919816c69dbca84981c8f3ef05cbfb18

```md
## 1. 共享组件（shared/）

- [ ] 1.1 创建 `src/components/admin/shared/PaginationBar.tsx` — 通用分页组件（page/totalPages/onPrev/onNext props，articles + stores 共用）
- [ ] 1.2 创建 `src/components/admin/shared/EmptyState.tsx` — 通用空状态组件（icon/title/description props）
- [ ] 1.3 创建 `src/components/admin/shared/types.ts` — 共享类型定义

## 2. 拆分 articles/page.tsx

- [ ] 2.1 创建 `src/components/admin/articles/ArticleFilterBar.tsx` — 搜索框 + 状态/分类筛选下拉框
- [ ] 2.2 创建 `src/components/admin/articles/ArticleRowMenu.tsx` — 行内操作菜单（发布/归档/删除/置顶 dropdown）
- [ ] 2.3 创建 `src/components/admin/articles/ArticleBulkToolbar.tsx` — 批量操作栏（已选计数 + 批量发布/归档/删除）
- [ ] 2.4 创建 `src/components/admin/articles/ArticleTable.tsx` — 表格 + 列定义 + 复选列 + 行菜单集成
- [ ] 2.5 重构 `articles/page.tsx` — 替换内联渲染为 ArticleFilterBar + ArticleTable + ArticleBulkToolbar + PaginationBar 组合
- [ ] 2.6 验证现有 12 tests 通过

## 3. 拆分 StoreForm.tsx

- [ ] 3.1 创建 `src/components/admin/stores/StoreBasicInfoFields.tsx` — 门店名称/地址/经纬度字段组
- [ ] 3.2 创建 `src/components/admin/stores/StoreContactFields.tsx` — 电话/微信/营业时间字段组
- [ ] 3.3 创建 `src/components/admin/stores/StoreLevelSelect.tsx` — 门店级别选择器（含 LEVEL_BADGE_CLASS）
- [ ] 3.4 创建 `src/components/admin/stores/StoreImageUploader.tsx` — 图片上传组件
- [ ] 3.5 重构 `StoreForm.tsx` — 改为薄容器组合四个字段组，保留 formId/onSubmit 接口
- [ ] 3.6 验证 stores/new 和 stores/[id] 页面正常渲染

## 4. 拆分 ArticleForm.tsx

- [ ] 4.1 创建 `src/components/admin/articles/ArticleTitleSlugFields.tsx` — 标题 + slug 联动输入
- [ ] 4.2 创建 `src/components/admin/articles/ArticleContentEditor.tsx` — 富文本编辑 + 预览切换
- [ ] 4.3 创建 `src/components/admin/articles/ArticleMetaFields.tsx` — 分类/状态/置顶选择
- [ ] 4.4 创建 `src/components/admin/articles/ArticleTagInput.tsx` — 标签输入 + 展示
- [ ] 4.5 重构 `ArticleForm.tsx` — 改为薄容器组合四个字段组，保留现有 props 接口
- [ ] 4.6 验证现有 `ArticleForm.test.tsx` 通过

## 5. 收尾

- [ ] 5.1 `npm run typecheck` — 确认无新类型错误
- [ ] 5.2 `npm run test` — 确认全部测试套件通过
- [ ] 5.3 更新 articles/page.test.tsx（如子组件映射变化需要调整）
```

## openspec/changes/split-admin-articles-and-forms/specs/admin-articles-page-composition/spec.md

- Source: openspec/changes/split-admin-articles-and-forms/specs/admin-articles-page-composition/spec.md
- Lines: 1-50
- SHA256: c2f11bdd0fb7da9497a3a69f972874a13a10e5f340d5119f2a82ba3fe786a0ab

```md
## ADDED Requirements

### Requirement: Article list page SHALL be composed of sub-components

The `articles/page.tsx` page SHALL be refactored from a monolithic component into a composition of focused sub-components, each with a single responsibility. The page's external behavior (data fetching, filter params, API calls, UI rendering) MUST remain identical.

#### Scenario: Page renders with sub-components
- **WHEN** an admin user navigates to `/admin/articles`
- **THEN** the page SHALL render using `ArticleFilterBar`, `ArticleTable`, `ArticleBulkToolbar`, and `PaginationBar` sub-components
- **AND** all existing filter/search/table/pagination interactions SHALL work identically

#### Scenario: Existing tests continue to pass
- **WHEN** `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx` is executed after refactoring
- **THEN** all 12 existing tests SHALL pass without modification

### Requirement: ArticleFilterBar SHALL encapsulate all filter controls

The `ArticleFilterBar` component SHALL contain the search input, status dropdown, and category dropdown currently inlined in `articles/page.tsx`. It SHALL accept `search`, `statusFilter`, `categoryFilter`, and `onChange` callbacks as props.

#### Scenario: Search input triggers filter change
- **WHEN** user types in the search input
- **THEN** the parent page SHALL receive updated search state via onChange callback

#### Scenario: Status dropdown filters articles
- **WHEN** user selects a status option
- **THEN** the table SHALL display only articles matching that status

### Requirement: ArticleTable SHALL encapsulate table rendering and row actions

The `ArticleTable` component SHALL contain the table element, column definitions, checkbox column, and row-level action menus. It SHALL accept `articles`, `selectedIds`, `onToggleSelect`, `onToggleSelectAll`, and action handlers as props.

#### Scenario: Table renders article rows with checkboxes
- **WHEN** articles are loaded
- **THEN** each row SHALL display a checkbox, title, category, status, and action menu

#### Scenario: Select-all checkbox toggles all rows
- **WHEN** user clicks the header checkbox
- **THEN** all visible rows SHALL be selected or deselected

### Requirement: ArticleBulkToolbar SHALL display batch actions

The `ArticleBulkToolbar` component SHALL render when one or more articles are selected. It SHALL display the selected count and batch action buttons (publish, archive, delete). It SHALL accept `selectedCount`, `onClear`, and `onAction` callbacks as props.

#### Scenario: Toolbar visible when articles selected
- **WHEN** at least one article checkbox is checked
- **THEN** the bulk action toolbar SHALL appear with selected count and action buttons

#### Scenario: Toolbar hidden when no selection
- **WHEN** all checkboxes are unchecked
- **THEN** the bulk action toolbar SHALL not render
```

## openspec/changes/split-admin-articles-and-forms/specs/admin-form-composition/spec.md

- Source: openspec/changes/split-admin-articles-and-forms/specs/admin-form-composition/spec.md
- Lines: 1-33
- SHA256: bb44ba0f24c8fedea2e8717c3e3c5b908be6ed1288b015bed8eff72722753c89

```md
## ADDED Requirements

### Requirement: StoreForm SHALL be split into field group components

The `StoreForm` component SHALL be refactored into a thin container that composes field group sub-components: `StoreBasicInfoFields`, `StoreContactFields`, `StoreLevelSelect`, and `StoreImageUploader`. The form's external interface (props, onSubmit behavior) MUST remain identical.

#### Scenario: Create store form renders all field groups
- **WHEN** an admin navigates to `/admin/stores/new`
- **THEN** the form SHALL render StoreBasicInfoFields, StoreContactFields, StoreLevelSelect, and StoreImageUploader
- **AND** form submission behavior SHALL be unchanged

#### Scenario: Edit store form works with existing callers
- **WHEN** an admin navigates to `/admin/stores/[id]`
- **THEN** the form SHALL render with pre-populated field values from defaultValues
- **AND** the edit page's formId and onSubmit integration SHALL continue to work

### Requirement: ArticleForm SHALL be split into field group components

The `ArticleForm` component SHALL be refactored into a thin container that composes field group sub-components: `ArticleTitleSlugFields`, `ArticleContentEditor`, `ArticleMetaFields`, and `ArticleTagInput`. The form's external interface (props, onSubmit behavior) MUST remain identical.

#### Scenario: Create article form renders all field groups
- **WHEN** an admin navigates to `/admin/articles/new`
- **THEN** the form SHALL render ArticleTitleSlugFields, ArticleContentEditor, ArticleMetaFields, and ArticleTagInput
- **AND** title-to-slug auto-generation SHALL continue to work

#### Scenario: Edit article form works with existing callers
- **WHEN** an admin navigates to `/admin/articles/[id]`
- **THEN** the form SHALL render with pre-populated field values
- **AND** auto-focus on first validation error SHALL continue to work

#### Scenario: Existing ArticleForm tests continue to pass
- **WHEN** `npx vitest run src/components/admin/ArticleForm.test.tsx` is executed after refactoring
- **THEN** all existing tests SHALL pass without modification
```

## openspec/changes/split-admin-articles-and-forms/specs/admin-shared-components/spec.md

- Source: openspec/changes/split-admin-articles-and-forms/specs/admin-shared-components/spec.md
- Lines: 1-25
- SHA256: 94828d2b46895cfb55f849a2cf8b66922d802dc3f3cbfb7830f91172b5114ee1

```md
## ADDED Requirements

### Requirement: PaginationBar SHALL be a reusable shared component

The `PaginationBar` component SHALL provide a consistent pagination UI for both articles and stores list pages. It SHALL accept `page`, `totalPages`, `onPrev`, and `onNext` props. The component MUST use the existing visual style (border-zinc-800, bg-zinc-900, disabled states).

#### Scenario: PaginationBar renders current page and navigation buttons
- **WHEN** the component receives `page=2`, `totalPages=5`
- **THEN** it SHALL display "第 2 / 5 页" and enable both prev/next buttons

#### Scenario: Previous button disabled on first page
- **WHEN** the component receives `page=1`
- **THEN** the "上一页" button SHALL be disabled

#### Scenario: Next button disabled on last page
- **WHEN** the component receives `page=5`, `totalPages=5`
- **THEN** the "下一页" button SHALL be disabled

### Requirement: EmptyState SHALL be a reusable shared component

The `EmptyState` component SHALL provide a consistent empty state display for admin list pages. It SHALL accept `icon` (Lucide icon component), `title`, and `description` props.

#### Scenario: EmptyState renders with custom content
- **WHEN** the component receives `title="暂无文章"` and `description="点击上方按钮创建第一篇文章"`
- **THEN** it SHALL render the title and description with a default icon
```

