# Comet Design Handoff

- Change: refactor-admin-page-shared-components
- Phase: design
- Mode: compact
- Context hash: f4a1d25ff2b162abef45852f1f63c2c3449d7499c81787ff45996071e7a9153d

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/refactor-admin-page-shared-components/proposal.md

- Source: openspec/changes/refactor-admin-page-shared-components/proposal.md
- Lines: 1-64
- SHA256: 1437cecfef2b7f38cec6e9d693fb66c37edeb3e2c95a44d418821f1ea3a4e64d

```md
## Why

`src/app/admin/(dashboard)/` 中多个页面已经开始抽组件，但页面层仍重复维护相同的加载、表单状态、分类字典、图片管理和状态操作逻辑。重复逻辑让后台功能变得难维护：文章 new/edit 的字段 state 和提交逻辑容易漂移，articles/stores 图片页几乎相同，分类加载复制三处，门店状态动作在列表和详情页重复实现。

现在需要把这些重复收敛成共享 hooks 和配置化组件，让页面只负责路由参数、页面标题和少量布局。

## What Changes

- 保留并强化已有 `src/components/admin/ArticleForm.tsx`，不重复创建第二个 ArticleForm。
- 新增文章表单容器 hook 或状态 hook，例如 `useArticleFormState` / `useArticleEditor`：
  - create/edit 共用字段 state
  - 共用客户端校验
  - 共用 server fieldErrors 映射
  - 共用 dirty/snapshot 逻辑
  - 共用 submit payload 构造
- 新增 `useCategories()` hook：
  - 统一 `/api/articles/categories` 加载逻辑
  - 统一 fallback 分类
  - 供 articles 列表、新建、编辑三处使用
- 新增泛型 `EntityImagePage` 组件：
  - 支持 article/store 两类实体图片页
  - 接收 `entity`、`entityId`、`fetchEndpoint`、`backHref`、`title`、`subtitleLabel`、`imagePathSelector` 等配置
  - 复用 loading/error/refetch/EntityImageUploader UI
- 新增 `useStoreAction()` hook：
  - 统一门店状态操作 open/close、reason、acting、error
  - 统一调用 `/api/stores/{id}/{action}`
  - 统一 toast 成功/失败处理
  - 支持详情页单店操作和列表页行操作/批量操作适配
- 保持现有页面行为、API、CSRF 适配、toast、ConfirmDialog 视觉不变。
- 增加测试和检查脚本，防止四类重复逻辑重新出现在页面文件中。

## Capabilities

### New Capabilities
- `admin-shared-page-patterns`: 后台页面共享模式，定义文章表单状态、分类加载、实体图片管理页和门店状态操作如何复用。

### Modified Capabilities
（无 — 本次不改变后台业务能力，只重构页面层复用结构。）

## Impact

- 新增或修改：
  - `src/hooks/use-article-form-state.ts`
  - `src/hooks/use-categories.ts`
  - `src/hooks/use-store-action.ts`
  - `src/components/admin/EntityImagePage.tsx`
  - `src/components/admin/ArticleForm.tsx`
- 修改页面：
  - `src/app/admin/(dashboard)/articles/page.tsx`
  - `src/app/admin/(dashboard)/articles/new/page.tsx`
  - `src/app/admin/(dashboard)/articles/[id]/page.tsx`
  - `src/app/admin/(dashboard)/articles/[id]/image/page.tsx`
  - `src/app/admin/(dashboard)/stores/page.tsx`
  - `src/app/admin/(dashboard)/stores/[id]/page.tsx`
  - `src/app/admin/(dashboard)/stores/[id]/image/page.tsx`
- 测试：
  - hooks 单元测试
  - EntityImagePage 组件测试
  - 现有 article new/edit/page tests 更新
  - store action hook 测试
- 风险：
  - 文章 new/edit 的 dirty 判定不同，不能强行合并成同一种初始值逻辑
  - store 列表页和详情页状态操作上下文不同，hook 必须支持回调注入
  - 图片页的 article/store 字段名不同，必须通过 selector 或 mapper 配置处理
```

## openspec/changes/refactor-admin-page-shared-components/design.md

- Source: openspec/changes/refactor-admin-page-shared-components/design.md
- Lines: 1-213
- SHA256: 5fd700d2899ba9da848a6a3ab1db0a4f5b2480ecd116dbaabc02f165fadf7a6f

[TRUNCATED]

```md
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
```

Full source: openspec/changes/refactor-admin-page-shared-components/design.md

## openspec/changes/refactor-admin-page-shared-components/tasks.md

- Source: openspec/changes/refactor-admin-page-shared-components/tasks.md
- Lines: 1-79
- SHA256: 01b288f892290a0f2522ef22af1614c62f5c0267d660cbc9e2ea8d885aa2957d

