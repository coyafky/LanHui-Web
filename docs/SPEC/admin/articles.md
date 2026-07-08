# SPEC: Admin 文章管理 Articles

> 对应 PRD：`docs/PRD/admin/ARTICLE_MANAGEMENT_PRD.md`
> 当前状态：🔧 部分完成
> 本 SPEC 目标：把文章管理从当前 3 状态 CRUD 补齐为 PRD v1 要求的可发布、可撤回、可归档、可批量、可管理封面图的内容管理模块。
> 最后更新：2026-07-04

---

## 1. 实现目标

### 1.1 必须完成

- 文章状态从 3 状态补齐为 4 状态：`draft | published | withdrawn | archived`。
- 禁止 `published -> draft` 和 `archived -> published` 直连。
- 列表页支持 `withdrawn` 展示、筛选和状态动作。
- 新建/编辑表单按“极简发布”收口：默认只展示标题、分类、正文、封面图；摘要、标签、slug、置顶、发布时间放入更多设置。
- 支持文章封面图上传、替换、删除，统一保存到 `featuredImage`。
- 支持批量多选与批量发布、撤回、归档、删除。
- 所有写操作写入 ActivityLog，状态动作使用独立 action。
- 修复文章列表分类响应 shape 脆弱导致页面崩溃的问题。
- 公开 `/news` 和 `/news/[slug]` 只展示 `published` 文章，详情页稳定渲染 `content`。

### 1.2 不做

- 不做多人协同编辑。
- 不做版本历史和线上版本/修改稿双轨。
- 不做公众号自动发布。
- 不做审核流。
- 不做高级 SEO 独立字段；SEO 仍由标题和摘要/正文生成。

---

## 2. 受影响文件

### 2.1 页面

| 文件 | 改动 |
|---|---|
| `src/app/admin/(dashboard)/articles/page.tsx` | 列表增加 withdrawn、checkbox 批量、批量工具条、状态动作菜单、分类 fallback 防御 |
| `src/app/admin/(dashboard)/articles/new/page.tsx` | 表单改为极简发布结构，slug 默认隐藏，加入封面图入口 |
| `src/app/admin/(dashboard)/articles/[id]/page.tsx` | 编辑页支持 4 状态、归档只读、状态动作、封面图状态、未保存提醒 |
| `src/app/admin/(dashboard)/articles/[id]/image/page.tsx` | 新增文章封面图管理页 |
| `src/app/news/page.tsx` | 保持只请求 published；验收公开列表不泄露 draft/withdrawn/archived |
| `src/app/news/[slug]/page.tsx` | 确保 content 稳定渲染，未命中返回 404 |

### 2.2 API

| 文件 | 改动 |
|---|---|
| `src/app/api/articles/route.ts` | 创建文章、列表查询、公开过滤、ActivityLog、revalidate |
| `src/app/api/articles/[id]/route.ts` | 获取、内容更新、删除；公开 GET 只允许 published；admin/editor 可预览非 published |
| `src/app/api/articles/[id]/[action]/route.ts` | 新增：状态动作与置顶动作 |
| `src/app/api/articles/bulk/route.ts` | 新增：批量发布、撤回、归档、删除 |
| `src/app/api/articles/categories/route.ts` | 保持公开分类字典，前端必须防御异常 shape |
| `src/app/api/upload/route.ts` | 扩展 `entity="article"`；article 上传 editor+，store 上传仍 admin |

### 2.3 数据与校验

| 文件 | 改动 |
|---|---|
| `src/lib/validations/article.ts` | status enum 增加 `withdrawn`；`featuredImage` 改为本地路径校验 |
| `src/lib/data.ts` | `mapApiArticle` 保证 `content` 字段存在 |
| `src/lib/news.ts` | 静态 fallback 的 `NewsItem.content` 改为必填 |
| `prisma/schema.prisma` | 不需要新增列；`status` 当前为 String，可直接存 withdrawn |
| `prisma/seed.ts` | 可选：补充 withdrawn 示例文章 |

### 2.4 测试

| 文件 | 改动 |
|---|---|
| `src/app/api/articles/route.test.ts` | 创建、公开过滤、publishedAt、ActivityLog |
| `src/app/api/articles/[id]/route.test.ts` | 详情、更新、删除、权限、非 published 公开不可见 |
| `src/app/api/articles/[id]/[action]/route.test.ts` | 新增状态机动作测试 |
| `src/app/api/articles/bulk/route.test.ts` | 新增批量操作测试 |
| `src/app/api/upload/route.test.ts` | 增加 article 上传/删除测试 |
| `src/app/admin/(dashboard)/articles/page.test.tsx` | 修复分类 shape 崩溃，增加批量 UI 测试 |
| `e2e/articles.spec.ts` | 新增核心 e2e：创建、发布、撤回、公开可见性、封面图 |

