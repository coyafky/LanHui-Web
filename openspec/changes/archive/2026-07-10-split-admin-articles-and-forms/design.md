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