```md
## 1. Baseline Audit

- [ ] 1.1 Confirm current `ArticleForm` usage in article create and edit pages
- [ ] 1.2 Record duplicated category loading blocks in articles list, article create, and article edit pages
- [ ] 1.3 Record duplicated image page behavior in article image and store image routes
- [ ] 1.4 Record duplicated store action state and API logic in stores list and store detail pages
- [ ] 1.5 Run existing article page and ArticleForm tests as a baseline

## 2. Shared Categories Hook

- [ ] 2.1 Create `src/hooks/use-categories.ts`
- [ ] 2.2 Move `ARTICLE_CATEGORIES_FALLBACK` into the shared hook module or adjacent shared constant
- [ ] 2.3 Implement loading, error, fallback, cancellation, and refetch behavior
- [ ] 2.4 Migrate `src/app/admin/(dashboard)/articles/page.tsx` to use `useCategories`
- [ ] 2.5 Migrate `src/app/admin/(dashboard)/articles/new/page.tsx` to use `useCategories`
- [ ] 2.6 Migrate `src/app/admin/(dashboard)/articles/[id]/page.tsx` to use `useCategories`
- [ ] 2.7 Add hook tests for success, API failure, invalid response, and cancellation-safe fallback

## 3. Shared Entity Image Page

- [ ] 3.1 Create `src/components/admin/EntityImagePage.tsx`
- [ ] 3.2 Support configurable `entity`, `entityId`, `fetchEndpoint`, `backHref`, `crumbLabel`, `title`, `storageHint`, `placeholderPath`, and `selectData`
- [ ] 3.3 Preserve existing loading spinner UI
- [ ] 3.4 Preserve existing error retry UI
- [ ] 3.5 Preserve refetch after `EntityImageUploader` upload success and delete success
- [ ] 3.6 Migrate `src/app/admin/(dashboard)/articles/[id]/image/page.tsx` to render `EntityImagePage`
- [ ] 3.7 Migrate `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` to render `EntityImagePage`
- [ ] 3.8 Add component tests for article config and store config

## 4. Shared Store Action Hook

- [ ] 4.1 Create `src/hooks/use-store-action.ts`
- [ ] 4.2 Implement action dialog state: open action, close action, reason, acting, and error
- [ ] 4.3 Implement store action POST request to `/api/stores/{id}/{action}`
- [ ] 4.4 Preserve reason handling for `suspend` and `terminate`
- [ ] 4.5 Preserve success and failure toast behavior
- [ ] 4.6 Support `onSuccess` callback so pages can update local state or refetch
- [ ] 4.7 Migrate `src/app/admin/(dashboard)/stores/[id]/page.tsx` to use `useStoreAction`
- [ ] 4.8 Migrate single-row action logic in `src/app/admin/(dashboard)/stores/page.tsx` where safe; leave bulk action logic local if it does not fit the single-store hook
- [ ] 4.9 Add hook tests for success, API failure, network failure, reason validation, and onSuccess callback

## 5. Shared Article Form State

- [ ] 5.1 Create `src/hooks/use-article-form-state.ts`
- [ ] 5.2 Do not create a second `ArticleForm`; keep using existing `src/components/admin/ArticleForm.tsx`
- [ ] 5.3 Implement create mode initial values, dirty detection, validation, saving state, fieldErrors, and submit payload construction
- [ ] 5.4 Implement edit mode load-to-snapshot flow, dirty detection, validation, saving state, fieldErrors, and submit payload construction
- [ ] 5.5 Preserve auto slug behavior in create mode
- [ ] 5.6 Preserve slug manually edited behavior
- [ ] 5.7 Preserve `useUnsavedChangesGuard` integration for both create and edit
- [ ] 5.8 Migrate `src/app/admin/(dashboard)/articles/new/page.tsx` to use the shared form state hook
- [ ] 5.9 Migrate `src/app/admin/(dashboard)/articles/[id]/page.tsx` to use the shared form state hook
- [ ] 5.10 Add hook tests for create dirty, edit dirty, validation failure, server field errors, successful create, and successful edit snapshot update

## 6. Duplication Guard

- [ ] 6.1 Create `scripts/check-admin-page-duplication.mjs`
- [ ] 6.2 Detect duplicated `/api/articles/categories` loading blocks outside `use-categories`
- [ ] 6.3 Detect duplicated entity image page fetch/refetch/uploader structure outside `EntityImagePage`
- [ ] 6.4 Detect duplicated store action state clusters outside `use-store-action`
- [ ] 6.5 Allow duplicated patterns inside approved shared hooks/components
- [ ] 6.6 Add `check:admin-page-duplication` to `package.json`

## 7. Tests And Verification

- [ ] 7.1 Run `npx vitest run src/components/admin/ArticleForm.test.tsx`
- [ ] 7.2 Run article create/edit/list page tests
- [ ] 7.3 Run new hook tests for `use-categories`, `use-store-action`, and `use-article-form-state`
- [ ] 7.4 Run new `EntityImagePage` tests
- [ ] 7.5 Run `npm run lint`
- [ ] 7.6 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 7.7 Run `npm run build`
- [ ] 7.8 Run `npm run check:admin-page-duplication`

## 8. Follow-up Notes

- [ ] 8.1 Record remaining admin page duplication that is out of scope for this change
- [ ] 8.2 Decide whether bulk store actions should get a separate `useStoreBulkAction` hook in a later change
- [ ] 8.3 Decide whether `ArticleForm` props should later be collapsed to a single `value/onChange` object API
```

