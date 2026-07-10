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
