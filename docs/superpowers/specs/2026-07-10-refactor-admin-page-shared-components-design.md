---
comet_change: refactor-admin-page-shared-components
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-10-refactor-admin-page-shared-components
status: final
---

# Design Doc — 后台页面共享模式提取

## Context

`src/app/admin/(dashboard)/` 中多个页面存在四类重复逻辑：

- 文章分类加载：`articles/page.tsx`、`articles/new/page.tsx`、`articles/[id]/page.tsx` 三处复制 `/api/articles/categories` fetch + fallback（~30 行/处）
- 文章表单状态：`articles/new/page.tsx` 和 `articles/[id]/page.tsx` 复制 12+ 字段 state、校验、fieldErrors、dirty、submit payload 构造（~200 行/页）
- 图片管理页：`articles/[id]/image/page.tsx` 和 `stores/[id]/image/page.tsx` 复制 loading/error/refetch/breadcrumb/uploader 页面骨架（~120 行/页）
- 门店状态操作：`stores/[id]/page.tsx` 和 `stores/page.tsx` 复制 action dialog state、reason、acting、error、POST 调用和 toast（~50 行/处）

项目已有 `useUnsavedChangesGuard` hook 模式作为参考模板，`ArticleForm` 和 `StoreForm` 已拆分为纯 UI 组件。本 change 专注于提取页面层的共享状态和数据逻辑。

## Architecture

### 整体数据流

```
页面层 (src/app/admin/(dashboard)/)
  articles/new/page.tsx  ─┐
  articles/[id]/page.tsx ─┤──→ useArticleFormState() ──→ ArticleForm (纯 UI)
  articles/page.tsx ──────┤
                           └──→ useCategories()       ──→ 筛选/表单分类选项
  articles/[id]/image/ ───┐
  stores/[id]/image/ ─────┘──→ EntityImagePage        ──→ EntityImageUploader
  stores/[id]/page.tsx ───┐
  stores/page.tsx ────────┘──→ useStoreAction()       ──→ ConfirmDialog + toast
```

### 四个共享单元

| 单元 | 类型 | 文件 | 收敛对象 |
|------|------|------|---------|
| useCategories | Hook | `src/hooks/use-categories.ts` | 3 处分类加载 |
| EntityImagePage | 组件 | `src/components/admin/EntityImagePage.tsx` | 2 个图片管理页 |
| useStoreAction | Hook | `src/hooks/use-store-action.ts` | 2 处门店状态操作 |
| useArticleFormState | Hook | `src/hooks/use-article-form-state.ts` | 2 处文章表单状态 |

## Component/Hook Interfaces

### useCategories

```typescript
export const ARTICLE_CATEGORIES_FALLBACK: CategoryOption[] = [
  { value: "产品资讯", label: "产品资讯" },
  { value: "施工案例", label: "施工案例" },
  { value: "公司动态", label: "公司动态" },
  { value: "行业新闻", label: "行业新闻" },
];

export function useCategories(): {
  categories: CategoryOption[];
  loading: boolean;
  error: string | null;
}
```

- 使用 `adminCsrfFetch("/api/articles/categories")` 统一 fetch 方式
- 失败或无效响应自动返回 `CATEGORIES_FALLBACK`
- `useEffect` + cleanup flag 防内存泄漏
- 三页面替换：删除 ~30 行 → `const { categories } = useCategories()`

### EntityImagePage

```typescript
interface EntityImagePageConfig {
  entity: "article" | "store";
  entityId: string;
  fetchEndpoint: string;
  backHref: string;
  crumbLabel: string;
  title: string;
  storageHint: string;
  selectData: (json: unknown) => {
    id: string;
    name: string;
    imagePath: string | null;
  };
}
```

- `selectData` 函数适配不同 API 返回格式：
  - article: `json.data.title` / `json.data.featuredImage`
  - store: `json.data.name` / `json.data.imagePath`
- 统一处理：loading spinner、error + retry button、breadcrumb、EntityImageUploader
- 两页面替换：120 行 → `<EntityImagePage {...config} />`

### useStoreAction

```typescript
type StoreAction = "open" | "close" | "suspend" | "terminate";

function useStoreAction(storeId: string, options?: {
  onSuccess?: (result: { action: StoreAction; newStatus?: string }) => void;
}): {
  actionOpen: StoreAction | null;
  statusReason: string;
  acting: boolean;
  actionError: string | null;
  openAction: (action: StoreAction) => void;
  closeAction: () => void;
  setStatusReason: (v: string) => void;
  performAction: (action: StoreAction, reason?: string) => Promise<void>;
}
```

- `performAction` 内部：POST `/api/stores/{id}/{action}` → toast → onSuccess 回调
- `suspend`/`terminate` 的 reason 校验由页面在调用 `performAction` 前处理
- `onSuccess` 回调：详情页更新 `storeStatus`，列表页 `fetchStores()`
- 首批只支持单店操作；批量操作保留在 stores/page.tsx 页面层
- 页面不直接控制 toast — hook 内部统一文案

### useArticleFormState

