---
change: refactor-admin-page-shared-components
design-doc: docs/superpowers/specs/2026-07-10-refactor-admin-page-shared-components-design.md
base-ref: 6aceb36bcea865af60e1dc809a07bda74d21e331
archived-with: 2026-07-10-refactor-admin-page-shared-components
---

# Plan — 后台页面共享模式提取

## Summary

提取 4 个共享单元（useCategories、EntityImagePage、useStoreAction、useArticleFormState）消除 `articles/` 和 `stores/` 页面中的四类重复逻辑。每个单元内部封装完整的数据获取/状态管理/副作用逻辑，页面降为薄胶水层。

## 约束

- 使用现有 ArticleForm UI，不创建第二个
- 写操作使用 adminCsrfFetch
- useUnsavedChangesGuard 集成保持不变
- 批量门店操作留在 stores/page.tsx 页面层

## Tasks

### 1. useCategories — 分类加载 Hook

- [x] 1.1 创建 `src/hooks/use-categories.ts`：adminCsrfFetch 加载 `/api/articles/categories`，失败 fallback CATEGORIES_FALLBACK，useEffect + cleanup flag
- [x] 1.2 迁移 `src/app/admin/(dashboard)/articles/page.tsx`：替换内联 categories fetch → `useCategories()`
- [x] 1.3 迁移 `src/app/admin/(dashboard)/articles/new/page.tsx`：替换内联 categories fetch → `useCategories()`（同时修复裸 fetch → adminCsrfFetch）
- [x] 1.4 迁移 `src/app/admin/(dashboard)/articles/[id]/page.tsx`：替换内联 categories fetch → `useCategories()`（同时修复裸 fetch → adminCsrfFetch）
- [x] 1.5 创建 `src/hooks/use-categories.test.tsx`：成功加载、API 失败 fallback、无效响应 fallback、cleanup 不更新 state

### 2. EntityImagePage — 图片管理页组件

- [x] 2.1 创建 `src/components/admin/EntityImagePage.tsx`：接收 EntityImagePageConfig，统一 loading/error/breadcrumb/uploader/storage hint
- [x] 2.2 迁移 `src/app/admin/(dashboard)/articles/[id]/image/page.tsx`：替换为 `<EntityImagePage entity="article" .../>`
- [x] 2.3 迁移 `src/app/admin/(dashboard)/stores/[id]/image/page.tsx`：替换为 `<EntityImagePage entity="store" .../>`
- [x] 2.4 创建 `src/components/admin/EntityImagePage.test.tsx`：article config 渲染、store config 渲染、loading 状态、error + retry

### 3. useStoreAction — 门店状态操作 Hook

- [x] 3.1 创建 `src/hooks/use-store-action.ts`：action dialog state + performAction POST + toast + onSuccess 回调
- [x] 3.2 迁移 `src/app/admin/(dashboard)/stores/[id]/page.tsx`：替换内联 action state → `useStoreAction()`
- [x] 3.3 迁移 `src/app/admin/(dashboard)/stores/page.tsx` 单行 action：替换内联 action state → `useStoreAction()`，批量操作保留页面层
- [x] 3.4 创建 `src/hooks/use-store-action.test.tsx`：成功操作、API 失败、网络失败、reason 校验、onSuccess 回调

### 4. useArticleFormState — 文章表单状态 Hook

- [x] 4.1 创建 `src/hooks/use-article-form-state.ts`：create/edit 模式，独立 value/onChange 对，dirty 检测，handleSubmit 封装
- [x] 4.2 迁移 `src/app/admin/(dashboard)/articles/new/page.tsx`：替换 12+ state 声明 + submit 逻辑 → `useArticleFormState("create")`
- [x] 4.3 迁移 `src/app/admin/(dashboard)/articles/[id]/page.tsx`：替换 state + snapshot + submit 逻辑 → `useArticleFormState("edit", { initialData, articleId })`
- [x] 4.4 创建 `src/hooks/use-article-form-state.test.tsx`：create dirty、edit dirty、validation failure、server fieldErrors、create 成功、edit snapshot 更新

### 5. Duplication Guard

- [x] 5.1 创建 `scripts/check-admin-page-duplication.mjs`：检测四类重复模式
- [x] 5.2 添加 `check:admin-page-duplication` 到 package.json scripts

### 6. 收尾验证

- [x] 6.1 `npm run typecheck` — 确认无新类型错误
- [x] 6.2 `npm run test` — 确认全部测试通过（含新 hook/组件测试 + 已有回归）
- [x] 6.3 `npm run build` — 确认构建成功
- [x] 6.4 `npm run check:admin-page-duplication` — 确认 guard 通过