---

## 3. 数据模型与校验

### 3.1 Article 状态

```ts
export const ARTICLE_STATUSES = [
  "draft",
  "published",
  "withdrawn",
  "archived",
] as const;
```

状态含义：

| 状态 | 官网可见 | 后台可编辑 | 说明 |
|---|---:|---:|---|
| `draft` | 否 | 是 | 从未正式发布 |
| `published` | 是 | 是 | 当前线上展示，保存即更新线上 |
| `withdrawn` | 否 | 是 | 曾发布，当前撤回 |
| `archived` | 否 | 默认只读 | 历史内容，不再维护 |

### 3.2 Zod

`src/lib/validations/article.ts`：

```ts
const LOCAL_ARTICLE_IMAGE_REGEX = /^\/images\/articles\/[a-zA-Z0-9_-]+\.webp$/;

export const ArticleCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空"),
  slug: z.string().trim().min(1).optional(),
  excerpt: z.string().trim().max(300, "摘要不能超过 300 字").optional().nullable(),
  content: z.string().trim().min(1, "内容不能为空"),
  featuredImage: z
    .string()
    .regex(LOCAL_ARTICLE_IMAGE_REGEX, "封面图路径无效")
    .optional()
    .nullable(),
  category: z.string().trim().min(1, "请选择分类").optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(ARTICLE_STATUSES).default("draft"),
  isSticky: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});
```

发布前校验：

- `title` 必须非空。
- `content` 必须非空。
- `category` 必须非空。
- `slug` 必须存在且唯一。
- `featuredImage` 是否必填保持 PRD 待确认，本期不阻断发布，但显示提醒。

---

## 4. 状态机

### 4.1 允许转换

| action | from | to | 权限 | 前置条件 |
|---|---|---|---|---|
| `publish` | `draft` | `published` | admin/editor | 发布校验通过 |
| `withdraw` | `published` | `withdrawn` | admin/editor | 必须确认，可选填写原因 |
| `republish` | `withdrawn` | `published` | admin/editor | 发布校验通过 |
| `archive` | `draft`, `withdrawn` | `archived` | admin/editor | 二次确认 |
| `restore` | `archived` | `draft` | admin/editor | 二次确认 |
| `sticky` | any | same | admin/editor | `isSticky=false` |
| `unsticky` | any | same | admin/editor | `isSticky=true` |

### 4.2 禁止转换

| from | to | 处理 |
|---|---|---|
| `published` | `draft` | 409，提示“已发布文章需先撤回” |
| `archived` | `published` | 409，提示“归档文章需先恢复为草稿” |
| `published` | `archived` | 409，提示“已发布文章需先撤回再归档” |

### 4.3 Action API

新增：`src/app/api/articles/[id]/[action]/route.ts`

```ts
POST /api/articles/:id/:action
```

`action`：

```ts
type ArticleAction =
  | "publish"
  | "withdraw"
  | "republish"
  | "archive"
  | "restore"
  | "sticky"
  | "unsticky";
```

请求 body：

```ts
{
  reason?: string;
}
```

成功响应：

```ts
{
  success: true,
  data: Article
}
```

错误：

| code | 场景 |
|---|---|
| 400 | action 非法、发布校验失败、reason 超长 |
| 401 | 未登录 |
| 403 | 非 admin/editor |
| 404 | 文章不存在 |
| 409 | 状态转换非法 |
| 500 | DB 或未知错误 |

---

## 5. 列表页实现

文件：`src/app/admin/(dashboard)/articles/page.tsx`

### 5.1 列表列

保持 7 列：

1. checkbox + 标题
2. 分类
3. 状态
4. 作者
5. 发布时间
6. 浏览
7. 操作

### 5.2 状态展示

```ts
const STATUS_MAP = {
  draft: { label: "草稿", className: "bg-zinc-700 text-zinc-300" },
  published: { label: "已发布", className: "bg-emerald-900/50 text-emerald-400" },
  withdrawn: { label: "已撤回", className: "bg-amber-900/50 text-amber-400" },
  archived: { label: "已归档", className: "bg-yellow-900/50 text-yellow-400" },
};
```

筛选项增加 `withdrawn`。

### 5.3 分类加载防御

当前问题：`json.success && json.data` 时直接 `setCategories(json.data.categories)`，异常 shape 会导致 `categories.map` 崩溃。

必须改为：

```ts
const nextCategories = Array.isArray(json.data?.categories)
  ? json.data.categories
  : CATEGORIES_FALLBACK;
setCategories(nextCategories);
```

