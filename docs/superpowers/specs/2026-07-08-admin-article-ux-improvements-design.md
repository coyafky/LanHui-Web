---
comet_change: admin-article-ux-improvements
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-08-admin-article-ux-improvements
status: final
---

# Admin Article UX 改进 — 技术设计

## 架构

```
src/lib/validations/article.ts          ← 扩展：ArticleFormSchema + validateArticleForm()
src/components/admin/ArticleForm.tsx    ← 新增：共享表单（替代 ArticleEditor.tsx）
src/hooks/use-unsaved-changes-guard.ts  ← 新增：离开保护 hook
src/app/admin/(dashboard)/articles/
  new/page.tsx   ← 改造：使用 ArticleForm
  [id]/page.tsx  ← 改造：使用 ArticleForm + dirty + 离开保护
  page.tsx       ← 改造：confirm() → ConfirmDialog
```

## 组件

### ArticleForm (`src/components/admin/ArticleForm.tsx`)

受控组件，不管理自身状态。替代死代码 `ArticleEditor.tsx`（零引用，删除）。

接口：

```ts
interface ArticleFormProps {
  mode: "create" | "edit";
  title: string; onTitleChange: (v: string) => void;
  slug: string; onSlugChange: (v: string) => void;
  excerpt: string; onExcerptChange: (v: string) => void;
  content: string; onContentChange: (v: string) => void;
  featuredImage: string; onFeaturedImageChange: (v: string) => void;
  category: string; onCategoryChange: (v: string) => void;
  tags: string[]; onTagsChange: (v: string[]) => void;
  status: ArticleStatus; onStatusChange: (v: ArticleStatus) => void;
  isSticky: boolean; onIsStickyChange: (v: boolean) => void;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  saving: boolean;
  categories: CategoryOption[];
  slugManuallyEdited?: boolean;
  autoSlug?: boolean;
}
```

相比 ArticleEditor 新增：
- `featuredImage` 字段（API 已支持，但现有 new/edit 页缺失）
- `fieldErrors` 属性（字段级错误展示）
- `categories` 动态传入（替代 ArticleEditor 的硬编码 CATEGORIES）
- 每个字段下方错误文案，错误字段红色边框
- `mode="create"` 时不显示 archived 状态选项

### use-unsaved-changes-guard (`src/hooks/use-unsaved-changes-guard.ts`)

```ts
function useUnsavedChangesGuard(dirty: boolean, saving: boolean): {
  confirmLeave: (next: () => void) => void;
}
```

三层保护：
1. `beforeunload` — 浏览器刷新/关闭 tab
2. document click 委托 — 拦截同源 `<a>` 点击，排除 target="_blank"/修饰键/download/hash
3. `confirmLeave(callback)` — 供 router.push 场景

离开弹窗：title="有未保存的修改"，description="离开后当前编辑内容将丢失，确定离开吗？"，confirmLabel="离开页面"，cancelLabel="继续编辑"，variant="danger"

### 校验 (`src/lib/validations/article.ts` 扩展)

```ts
export const ArticleFormSchema = z.object({...});
export type ArticleFormInput = z.infer<typeof ArticleFormSchema>;

export function validateArticleForm(input: ArticleFormInput): {
  valid: boolean;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
}
```

规则：title/content 必填；slug 可选但只允许 `[a-z0-9-]`；excerpt ≤300 字；published 时 category 必填；tags trim/去空/去重；featuredImage 匹配 `/images/articles/*.webp`

### 文章列表 ConfirmDialog (`src/app/admin/(dashboard)/articles/page.tsx`)

联合类型管理确认状态：

```ts
type PendingArticleConfirm =
  | { type: "single"; article: Article; action: ArticleAction }
  | { type: "delete"; article: Article }
  | { type: "bulk"; action: "publish" | "withdraw" | "archive" | "delete"; ids: string[] }
  | null;
```

文案映射：
- 置顶/取消置顶：跳过确认
- delete: variant="danger", "删除后不可恢复"
- 批量删除: variant="danger", "此操作不可撤销"
- bulk: 显示文章数量

## 风险

- **ArticleEditor 删除**: 已验证零引用，安全
- **离开保护误拦**: 通过排除修饰键/new-tab/download/hash 最小化
- **浏览器后退**: 仅 best-effort（beforeunload 可被浏览器策略限制）
- **Page 级测试**: 需 mock `useSearchParams`；降级为 hook+validation 单测 + Playwright 手动验收