## openspec/changes/refactor-admin-page-shared-components/specs/admin-shared-page-patterns/spec.md

- Source: openspec/changes/refactor-admin-page-shared-components/specs/admin-shared-page-patterns/spec.md
- Lines: 1-130
- SHA256: 5c0d049b61c452750d96a7e74a3343bd3a0eb9710c45a1322d253cf64d10b673

[TRUNCATED]

```md
## ADDED Requirements

### Requirement: Shared article categories hook
The system SHALL provide a shared hook for loading article categories from `/api/articles/categories`. Articles list, article create, and article edit pages MUST use the shared hook instead of duplicating fetch and fallback logic.

#### Scenario: Categories load successfully
- **WHEN** `/api/articles/categories` returns `success: true` with categories
- **THEN** the shared hook exposes those categories to the page

#### Scenario: Categories fallback on failure
- **WHEN** the categories request fails or returns an invalid response
- **THEN** the shared hook exposes the shared fallback category list

#### Scenario: All article pages use the hook
- **WHEN** articles list, article create, and article edit pages need category options
- **THEN** they import and use the shared categories hook or shared category source

### Requirement: Shared article form state
The system SHALL provide shared article form state logic for article create and edit pages. The shared logic MUST preserve create/edit differences while removing duplicated field state, validation, dirty detection, and submit payload construction.

#### Scenario: Create mode dirty detection
- **WHEN** a new article form starts empty
- **THEN** it is not dirty until the user changes at least one field from the create defaults

#### Scenario: Edit mode dirty detection
- **WHEN** an edit article form finishes loading existing article data
- **THEN** it stores a snapshot and reports dirty only after the user changes a field from that snapshot

#### Scenario: Client validation reused
- **WHEN** either create or edit form is submitted with invalid values
- **THEN** the shared form state runs `validateArticleForm` and exposes field errors to `ArticleForm`

#### Scenario: Server field errors mapped
- **WHEN** the article save API returns server field errors
- **THEN** the shared form state maps those errors back to `ArticleForm`

#### Scenario: Existing ArticleForm retained
- **WHEN** create and edit pages render the form
- **THEN** they continue to render the existing `ArticleForm` component rather than duplicating form JSX

### Requirement: Shared entity image page
The system SHALL provide a configurable `EntityImagePage` component for admin entity image management. Article image and store image routes MUST use this component for loading, error, retry, breadcrumb, title, uploader, and storage hint UI.

#### Scenario: Article image page
- **WHEN** `/admin/articles/[id]/image` loads successfully
- **THEN** it renders the shared entity image page with article title, article featured image path, and `entity="article"`

#### Scenario: Store image page
- **WHEN** `/admin/stores/[id]/image` loads successfully
- **THEN** it renders the shared entity image page with store name, store image path, and `entity="store"`

#### Scenario: Entity image retry
- **WHEN** the entity fetch fails
- **THEN** the shared page shows the existing retry affordance and retries the configured fetch endpoint when activated

#### Scenario: Entity image refetch after upload or delete
- **WHEN** `EntityImageUploader` reports upload or delete success
- **THEN** the shared page refetches the configured entity data

### Requirement: Shared store action hook
The system SHALL provide a shared hook for store status actions. Store list and store detail pages MUST use the shared hook for action dialog state, reason input state, acting state, error state, API request, and toast handling where applicable.

#### Scenario: Store action success
- **WHEN** a store action request succeeds
- **THEN** the shared hook closes the action dialog, clears the reason, emits success feedback, and calls the configured success callback

#### Scenario: Store action failure
- **WHEN** a store action request fails
- **THEN** the shared hook exposes the error, emits failure feedback, and keeps the page in a recoverable state

#### Scenario: Reason required actions
- **WHEN** the user confirms a `suspend` or `terminate` action without a reason where a reason is required
- **THEN** the hook or consuming page prevents the request and shows a validation message

#### Scenario: Detail page state sync
- **WHEN** a store detail action succeeds and returns a new status
- **THEN** the detail page can update local `storeStatus` and `storeData` through the hook success callback

#### Scenario: List page refresh
- **WHEN** a store list action succeeds
```

Full source: openspec/changes/refactor-admin-page-shared-components/specs/admin-shared-page-patterns/spec.md