`new/page.tsx` 和 `[id]/page.tsx` 同步使用同一防御。

### 5.4 单行菜单

菜单项根据状态生成：

| 当前状态 | 菜单 |
|---|---|
| `draft` | 编辑、发布、归档、置顶/取消置顶、删除 |
| `published` | 编辑、撤回、置顶/取消置顶 |
| `withdrawn` | 编辑、重新发布、归档、置顶/取消置顶、删除 |
| `archived` | 查看、恢复为草稿、删除 |

删除权限：

- admin 可以删除。
- editor 不显示删除；若直接调用 API 返回 403。

### 5.5 批量选择

新增 state：

```ts
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
```

行为：

- 当前页全选 / 反选 / 清空。
- 切换筛选、搜索、分页后清空已选。
- 工具条显示“已选择 N 篇”。

批量按钮：

- 发布：仅对 `draft` 执行，其他返回 skipped。
- 撤回：仅对 `published` 执行。
- 归档：仅对 `draft | withdrawn` 执行。
- 删除：admin only。

---

## 6. 新建与编辑页

### 6.1 默认表单结构

默认展示：

1. 标题
2. 分类
3. 正文 Markdown textarea
4. 封面图状态和入口

更多设置折叠区：

- 摘要
- 标签
- slug 只读展示或复制
- 置顶
- 当前状态
- 发布时间

### 6.2 Slug

- 新建时从标题自动生成，运营默认不需要编辑。
- published 文章 slug 锁定，不允许编辑。
- draft/withdrawn 可通过“更多设置”高级操作修改 slug。
- slug 冲突返回 409 并定位到 slug 提示。

### 6.3 归档只读

`archived` 文章默认只读：

- 表单字段 disabled。
- 顶部显示“该文章已归档，仅供查看”。
- 只显示“恢复为草稿”动作。

### 6.4 未保存提醒

新建/编辑页跟踪 dirty：

```ts
const [dirty, setDirty] = useState(false);
```

离开提醒：

- 浏览器刷新/关闭：`beforeunload`。
- 点击返回列表：如果 dirty，使用 confirm。
- 保存成功后 dirty=false。

### 6.5 保存失败

- 不清空用户输入。
- 顶部 inline error。
- 400 使用 `details` 字段级展示。
- 401 提示重新登录。
- 409 显示冲突信息。

---

## 7. 文章封面图

### 7.1 页面

新增：`src/app/admin/(dashboard)/articles/[id]/image/page.tsx`

职责：

- 拉取 `/api/articles/:id`。
- 显示当前 `featuredImage`。
- 使用 `EntityImageUploader`。
- 上传/删除后 refetch。

示例：

```tsx
<EntityImageUploader
  entity="article"
  entityId={article.id}
  currentPath={article.featuredImage}
  placeholderPath="/images/placeholders/article.webp"
/>
```

### 7.2 Upload API

扩展 `src/app/api/upload/route.ts`。

`ENTITY_DIR`：

```ts
const ENTITY_DIR = {
  store: "stores",
  article: "articles",
};
```

权限：

| entity | POST | DELETE |
|---|---|---|
| store | admin | admin |
| article | admin/editor | admin/editor |

路径：

```text
public/images/articles/{article.id}.webp
/images/articles/{article.id}.webp
```

DB 更新：

```ts
prisma.article.update({
  where: { id: article.id },
  data: { featuredImage: rel },
});
```

删除：

- 仅删除以 `/images/articles/` 开头的本地文件。
- DB 设置 `featuredImage: null`。

---

## 8. 批量 API

新增：`src/app/api/articles/bulk/route.ts`

```ts
POST /api/articles/bulk
```

权限：admin only。

请求：

```ts
{
  action: "publish" | "withdraw" | "archive" | "delete";
  ids: string[];
  reason?: string;
}
```

响应：

```ts
{
  success: true,
  data: {
    action: string;
    requested: number;
    succeeded: number;
    skipped: Array<{ id: string; reason: string }>;
    failed: Array<{ id: string; error: string }>;
  }
}
```

实现规则：

- `ids` 最多 100 条。
- 每篇文章逐条执行状态机规则。
- 删除只允许 admin。
- 每条成功操作写 ActivityLog。
- 批量删除必须二次确认在前端完成。

---

## 9. ActivityLog

### 9.1 action 命名

统一使用带 entity 前缀：

| 操作 | action |
|---|---|
| 创建 | `article.create` |
| 内容更新 | `article.update` |
| 发布 | `article.publish` |
| 撤回 | `article.withdraw` |
| 重新发布 | `article.republish` |
| 归档 | `article.archive` |
| 恢复 | `article.restore` |
| 置顶 | `article.sticky` |
| 取消置顶 | `article.unsticky` |
| 删除 | `article.delete` |
| 批量操作 | 每条记录仍写具体单条 action，不只写 bulk |

