---
change: split-admin-articles-and-forms
design-doc: docs/superpowers/specs/2026-07-10-split-admin-articles-and-forms-design.md
base-ref: 29e05ad68957d02a94f129c33596b6b2ddd799e3
---

# Plan — 管理后台巨石组件拆分

## Summary

将 `articles/page.tsx`（682行）、`StoreForm.tsx`（562行）、`ArticleForm.tsx`（438行）拆分为独立的子组件，提取共享 `PaginationBar` 和 `EmptyState` 到 `src/components/admin/shared/`。

## Tasks

### 1. 共享基础设施

- [x] 1.1 创建 `src/components/admin/shared/types.ts` — 迁移 Article/Pagination/ArticleAction/PendingArticleConfirm 等共享类型
- [x] 1.2 创建 `src/components/admin/shared/PaginationBar.tsx` — 通用分页组件
- [x] 1.3 创建 `src/components/admin/shared/EmptyState.tsx` — 通用空状态组件

### 2. Articles 页面拆分

- [x] 2.1 创建 `src/components/admin/articles/ArticleFilterBar.tsx` — 搜索/状态/分类筛选
- [x] 2.2 创建 `src/components/admin/articles/ArticleRowMenu.tsx` — 行操作 dropdown
- [x] 2.3 创建 `src/components/admin/articles/ArticleBulkToolbar.tsx` — 批量操作栏
- [x] 2.4 创建 `src/components/admin/articles/ArticleTable.tsx` — 表格 + 列定义 + 复选
- [x] 2.5 重构 `articles/page.tsx` — 组合子组件，验证 page.test.tsx 12 tests

### 3. ArticleForm 拆分

- [x] 3.1 创建 `src/components/admin/articles/ArticleTitleSlugFields.tsx`
- [x] 3.2 创建 `src/components/admin/articles/ArticleContentEditor.tsx`
- [x] 3.3 创建 `src/components/admin/articles/ArticleMetaFields.tsx`
- [x] 3.4 创建 `src/components/admin/articles/ArticleTagInput.tsx`
- [x] 3.5 重构 `ArticleForm.tsx` — 薄容器，验证 ArticleForm.test.tsx

### 4. StoreForm 拆分

- [x] 4.1 创建 `src/components/admin/stores/StoreBasicInfoFields.tsx`
- [x] 4.2 创建 `src/components/admin/stores/StoreContactFields.tsx`
- [x] 4.3 创建 `src/components/admin/stores/StoreLevelSelect.tsx`
- [x] 4.4 创建 `src/components/admin/stores/StoreImageUploader.tsx`
- [x] 4.5 重构 `StoreForm.tsx` — 薄容器，验证 stores/new 和 stores/[id] 正常渲染

### 5. 收尾验证

- [x] 5.1 `npm run typecheck` — 确认无新类型错误
- [x] 5.2 `npm run test` — 确认全部测试通过
- [x] 5.3 代码提交（每个 task 一次 commit）

## Verification

- `npx vitest run` — 所有测试通过
- `npx tsc --noEmit` — page.tsx 零新增错误
- `npx eslint` — 无新增 lint 错误
