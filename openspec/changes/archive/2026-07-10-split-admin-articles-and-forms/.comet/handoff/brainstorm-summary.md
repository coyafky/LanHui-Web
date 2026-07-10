# Brainstorm Summary

- Change: split-admin-articles-and-forms
- Date: 2026-07-10
- Design confirmed by user: all three sections (articles/page, StoreForm, ArticleForm)

## 确认的技术方案

**拆分顺序**: Articles 优先 → ArticleForm → StoreForm

**Articles 页面拆分**: 提取 ArticleFilterBar、ArticleTable（含 ArticleRowMenu）、ArticleBulkToolbar、PaginationBar。页面缩减为 ~100 行数据编排层。所有 state 和副作用保留在容器中，子组件纯展示 + callback props。

**StoreForm 拆分**: 提取 StoreBasicInfoFields、StoreContactFields、StoreLevelSelect、StoreImageUploader。RegionSelector 已存在复用。StoreForm 保留为薄容器，持有 handleSubmit/formId 接口。

**ArticleForm 拆分**: 提取 ArticleTitleSlugFields、ArticleContentEditor、ArticleMetaFields、ArticleTagInput。title-to-slug 联动逻辑保留在容器中。字段组纯展示。

**共享组件**: PaginationBar + EmptyState 放入 `src/components/admin/shared/`，供 articles 和 stores 复用。

## 关键取舍与风险

- StoreForm 无现有测试：拆分后补基础 smoke test
- 类型（Article/Pagination/PendingArticleConfirm）从 page.tsx 移到 shared/types.ts，需更新所有导入
- ArticleForm.test.tsx 可能因导入路径变化需要微调
- PaginationBar 作为共享组件，需确保与 split-admin-stores-page 的 StoreTable 兼容

## 测试策略

- 各阶段拆分后立即运行现有测试（page.test.tsx 12 tests、ArticleForm.test.tsx）
- StoreForm 拆分后补 smoke test
- 不新增独立子组件测试（子组件通过页面集成测试覆盖）

## Spec Patch

无