### 9.2 事务

写操作必须使用事务：

```ts
const [article] = await prisma.$transaction([
  prisma.article.update({ where: { id }, data }),
  prisma.activityLog.create({ data: activity }),
]);
```

如果当前 `logActivity` helper 无法放进事务，新增可复用 helper：

```ts
function buildActivityLogData(input): Prisma.ActivityLogCreateInput
```

---

## 10. 公开新闻页

### 10.1 `/news`

- 只能请求 `status=published`。
- 排序：`isSticky desc`，`publishedAt desc`。
- 不展示 draft/withdrawn/archived。

### 10.2 `/news/[slug]`

- 未命中 published 文章时返回 404。
- `ArticleContent` 渲染 `content`。
- `NewsItem.content` 改为必填。
- 静态 fallback `src/lib/news.ts` 每条必须补 `content`，避免 fallback 时详情空白。

---

## 11. revalidate

所有写操作完成后执行：

```ts
revalidatePath("/admin/articles");
revalidatePath("/news");
if (article.slug) revalidatePath(`/news/${article.slug}`);
```

slug 变化时：

```ts
revalidatePath(`/news/${oldSlug}`);
revalidatePath(`/news/${newSlug}`);
```

---

## 12. 验收测试

### 12.1 Unit / API

必须新增或更新：

```bash
npx vitest run src/app/api/articles/route.test.ts
npx vitest run 'src/app/api/articles/[id]/route.test.ts'
npx vitest run 'src/app/api/articles/[id]/[action]/route.test.ts'
npx vitest run src/app/api/articles/bulk/route.test.ts
npx vitest run src/app/api/articles/categories/route.test.ts
npx vitest run src/app/api/upload/route.test.ts
```

覆盖：

- editor 可以 create/update/action。
- editor 删除返回 403。
- published 公开可见。
- draft/withdrawn/archived 公开 GET 返回 404。
- `published -> draft` 返回 409。
- `published -> withdraw -> republish` 成功。
- `archived -> restore -> draft` 成功。
- 批量操作返回 succeeded/skipped/failed。
- article 上传写 `featuredImage`，删除置 null。

### 12.2 Component

```bash
npx vitest run 'src/app/admin/(dashboard)/articles/page.test.tsx'
```

覆盖：

- 分类 API 返回异常 shape 时不崩溃。
- withdrawn 出现在状态筛选。
- checkbox 全选/反选/清空。
- 批量工具条显示选择数量。
- editor 不显示删除按钮。

### 12.3 E2E

新增 `e2e/articles.spec.ts`：

- admin 创建草稿。
- 发布后 `/news` 可见。
- 撤回后 `/news` 不可见。
- 重新发布后 `/news/[slug]` 200。
- 归档后编辑页只读。
- editor 不能删除。
- 上传封面图后编辑页显示路径。

### 12.4 Browser checks

前端完成后检查：

- 390px：列表横向滚动可用，批量工具条不遮挡。
- 768px：筛选栏换行正常。
- 1440px：7 列完整，kebab 菜单不被裁切。

---

## 13. 实施顺序

### Phase 1：稳定性修复

1. 修复分类 shape 崩溃。
2. `NewsItem.content` 改必填，补静态 content。
3. 更新公开详情页相关测试。

### Phase 2：状态机

1. `ArticleCreateSchema` 增加 `withdrawn`。
2. 新增 article action route。
3. 列表页改为 action 调用，不再直接 PUT `status=draft`。
4. 编辑页支持 withdrawn/archived 只读。
5. 补 API 测试。

### Phase 3：头图

1. 扩展 upload API 支持 article。
2. 新增文章封面图页面。
3. 新建/编辑页显示封面图入口和状态。
4. 补 upload 测试。

### Phase 4：批量

1. 列表页 checkbox 和批量工具条。
2. 新增 bulk API。
3. 补批量测试和 e2e。

### Phase 5：表单收口和恢复体验

1. 默认 4 字段。
2. 更多设置折叠。
3. dirty tracking + beforeunload。
4. 会话过期和保存失败细化提示。

---

## 14. 完成定义

- `npm run lint` 无新增 error。
- 文章相关 vitest 全部通过。
- `npm run build` 通过。
- `/admin/articles` 不再因分类接口异常崩溃。
- `published -> draft` 不再存在。
- `withdrawn` 全链路可创建、筛选、撤回、重新发布。
- `/api/upload` 支持 article 封面图，并且 store 现有上传行为不回归。
- editor 无法删除文章。
- 公开 `/news` 永远只显示 published。
