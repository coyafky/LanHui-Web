---
comet_change: split-admin-articles-and-forms
role: technical-design
canonical_spec: openspec
---

# Design Doc — 管理后台巨石组件拆分

## Context

`articles/page.tsx`（682行）、`StoreForm.tsx`（562行）、`ArticleForm.tsx`（438行）三个文件以单文件承载筛选、表格、表单的全部逻辑。需按 UI 区域拆分为独立子组件，降低单文件复杂度，提高可维护性。

项目已有 `split-admin-stores-page` 覆盖 stores 列表页拆分，本 change 互补——负责 articles 列表 + 两个表单拆分，并在 `src/components/admin/shared/` 沉淀共享组件。

## Architecture

### 拆分原则

- 按 UI 区域切分，不按数据流切分
- 子组件纯展示 + callback props，不持有内部数据请求
- 所有 state、副作用（API 调用、toast、router）保留在页面/表单容器中
- 与现有 `src/components/admin/` 目录结构一致

### 目标文件布局

```
src/components/admin/
├── articles/                          # 新增
│   ├── ArticleFilterBar.tsx           # 搜索 + 状态筛选 + 分类筛选
│   ├── ArticleTable.tsx               # 表格 + 列定义 + 复选列 + 空状态
│   ├── ArticleRowMenu.tsx             # 行操作 dropdown
│   ├── ArticleBulkToolbar.tsx         # 批量操作栏
│   ├── ArticleTitleSlugFields.tsx     # 标题 + slug 联动
│   ├── ArticleContentEditor.tsx       # 正文编辑/预览
│   ├── ArticleMetaFields.tsx          # 分类/状态/置顶
│   └── ArticleTagInput.tsx            # 标签输入/展示
├── stores/                            # 已有（补充）
│   ├── StoreBasicInfoFields.tsx       # 名称/地址/坐标
│   ├── StoreContactFields.tsx         # 电话/微信/营业时间
│   ├── StoreLevelSelect.tsx           # 级别选择 + badge
│   └── StoreImageUploader.tsx         # 图片上传
├── shared/                            # 新增
│   ├── PaginationBar.tsx              # 通用分页
│   ├── EmptyState.tsx                 # 通用空状态
│   └── types.ts                       # 共享类型定义
├── StoreForm.tsx                      # 拆分 → 薄容器
├── ArticleForm.tsx                    # 拆分 → 薄容器
```

## Component Interfaces

### Articles page

```typescript
// ArticleFilterBar — 筛选栏
interface ArticleFilterBarProps {
  search: string; statusFilter: string; categoryFilter: string;
  categories: CategoryOption[];
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
}

// ArticleTable — 表格（含 thead/tbody/空状态/loading skeleton）
interface ArticleTableProps {
  articles: Article[];
  selectedIds: Set<string>;
  loading: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onTogglePublish: (a: Article) => void;
  onToggleSticky: (a: Article) => void;
  onDelete: (a: Article) => void;
  openMenuId: string | null;
  onOpenMenu: (id: string | null) => void;
  containerRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
}

// ArticleBulkToolbar — 批量操作（仅 selectedCount > 0 时渲染）
interface ArticleBulkToolbarProps {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClear: () => void;
}

// ArticleRowMenu — 单行操作 dropdown
interface ArticleRowMenuProps {
  article: Article;
  open: boolean;
  onTogglePublish: () => void;
  onToggleSticky: () => void;
  onDelete: () => void;
  onClose: () => void;
  containerRef: (el: HTMLDivElement | null) => void;
}
```

### StoreForm field groups

```typescript
interface StoreBasicInfoFieldsProps {
  name: string; onNameChange: (v: string) => void;
  address: string; onAddressChange: (v: string) => void;
  latitude: number | null; onLatitudeChange: (v: number | null) => void;
  longitude: number | null; onLongitudeChange: (v: number | null) => void;
  errors: Record<string, string | undefined>;
  readOnly: boolean;
}

interface StoreContactFieldsProps {
  phone: string; onPhoneChange: (v: string) => void;
  wechat: string; onWechatChange: (v: string) => void;
  businessHours: string; onBusinessHoursChange: (v: string) => void;
  errors: Record<string, string | undefined>;
  readOnly: boolean;
}

interface StoreLevelSelectProps {
  value: StoreLevel; onChange: (v: StoreLevel) => void;
  readOnly: boolean;
}

interface StoreImageUploaderProps {
  imageUrl: string; onImageChange: (v: string) => void;
  entityId?: string;
  readOnly: boolean;
}
```

