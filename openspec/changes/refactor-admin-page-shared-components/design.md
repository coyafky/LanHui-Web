## Context

后台页面已经有部分共享组件，例如 `ArticleForm`、`StoreForm`、`ConfirmDialog`、`EntityImageUploader`。但页面层仍有明显重复：

- `articles/new/page.tsx` 与 `articles/[id]/page.tsx` 都维护文章字段 state、校验、fieldErrors、saving、dirty、submit payload。
- `articles/page.tsx`、`articles/new/page.tsx`、`articles/[id]/page.tsx` 都复制 `/api/articles/categories` 加载和 fallback 分类。
- `articles/[id]/image/page.tsx` 与 `stores/[id]/image/page.tsx` 都复制 fetch/refetch/loading/error/breadcrumb/uploader 页面结构。
- `stores/page.tsx` 与 `stores/[id]/page.tsx` 都维护门店状态动作 dialog、reason、acting、error、POST 调用和 toast。

当前事实：`ArticleForm` 已经存在并被 new/edit 使用。本 change 不应“重新创建 ArticleForm”，而应把页面层重复状态和数据逻辑抽出去。

项目约束：

- Next.js App Router，相关页面都是 Client Component。
- 已有 sonner toast、ConfirmDialog、自定义 hooks 模式。
- 管理后台写 API 可能有 CSRF 适配要求，抽 hook 时不能绕开已有 fetch helper 或后续 CSRF 方案。
- 不改变路由、API、UI 风格、toast 文案和现有测试断言。

## Goals / Non-Goals

**Goals:**

- 收敛文章 new/edit 的重复表单状态、校验、dirty、submit 构造。
- 收敛文章 categories 加载逻辑到单一 hook。
- 收敛 article/store 图片管理页到一个配置化 `EntityImagePage`。
- 收敛门店状态动作到一个可复用 `useStoreAction` hook。
- 保持现有页面行为、视觉、成功/失败 toast、离开保护和 ConfirmDialog 行为。
- 增加 hooks 和共享组件测试。

**Non-Goals:**

- 不重写 `ArticleForm` 的 UI。
- 不重写 `StoreForm`。
- 不改变 `/api/articles`、`/api/stores`、`/api/upload` 的 API shape。
- 不引入全局状态管理库。
- 不把 articles/stores 页面表格整体抽成通用 CRUD 框架。
- 不在本 change 中重做权限、认证、CSRF 体系。

## Decisions

### Decision 1: ArticleForm 保留为纯 UI，新增表单状态 hook

新增 `useArticleFormState` 或 `useArticleEditor`，负责：

- 字段 state
- `ArticleFormInput` 构造
- 客户端 `validateArticleForm`
- `fieldErrors`
- `saving`
- create dirty 判定
- edit snapshot dirty 判定
- server `fieldErrors` 映射
- submit 成功后的 snapshot 更新

页面仍渲染已有 `ArticleForm`。

理由：

- `ArticleForm` 已存在并有测试，重写 UI 风险大。
- 重复主要在页面 state 和提交流程，不在 JSX 表单本身。

### Decision 2: useCategories 单一来源

新增：

```ts
export const ARTICLE_CATEGORIES_FALLBACK = [...]
export function useCategories(options?: { logPrefix?: string })
```

返回：

```ts
{
  categories: CategoryOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

理由：

- 三处重复同一个 endpoint 和 fallback。
- 统一 fallback 后，新增分类或文案不需要改三处。

### Decision 3: EntityImagePage 使用 mapper/selector 配置

新增 `src/components/admin/EntityImagePage.tsx`：

```tsx
<EntityImagePage
  entity="article"
  entityId={id}
  fetchEndpoint={`/api/articles/${id}`}
  backHref="/admin/articles"
  crumbLabel="文章封面图"
  title="文章封面图管理"
  storageHint="public/images/articles/"
  selectData={(json) => ({
    id: json.data.id,
    title: json.data.title,
    imagePath: json.data.featuredImage ?? null,
  })}
/>
```

Store 使用同一组件，selector 改为 `name/imagePath`。

理由：

- 两个图片页共享 80% UI 和加载状态。
- 字段差异小，通过 selector 配置足够。

### Decision 4: useStoreAction 用回调适配列表页和详情页

Hook 负责动作状态和 API 调用：

```ts
useStoreAction({
  storeId,
  onSuccess?: (result) => void;
  onRefetch?: () => void | Promise<void>;
})
```

返回：

- `actionOpen`
- `statusReason`
- `acting`
- `actionError`
- `openAction(action)`
- `closeAction()`
- `setStatusReason(value)`
- `performAction(action, reason?)`
- `confirmDialogProps` 或基础状态给页面组合

理由：

- 详情页需要同步本地 `storeStatus/storeData`
- 列表页需要 refetch 表格、清选择或更新行
- hook 不应硬编码某个页面的 UI。

### Decision 5: 分阶段迁移，先抽最小复用边界

实施顺序：

1. `useCategories`
2. `EntityImagePage`
3. `useStoreAction`
4. `useArticleFormState`

理由：

- categories 和 image page 风险最低，可以快速验证模式。
- store action 有状态机和 reason，需要中等测试。
- article form state 最复杂，最后做，依赖已有页面测试保护。

## Proposed Structure

```txt
src/hooks/
  use-categories.ts
  use-store-action.ts
  use-article-form-state.ts

src/components/admin/
  EntityImagePage.tsx
  ArticleForm.tsx
```

可选共享类型：

```txt
src/components/admin/article-categories.ts
src/components/admin/entity-image-page-types.ts
```

## Risks / Trade-offs

- [Risk] Article create/edit dirty 逻辑被合并后失真  
  → Mitigation: hook 显式支持 `mode: "create" | "edit"`，create 用空值 dirty，edit 用 snapshot dirty。

- [Risk] store action hook 不适配列表页批量操作  
  → Mitigation: 首版 hook 支持单店 action；批量操作保留页面逻辑或通过 `storeIds` 扩展，不能强行塞进单店 API。

- [Risk] EntityImagePage selector 出错导致标题或图片路径丢失  
  → Mitigation: 为 article/store 两个配置加组件测试。

- [Risk] 抽 hook 后现有 tests mock fetch 顺序变化  
  → Mitigation: 更新测试聚焦 endpoint、payload、UI 状态和 toast，而不是脆弱的调用顺序。

- [Risk] CSRF 修复路径被绕过  
  → Mitigation: hook 内部调用统一 admin fetch helper；若当前项目已有 CSRF fetch helper，必须复用。

## Migration Plan

1. 新增 `useCategories` 并迁移 articles list/new/edit。
2. 新增 `EntityImagePage` 并迁移 article/store 图片页。
3. 新增 `useStoreAction` 并迁移 store detail；再迁移 stores list 的单行 action。
4. 新增 `useArticleFormState` 并迁移 article new/edit 页面。
5. 补测试和重复检查脚本。

Rollback：

- 每个 hook 独立迁移，可单页回退。
- `ArticleForm` UI 不大改，回退成本低。

## Open Questions

- `useStoreAction` 是否在首批支持批量操作：建议首批先支持单店动作，批量保留页面层，下一批再抽。
- `ArticleForm` props 是否需要改为 `value/onChange` 单对象模式：建议先不改，避免破坏现有组件测试。
