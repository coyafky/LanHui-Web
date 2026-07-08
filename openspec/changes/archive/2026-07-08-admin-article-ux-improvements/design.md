## Context

当前文章后台新建/编辑页各自内联了完整的表单 UI，存在约 200 行重复代码。`ArticleEditor.tsx` 是早期抽取的共享组件但从未被引用（死代码）。表单提交前无客户端校验，直接调用 API 等服务端 Zod 校验结果。编辑页无 dirty 状态追踪，离开页面无确认提示。文章列表页的发布/撤回/归档/删除/批量操作全部使用原生 `confirm()`。

`ConfirmDialog` 组件已存在，支持 `variant="danger"` 和异步 `onConfirm`，但未被文章模块使用。

## Goals / Non-Goals

**Goals:**
- 统一新建/编辑文章表单为 `ArticleForm` 共享组件
- 提交前执行客户端 Zod 校验，字段级错误展示
- 编辑/新建页增加未保存离开保护
- 文章列表所有操作从 `confirm()` 迁移到 `ConfirmDialog`

**Non-Goals:**
- 不改文章数据库模型
- 不改 `/api/articles` 状态流转逻辑和响应格式
- 不修改 `ConfirmDialog` 组件本身
- 不修复 pre-existing 问题

## Decisions

### 1. `ArticleForm` 替代 `ArticleEditor`

`ArticleEditor.tsx` 未被任何文件引用，且缺乏字段校验、错误展示、dirty 状态能力。新建 `ArticleForm` 作为受控组件，由父页面管理所有状态和副作用。

**备选方案**: 扩展 `ArticleEditor` — 但它的接口设计（props 透传每个字段的 value/onChange）不利于集中校验，且缺少 dirty 追踪、错误展示等能力。新建更干净。

### 2. 客户端校验复用 ArticleCreateSchema

`validations/article.ts` 已有 `ArticleCreateSchema`（Zod）。客户端调用 `safeParse` 执行校验，将 `fieldErrors` 映射到表单字段。发布状态额外检查 category 不为空。

规则:
- title/content 必填
- slug 可选填写但只允许 `[a-z0-9-]`
- excerpt 最多 300 字
- 状态为 `published` 时 category 必填
- tags 自动 trim/去空/去重
- featuredImage 需匹配 `/images/articles/*.webp`

**备选方案**: 新建独立客户端 schema — 会与 API schema 漂移，维护两套规则。

### 3. 离开保护实现

`use-unsaved-changes-guard` hook 提供三层保护:
1. `beforeunload` 事件 — 覆盖浏览器刷新/关闭 tab
2. 全局 `<a>` 点击捕获 — 拦截同源链接跳转（排除 target="_blank"/download/修饰键/hash 跳转）
3. `confirmLeave(callback)` — 供 `router.push` 场景使用

通过 `window.addEventListener('beforeunload', ...)` 注册，dirty=false 时自动移除。保存中 (`saving=true`) 跳过拦截。

**备选方案**: Next.js `useRouter` 的 `beforePopState` + `routeChangeStart` — 只能拦截路由内导航，不能拦截浏览器刷新和外部链接。

### 4. confirm() → ConfirmDialog

文章列表页有 3 处 `confirm()`: 单篇操作 (`handleArticleAction`)、批量操作 (`handleBulkAction`)、删除 (`handleDelete`)。

使用 `PendingArticleConfirm` 联合类型管理确认状态：

```ts
type PendingArticleConfirm =
  | { type: "single"; article: Article; action: ArticleAction }
  | { type: "delete"; article: Article }
  | { type: "bulk"; action: "publish" | "withdraw" | "archive" | "delete"; ids: string[] }
  | null;
```

点击操作时设置 pending，`ConfirmDialog` 根据 pending 类型生成对应文案。确认后执行 API 调用，成功后清空 pending 并刷新列表。

置顶/取消置顶跳过确认，直接调用 API。

### 5. 新建/编辑页改为使用 ArticleForm

- `new/page.tsx`: 状态管理保留在页面层（title/slug/content 等），传给 `ArticleForm`；提交前调 `validateArticleForm()`；成功后 `router.push("/admin/articles")`
- `[id]/page.tsx`: 加载文章后设 initial snapshot；`ArticleForm` 变化后对比 snapshot 判定 dirty；保存成功后更新 snapshot

## Risks / Trade-offs

- **ArticleEditor 删除风险**: 需确认零引用。已验证 `grep -r "ArticleEditor" src/` 零匹配 — 安全。
- **离开保护误拦**: 站内链接捕获可能误拦某些导航。通过排除修饰键点击、target="_blank"、download、hash 跳转来最小化风险。
- **浏览器后退拦截**: 仅 best-effort（beforeunload 可被浏览器策略限制）。不覆盖 SPA 后退，因 Next.js App Router 的 `beforePopState` 支持有限。
- **Tests 环境**: pages 级测试可能因 `useSearchParams` 等 Next.js hooks 需额外 mock。降级策略：至少保证 hook 和 validation 单测通过，pages 测试用 Playwright 手动验收。