### ArticleForm field groups

```typescript
interface ArticleTitleSlugFieldsProps {
  title: string; onTitleChange: (v: string) => void;
  slug: string; onSlugChange: (v: string) => void;
  autoSlug: boolean; slugManuallyEdited: boolean;
  errors: Record<string, string | undefined>;
  fieldRefs: (field: string, el: HTMLElement | null) => void;
}

interface ArticleContentEditorProps {
  excerpt: string; onExcerptChange: (v: string) => void;
  content: string; onContentChange: (v: string) => void;
  featuredImage: string; onFeaturedImageChange: (v: string) => void;
  previewMode: "edit" | "preview";
  onPreviewToggle: () => void;
  errors: Record<string, string | undefined>;
  fieldRefs: (field: string, el: HTMLElement | null) => void;
}

interface ArticleMetaFieldsProps {
  category: string; onCategoryChange: (v: string) => void;
  status: ArticleStatus; onStatusChange: (v: ArticleStatus) => void;
  isSticky: boolean; onIsStickyChange: (v: boolean) => void;
  categories: CategoryOption[];
  mode: "create" | "edit";
  errors: Record<string, string | undefined>;
  fieldRefs: (field: string, el: HTMLElement | null) => void;
}
```

### Shared components

```typescript
interface PaginationBarProps {
  page: number; totalPages: number;
  onPrev: () => void; onNext: () => void;
}

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string; description: string;
}
```

## Type Migration

`Article`、`Pagination`、`ArticleAction`、`PendingArticleConfirm`、`ACTION_LABELS`、`STATUS_MAP`、`STATUS_OPTIONS`、`CATEGORIES_FALLBACK`、`CategoryOption` 从 `articles/page.tsx` 移到 `shared/types.ts`，由 `ArticleFilterBar`、`ArticleTable`、`ArticleRowMenu`、`ArticleBulkToolbar` 共同导入。

## Data Flow

```
ArticlesPageContent（持有所有 state + fetchArticles + handleConfirmAction）
  ├─► ArticleFilterBar（props → onChange callbacks → setState）
  ├─► ArticleBulkToolbar（onAction → setPendingConfirm → ConfirmDialog → handleConfirmAction）
  ├─► ArticleTable（articles/selectedIds → ArticleRowMenu per row）
  └─► PaginationBar（page/totalPages → onPrev/onNext → setPagination）

StoreForm（持有所有字段 state + handleSubmit + formId）
  ├─► StoreBasicInfoFields / StoreContactFields / StoreLevelSelect / StoreImageUploader

ArticleForm（持有 tagInput/previewMode + handleFormSubmit + slug联动逻辑）
  ├─► ArticleTitleSlugFields / ArticleContentEditor / ArticleMetaFields / ArticleTagInput
```

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| 类型迁移导致多处导入报错 | 使用 `sed` 更新所有 `articles/page.tsx` 引用为 `shared/types.ts` |
| ArticleForm.test.tsx 导入路径变化失败 | 拆分后第一时间运行测试 |
| StoreForm 无覆盖测试 | 拆分后补基础 smoke test |
| PaginationBar 与 stores 不兼容 | 按最小公共接口设计（page/totalPages/onPrev/onNext） |

## Implementation Order

1. `shared/types.ts` + `shared/PaginationBar.tsx` + `shared/EmptyState.tsx`
2. Articles 页面拆分（FilterBar → Table → BulkToolbar → 页面重构）
3. ArticleForm 拆分（TitleSlug → ContentEditor → MetaFields → TagInput → 重构）
4. StoreForm 拆分（BasicInfo → Contact → LevelSelect → ImageUploader → 重构）
5. 收尾：typecheck + test + lint