```typescript
function useArticleFormState(mode: "create" | "edit", options?: {
  initialData?: ArticleFormInput;
  articleId?: string;
}): {
  // 字段 value/onChange 对（与 ArticleForm props 一一对应）
  title: string; onTitleChange: (v: string) => void;
  slug: string; onSlugChange: (v: string) => void;
  slugManuallyEdited: boolean;
  excerpt: string; onExcerptChange: (v: string) => void;
  content: string; onContentChange: (v: string) => void;
  featuredImage: string; onFeaturedImageChange: (v: string) => void;
  category: string; onCategoryChange: (v: string) => void;
  tags: string[]; onTagsChange: (v: string[]) => void;
  status: ArticleStatus; onStatusChange: (v: ArticleStatus) => void;
  isSticky: boolean; onIsStickyChange: (v: boolean) => void;
  // 元状态
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  saving: boolean;
  dirty: boolean;
  serverError: string | null;
  // 操作
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}
```

**create 模式行为**：
- 所有字段初始值为空字符串/空数组/`"draft"`
- dirty = 任一字段非空（通过 useMemo）
- `handleSubmit` → POST `/api/articles`
- 自动 slug 生成：title 变化且 slug 未被手动编辑时，自动生成时间戳 slug

**edit 模式行为**：
- `initialData` 加载后设为 snapshot（useRef）
- dirty = 当前值与 snapshot 的深度比对
- `handleSubmit` → PUT `/api/articles/${articleId}`
- 保存成功后自动更新 snapshot
- slug 不自动生成（已存在 slug 不应被覆盖）

**两模式共用**：
- `validateArticleForm(input)` 客户端校验
- server `fieldErrors` 映射回表单
- `useUnsavedChangesGuard(dirty, saving)` 离开保护
- toast 成功/失败文案

## Data Flow (per unit)

### useCategories 数据流
```
useCategories()
  │
  ├─ useEffect → adminCsrfFetch("/api/articles/categories")
  │              │
  │              ├─ success → setCategories(data.categories)
  │              └─ failure → setCategories(FALLBACK)
  │
  └─ return { categories, loading, error }
```

### EntityImagePage 数据流
```
EntityImagePage({ fetchEndpoint, selectData, ... })
  │
  ├─ useState: entity, loading, error
  ├─ useEffect → fetch(fetchEndpoint) → selectData(json) → setEntity
  ├─ loading  → <Loader2 spinner>
  ├─ error    → <error message + retry button>
  └─ success  → <breadcrumb + title + EntityImageUploader + storage hint>
       │
       └─ EntityImageUploader.onUploadSuccess / onDeleteSuccess → refetch()
```

### useStoreAction 数据流
```
useStoreAction(storeId, { onSuccess })
  │
  ├─ openAction("suspend") → setActionOpen("suspend")
  ├─ 页面渲染 ConfirmDialog，用户填 reason
  ├─ performAction("suspend", reason)
  │   ├─ POST /api/stores/{id}/suspend  { statusReason }
  │   ├─ success → toast.success → onSuccess → closeAction()
  │   └─ failure → toast.error → setActionError
  └─ return { actionOpen, acting, actionError, ... }
```

### useArticleFormState 数据流
```
useArticleFormState("create" | "edit", { initialData?, articleId? })
  │
  ├─ 12 个 useState 字段
  ├─ useMemo: dirty (create: any non-empty; edit: compare to snapshot)
  ├─ useUnsavedChangesGuard(dirty, saving)
  │
  └─ handleSubmit(e)
      ├─ validateArticleForm(input) → fieldErrors
      ├─ POST/PUT /api/articles[/{id}]
      ├─ success → toast → router.push → (edit: updateSnapshot)
      └─ failure → toast.error → map server fieldErrors
```

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| create/edit dirty 逻辑合并后失真 | `mode` 参数显式分支，不共享 dirty 计算 |
| EntityImagePage selectData 出错 | article + store 两种配置各自组件测试 |
| useStoreAction 不适配列表页批量操作 | 首批不做批量；批量保留页面层，下次独立 hook |
| 现有测试 mock 顺序变化导致失败 | 迁移时每个页面单元验证，必要时更新 mock |
| CSRF fetch 路径被绕过 | useCategories 和 useStoreAction 内部使用 `adminCsrfFetch` |

## Implementation Order

按风险从低到高：

1. **useCategories** — 风险最低，三页面替换简单，验证分类字典
2. **EntityImagePage** — 组件化，独立测试，两页面替换
3. **useStoreAction** — 有状态机和 toast，中风险
4. **useArticleFormState** — 最复杂，页面已有测试保护
5. **Duplication Guard** — check-admin-page-duplication.mjs
6. **收尾** — typecheck + test + build

## Duplication Guard

`scripts/check-admin-page-duplication.mjs`：
- 检测 `/api/articles/categories` 加载不在 `use-categories.ts` 中的使用
- 检测 image page 文件重复 `EntityImageUploader` + `refetch` + `Loader2` 模式
- 检测 store action state 集群 (`actionOpen`/`statusReason`/`acting`/`actionError`) 不在 `use-store-action.ts` 中的出现
- 允许共享 hooks/components 内部的模式
- 作为 `npm run check:admin-page-duplication` 加入 CI 链
